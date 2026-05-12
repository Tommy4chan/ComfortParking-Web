<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Models\DeviceTelemetryHourly;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use App\Models\ParkingZone;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AggregateTelemetry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telemetry:aggregate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Aggregate raw device telemetry snapshots into hourly rollups';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Starting telemetry aggregation...');

        $bucketMinutes = 15;

        // Determine the start of the aggregation window.
        // Resume from the latest already-aggregated bucket (minus 1 hour overlap for safety),
        // so we never re-process the entire history on every run.
        $latestAggregated = DeviceTelemetryHourly::where('scope', 'device')
            ->max('hour_bucket');

        if ($latestAggregated) {
            // Re-process the last 1 hour to catch any snapshots that arrived late.
            $startBucket = $this->floorToBucket(
                Carbon::parse($latestAggregated)->subHour(),
                $bucketMinutes
            );
            $this->info("Resuming from {$startBucket} (latest aggregated: {$latestAggregated}).");
        } else {
            // First run: start from the oldest snapshot.
            $oldestSnapshot = DeviceTelemetrySnapshot::orderBy('recorded_at', 'asc')->first();
            if (! $oldestSnapshot) {
                $this->info('No snapshots found — nothing to aggregate.');

                return;
            }
            $startBucket = $this->floorToBucket($oldestSnapshot->recorded_at, $bucketMinutes);
            $this->info("First run, starting from oldest snapshot: {$startBucket}.");
        }

        $endBucket = $this->floorToBucket(Carbon::now(), $bucketMinutes);
        $currentBucket = $startBucket->copy();

        $processed = 0;
        while ($currentBucket <= $endBucket) {
            $nextBucket = $currentBucket->copy()->addMinutes($bucketMinutes);

            $this->aggregateDeviceLevel($currentBucket, $nextBucket);
            $this->aggregateZoneLevel($currentBucket, $nextBucket);
            $this->aggregateSystemLevel($currentBucket, $nextBucket);

            $currentBucket->addMinutes($bucketMinutes);
            $processed++;
        }

        $this->info("Processed {$processed} buckets.");

        // Prune raw snapshots older than 7 days.
        $pruned = DeviceTelemetrySnapshot::where('recorded_at', '<', Carbon::now()->subDays(7))->delete();
        $this->info("Pruned {$pruned} old snapshots.");

        $this->info('Telemetry aggregation complete.');
    }

    private function aggregateDeviceLevel(Carbon $start, Carbon $end)
    {
        $bucketMinutes = $start->diffInMinutes($end, true);
        $devices = Device::all();
        foreach ($devices as $device) {
            $snapshots = DeviceTelemetrySnapshot::where('device_id', $device->id)
                ->whereBetween('recorded_at', [$start, $end])
                ->get();

            if ($snapshots->isEmpty()) {
                $totalSpots = $device->parking_spots_count ?? 0;
                $usedSpots = $device->used_parking_spots ?? 0;
                $avgOccupancy = $totalSpots > 0 ? ($usedSpots / $totalSpots) * 100 : 0;
                $status = $this->getStatusAt(
                    $device->last_reported_at,
                    $device->battery_voltage,
                    $end
                );

                DeviceTelemetryHourly::updateOrCreate(
                    [
                        'scope' => 'device',
                        'device_id' => $device->id,
                        'parking_zone_id' => $device->parking_zone_id,
                        'hour_bucket' => $start,
                    ],
                    [
                        'avg_used_spots' => $usedSpots,
                        'max_used_spots' => $usedSpots,
                        'min_used_spots' => $usedSpots,
                        'avg_occupancy_pct' => $avgOccupancy,
                        'total_arrivals' => 0,
                        'total_departures' => 0,
                        'avg_response_time_ms' => null,
                        'online_device_minutes' => $status === 'online' ? $bucketMinutes : 0,
                        'offline_device_minutes' => $status === 'offline' ? $bucketMinutes : 0,
                    ]
                );

                continue;
            }

            $arrivals = ParkingEvent::where('device_id', $device->id)
                ->where('event_type', 'arrival')
                ->whereBetween('occurred_at', [$start, $end])
                ->count();

            $departures = ParkingEvent::where('device_id', $device->id)
                ->where('event_type', 'departure')
                ->whereBetween('occurred_at', [$start, $end])
                ->count();

            $avgUsed = $snapshots->avg('used_spots');
            $totalSpots = $snapshots->first()->total_spots;
            $avgOccupancy = $totalSpots > 0 ? ($avgUsed / $totalSpots) * 100 : 0;

            [$onlineMinutes, $offlineMinutes] = $this->calculateOnlineOfflineMinutes($snapshots, $bucketMinutes);

            DeviceTelemetryHourly::updateOrCreate(
                [
                    'scope' => 'device',
                    'device_id' => $device->id,
                    'parking_zone_id' => $device->parking_zone_id,
                    'hour_bucket' => $start,
                ],
                [
                    'avg_used_spots' => $avgUsed,
                    'max_used_spots' => $snapshots->max('used_spots'),
                    'min_used_spots' => $snapshots->min('used_spots'),
                    'avg_occupancy_pct' => $avgOccupancy,
                    'total_arrivals' => $arrivals,
                    'total_departures' => $departures,
                    'avg_response_time_ms' => $snapshots->avg('response_time_ms'),
                    'online_device_minutes' => $onlineMinutes,
                    'offline_device_minutes' => $offlineMinutes,
                ]
            );
        }
    }

    private function calculateOnlineOfflineMinutes($snapshots, int $bucketMinutes): array
    {
        $total = max(1, $snapshots->count());
        $onlineCount = $snapshots->where('status', 'online')->count();
        $offlineCount = $snapshots->where('status', 'offline')->count();

        $onlineMinutes = (int) round(($onlineCount / $total) * $bucketMinutes);
        $offlineMinutes = (int) round(($offlineCount / $total) * $bucketMinutes);

        $onlineMinutes = min($bucketMinutes, max(0, $onlineMinutes));
        $offlineMinutes = min($bucketMinutes, max(0, $offlineMinutes));

        return [$onlineMinutes, $offlineMinutes];
    }

    private function aggregateZoneLevel(Carbon $start, Carbon $end)
    {
        $zones = ParkingZone::all();
        foreach ($zones as $zone) {
            $deviceAggs = DeviceTelemetryHourly::where('scope', 'device')
                ->where('parking_zone_id', $zone->id)
                ->where('hour_bucket', $start)
                ->get();

            if ($deviceAggs->isEmpty()) {
                continue;
            }

            $totalAvgUsed = $deviceAggs->sum('avg_used_spots');
            $totalMaxUsed = $deviceAggs->sum('max_used_spots'); // simplistic approximation
            $totalMinUsed = $deviceAggs->sum('min_used_spots');

            // Re-calculate real avg occupancy from raw snapshots to be accurate
            $snapshots = DeviceTelemetrySnapshot::where('parking_zone_id', $zone->id)
                ->whereBetween('recorded_at', [$start, $end])
                ->get();

            // Prefer snapshot-based occupancy when available; fall back to device rollups.
            if ($snapshots->isEmpty()) {
                $avgOccupancy = $deviceAggs->avg('avg_occupancy_pct');
            } else {
                $avgOccupancy = $snapshots->avg(function ($s) {
                    return $s->total_spots > 0 ? ($s->used_spots / $s->total_spots) * 100 : 0;
                });
            }

            DeviceTelemetryHourly::updateOrCreate(
                [
                    'scope' => 'zone',
                    'device_id' => null,
                    'parking_zone_id' => $zone->id,
                    'hour_bucket' => $start,
                ],
                [
                    'avg_used_spots' => $totalAvgUsed,
                    'max_used_spots' => $totalMaxUsed,
                    'min_used_spots' => $totalMinUsed,
                    'avg_occupancy_pct' => $avgOccupancy,
                    'total_arrivals' => $deviceAggs->sum('total_arrivals'),
                    'total_departures' => $deviceAggs->sum('total_departures'),
                    'avg_response_time_ms' => $deviceAggs->avg('avg_response_time_ms'),
                    'online_device_minutes' => $deviceAggs->sum('online_device_minutes'),
                    'offline_device_minutes' => $deviceAggs->sum('offline_device_minutes'),
                ]
            );
        }
    }

    private function aggregateSystemLevel(Carbon $start, Carbon $end)
    {
        $zoneAggs = DeviceTelemetryHourly::where('scope', 'zone')
            ->where('hour_bucket', $start)
            ->get();

        if ($zoneAggs->isEmpty()) {
            return;
        }

        DeviceTelemetryHourly::updateOrCreate(
            [
                'scope' => 'system',
                'device_id' => null,
                'parking_zone_id' => null,
                'hour_bucket' => $start,
            ],
            [
                'avg_used_spots' => $zoneAggs->sum('avg_used_spots'),
                'max_used_spots' => $zoneAggs->sum('max_used_spots'),
                'min_used_spots' => $zoneAggs->sum('min_used_spots'),
                'avg_occupancy_pct' => $zoneAggs->avg('avg_occupancy_pct'), // Average of averages is fine for system overview
                'total_arrivals' => $zoneAggs->sum('total_arrivals'),
                'total_departures' => $zoneAggs->sum('total_departures'),
                'avg_response_time_ms' => $zoneAggs->avg('avg_response_time_ms'),
                'online_device_minutes' => $zoneAggs->sum('online_device_minutes'),
                'offline_device_minutes' => $zoneAggs->sum('offline_device_minutes'),
            ]
        );
    }

    private function getStatusAt(?Carbon $lastReportedAt, ?int $batteryVoltage, Carbon $asOf): string
    {
        if (! $lastReportedAt) {
            return 'offline';
        }

        $minutesSinceReport = $asOf->diffInMinutes($lastReportedAt, true);

        if ($minutesSinceReport > 60) {
            return 'offline';
        }

        if ($batteryVoltage !== null && $batteryVoltage < 3100) {
            return 'warning';
        }

        if ($minutesSinceReport > 30) {
            return 'warning';
        }

        return 'online';
    }

    private function floorToBucket(Carbon $time, int $minutes): Carbon
    {
        $bucket = $time->copy()->second(0)->microsecond(0);
        $minute = (int) $bucket->minute;
        $bucketMinute = intdiv($minute, $minutes) * $minutes;

        return $bucket->minute($bucketMinute);
    }
}
