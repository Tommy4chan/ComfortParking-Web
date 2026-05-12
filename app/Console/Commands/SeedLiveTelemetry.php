<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SeedLiveTelemetry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telemetry:seed-live
        {--hours=6 : Hours of data to generate}
        {--from-latest : Start from each device\'s latest snapshot time}
        {--interval=5 : Minutes between snapshots}
        {--jitter=2 : Max spot delta per interval}
        {--no-events : Skip creating arrival/departure events}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate recent telemetry snapshots for existing devices to make the system appear live.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hours = max(1, (int) $this->option('hours'));
        $interval = max(1, (int) $this->option('interval'));
        $jitter = max(0, (int) $this->option('jitter'));
        $now = Carbon::now();
        $windowStart = $now->copy()->subHours($hours);

        $devices = Device::with(['childDevices', 'parkingZone'])->get();

        $totalSnapshots = 0;
        $totalEvents = 0;

        $snapshots = [];
        $events = [];
        $batchSize = 500;

        foreach ($devices as $device) {
            $zone = $device->parkingZone;
            if (! $zone) {
                continue;
            }

            $totalSpots = $device->parking_spots_count ?? 0;
            if ($totalSpots <= 0) {
                continue;
            }

            $latestSnapshotAt = DeviceTelemetrySnapshot::where('device_id', $device->id)
                ->max('recorded_at');

            $startAt = $windowStart->copy();
            if ($latestSnapshotAt) {
                $latest = Carbon::parse($latestSnapshotAt);
                if ($this->option('from-latest')) {
                    $startAt = $latest->copy()->addMinutes($interval);
                } elseif ($latest->greaterThan($startAt)) {
                    $startAt = $latest->copy()->addMinutes($interval);
                }
            }

            $cursor = $startAt->copy()->second(0);

            $usedSpots = $device->used_parking_spots ?? rand(0, $totalSpots);
            $usedSpots = max(0, min($totalSpots, (int) $usedSpots));
            $batteryVoltage = $device->battery_voltage ?? rand(3600, 4200);

            $childDevices = $device->childDevices;
            $childCount = $childDevices->count();
            $onlineChildCount = $childCount > 0 ? $childCount : $totalSpots;
            $offlineChildCount = 0;

            while ($cursor <= $now) {
                $previousUsed = $usedSpots;
                if ($jitter > 0 && rand(1, 100) <= 40) {
                    $usedSpots += rand(-$jitter, $jitter);
                    $usedSpots = max(0, min($totalSpots, $usedSpots));
                }

                $status = 'online';
                if (rand(1, 100) > 97) {
                    $status = 'warning';
                }

                $snapshots[] = [
                    'device_id' => $device->id,
                    'parking_zone_id' => $zone->id,
                    'recorded_at' => $cursor->copy(),
                    'used_spots' => $usedSpots,
                    'total_spots' => $totalSpots,
                    'battery_voltage_mv' => $batteryVoltage,
                    'status' => $status,
                    'response_time_ms' => rand(50, 250),
                    'online_child_count' => $onlineChildCount,
                    'offline_child_count' => $offlineChildCount,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (! $this->option('no-events') && $usedSpots !== $previousUsed) {
                    $delta = $usedSpots - $previousUsed;
                    $eventType = $delta > 0 ? 'arrival' : 'departure';
                    $count = abs($delta);

                    for ($i = 0; $i < $count; $i++) {
                        $child = $device->childDevices->isNotEmpty()
                            ? $device->childDevices->random()
                            : null;

                        $events[] = [
                            'child_device_id' => $child?->id,
                            'device_id' => $device->id,
                            'parking_zone_id' => $zone->id,
                            'event_type' => $eventType,
                            'occurred_at' => $cursor->copy()->addSeconds(rand(5, max(5, ($interval * 60) - 5))),
                            'previous_state' => $eventType === 'arrival' ? false : true,
                            'new_state' => $eventType === 'arrival' ? true : false,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }

                if (count($snapshots) >= $batchSize) {
                    DeviceTelemetrySnapshot::insert($snapshots);
                    $totalSnapshots += count($snapshots);
                    $snapshots = [];
                }

                if (count($events) >= $batchSize) {
                    ParkingEvent::insert($events);
                    $totalEvents += count($events);
                    $events = [];
                }

                $cursor->addMinutes($interval);
            }

            $device->used_parking_spots = $usedSpots;
            $device->battery_voltage = $batteryVoltage;
            $device->last_reported_at = $now;
            $device->save();

            if ($childCount > 0) {
                $childBatteryVoltage = max(3100, min(4200, $batteryVoltage + rand(-150, 150)));
                $usedChildCount = min($usedSpots, $childCount);
                $childIds = $childDevices->pluck('id')->all();
                shuffle($childIds);
                $usedChildIds = array_slice($childIds, 0, $usedChildCount);
                $freeChildIds = array_slice($childIds, $usedChildCount);

                if (! empty($usedChildIds)) {
                    $device->childDevices()->whereIn('id', $usedChildIds)->update([
                        'last_reported_at' => $now,
                        'battery_voltage' => $childBatteryVoltage,
                        'is_spot_used' => true,
                    ]);
                }

                if (! empty($freeChildIds)) {
                    $device->childDevices()->whereIn('id', $freeChildIds)->update([
                        'last_reported_at' => $now,
                        'battery_voltage' => $childBatteryVoltage,
                        'is_spot_used' => false,
                    ]);
                }
            }
        }

        if (! empty($snapshots)) {
            DeviceTelemetrySnapshot::insert($snapshots);
            $totalSnapshots += count($snapshots);
        }

        if (! empty($events)) {
            ParkingEvent::insert($events);
            $totalEvents += count($events);
        }

        $this->info("Generated {$totalSnapshots} snapshots and {$totalEvents} events.");

        $this->info('Running telemetry aggregation...');
        Artisan::call('telemetry:aggregate');
        $this->info('Aggregation complete.');

        return Command::SUCCESS;
    }
}
