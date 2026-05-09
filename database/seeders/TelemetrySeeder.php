<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TelemetrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $devices = Device::with(['childDevices', 'parkingZone'])->get();
        $now = Carbon::now();
        $daysToSeed = 7;

        $totalSnapshots = 0;
        $totalEvents = 0;

        $snapshots = [];
        $events = [];
        $batchSize = 500;

        foreach ($devices as $device) {
            $childDevices = $device->childDevices;
            $zone = $device->parkingZone;

            if (! $zone) {
                continue;
            }

            $totalSpots = $device->total_parking_spots;

            if ($totalSpots === 0) {
                continue;
            }

            for ($daysBack = $daysToSeed; $daysBack >= 0; $daysBack--) {
                for ($hour = 0; $hour < 24; $hour++) {
                    if ($daysBack === 0 && $hour > $now->hour) {
                        break;
                    }

                    for ($minute = 0; $minute < 60; $minute += 5) {
                        if ($daysBack === 0 && $hour === $now->hour && $minute > $now->minute) {
                            break;
                        }

                        $recordedAt = Carbon::now()->subDays($daysBack)->startOfDay()->addHours($hour)->addMinutes($minute);

                        $morningPeak = sin((($hour - 7) / 24) * M_PI * 2) * 0.4;
                        $eveningPeak = sin((($hour - 17) / 24) * M_PI * 2) * 0.3;
                        $baseLoad = 0.3;
                        $occupancyProbability = max(0.1, min(0.9, $baseLoad + $morningPeak + $eveningPeak));
                        $occupancyProbability += (rand(-10, 10) / 100);
                        $occupancyProbability = max(0, min(1, $occupancyProbability));

                        $usedSpots = round($totalSpots * $occupancyProbability);
                        $batteryVoltage = 4200 - (($daysToSeed - $daysBack) * 20);

                        $status = 'online';
                        if (rand(1, 100) > 95) {
                            $status = 'warning';
                        }
                        if (rand(1, 100) > 98) {
                            $status = 'offline';
                        }

                        $snapshots[] = [
                            'device_id' => $device->id,
                            'parking_zone_id' => $zone->id,
                            'recorded_at' => $recordedAt,
                            'used_spots' => $usedSpots,
                            'total_spots' => $totalSpots,
                            'battery_voltage_mv' => $batteryVoltage,
                            'status' => $status,
                            'response_time_ms' => rand(50, 300),
                            'online_child_count' => $totalSpots,
                            'offline_child_count' => 0,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];

                        if (count($snapshots) >= $batchSize) {
                            DeviceTelemetrySnapshot::insert($snapshots);
                            $totalSnapshots += count($snapshots);
                            $snapshots = [];
                        }

                        if ($childDevices->isNotEmpty() && rand(1, 10) > 5) {
                            $child = $childDevices->random();
                            $events[] = [
                                'child_device_id' => $child->id,
                                'device_id' => $device->id,
                                'parking_zone_id' => $zone->id,
                                'event_type' => 'arrival',
                                'occurred_at' => (clone $recordedAt)->addSeconds(rand(10, 290)),
                                'previous_state' => false,
                                'new_state' => true,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }

                        if ($childDevices->isNotEmpty() && rand(1, 10) > 6) {
                            $child = $childDevices->random();
                            $events[] = [
                                'child_device_id' => $child->id,
                                'device_id' => $device->id,
                                'parking_zone_id' => $zone->id,
                                'event_type' => 'departure',
                                'occurred_at' => (clone $recordedAt)->addSeconds(rand(10, 290)),
                                'previous_state' => true,
                                'new_state' => false,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }

                        if (count($events) >= $batchSize) {
                            ParkingEvent::insert($events);
                            $totalEvents += count($events);
                            $events = [];
                        }
                    }
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

        $this->command->info("Generated $totalSnapshots snapshots and $totalEvents events.");

        // Run aggregation command to populate hourlies
        $this->command->info('Running telemetry aggregation...');
        \Illuminate\Support\Facades\Artisan::call('telemetry:aggregate');
        $this->command->info('Aggregation complete.');
    }
}
