<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Models\ChildDevice;
use Illuminate\Console\Command;

class SimulateLiveTraffic extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simulate:live-traffic {--interval=5 : Seconds between updates}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulates live parking lot traffic and device heartbeats to test the real-time dashboard.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Live Traffic Simulator...');
        $this->info('Press Ctrl+C to stop.');
        $interval = (int) $this->option('interval');

        while (true) {
            // Pick a random master device to receive a "heartbeat"
            $device = Device::inRandomOrder()->first();

            if ($device) {
                $spots = $device->used_parking_spots;
                $maxSpots = $device->parking_spots_count;
                
                // 30% chance a car arrives or leaves
                if (rand(1, 100) <= 30) {
                    if (rand(0, 1) && $spots < $maxSpots) {
                        $device->used_parking_spots++;
                        $this->line("<fg=green>🚗 Car Arrived at {$device->title} (Now: {$device->used_parking_spots}/{$maxSpots})</>");
                    } elseif ($spots > 0) {
                        $device->used_parking_spots--;
                        $this->line("<fg=yellow>💨 Car Departed from {$device->title} (Now: {$device->used_parking_spots}/{$maxSpots})</>");
                    }
                }

                // 2% chance battery drops to critical (simulation)
                if (rand(1, 100) <= 2) {
                    $device->battery_voltage = rand(3100, 3350);
                    $this->error("🔋 {$device->title} battery dropped to critical!");
                } elseif (rand(1, 100) <= 10 && $device->battery_voltage < 3500) {
                    // Automatically "replace" battery
                    $device->battery_voltage = rand(3900, 4200);
                    $this->info("🔧 {$device->title} battery was replaced.");
                }

                $device->last_reported_at = now();
                $device->save();
            }

            // 50% chance a child device heartbeats
            if (rand(0, 1)) {
                $child = ChildDevice::inRandomOrder()->first();
                if ($child) {
                    // 10% chance spot flips
                    if (rand(1, 100) <= 10) {
                        $child->is_spot_used = !$child->is_spot_used;
                        $status = $child->is_spot_used ? 'Taken' : 'Freed';
                        $this->line("<fg=cyan>📍 Child Sensor {$child->id} spot was {$status}</>");
                    }
                    $child->last_reported_at = now();
                    $child->save();
                }
            }

            sleep($interval);
        }
    }
}
