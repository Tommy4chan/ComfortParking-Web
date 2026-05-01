<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Models\DeviceTelemetryHourly;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use App\Models\ParkingZone;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

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
    public function handle()
    {
        $this->info('Starting telemetry aggregation...');
        
        // Find the earliest snapshot that hasn't been aggregated yet, or just re-aggregate the last 2 hours to be safe
        // For this seeder/demo, we'll just aggregate everything that exists in snapshots
        
        $oldestSnapshot = DeviceTelemetrySnapshot::orderBy('recorded_at', 'asc')->first();
        if (!$oldestSnapshot) {
            $this->info('No snapshots found.');
            return;
        }

        $startHour = $oldestSnapshot->recorded_at->startOfHour();
        $endHour = Carbon::now()->startOfHour();

        $currentHour = $startHour->copy();
        
        while ($currentHour <= $endHour) {
            $nextHour = $currentHour->copy()->addHour();
            
            // 1. Device-level aggregation
            $this->aggregateDeviceLevel($currentHour, $nextHour);
            
            // 2. Zone-level aggregation
            $this->aggregateZoneLevel($currentHour, $nextHour);
            
            // 3. System-level aggregation
            $this->aggregateSystemLevel($currentHour, $nextHour);
            
            $currentHour->addHour();
        }
        
        // Prune raw snapshots older than 7 days
        $pruned = DeviceTelemetrySnapshot::where('recorded_at', '<', Carbon::now()->subDays(7))->delete();
        $this->info("Pruned $pruned old snapshots.");
        
        $this->info('Telemetry aggregation complete.');
    }

    private function aggregateDeviceLevel(Carbon $start, Carbon $end)
    {
        $devices = Device::all();
        foreach ($devices as $device) {
            $snapshots = DeviceTelemetrySnapshot::where('device_id', $device->id)
                ->whereBetween('recorded_at', [$start, $end])
                ->get();
                
            if ($snapshots->isEmpty()) continue;

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

            $onlineMinutes = $snapshots->where('status', 'online')->count() * 5; // approx assuming 5 min intervals
            $offlineMinutes = $snapshots->where('status', 'offline')->count() * 5;

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

    private function aggregateZoneLevel(Carbon $start, Carbon $end)
    {
        $zones = ParkingZone::all();
        foreach ($zones as $zone) {
            $deviceAggs = DeviceTelemetryHourly::where('scope', 'device')
                ->where('parking_zone_id', $zone->id)
                ->where('hour_bucket', $start)
                ->get();
                
            if ($deviceAggs->isEmpty()) continue;

            $totalAvgUsed = $deviceAggs->sum('avg_used_spots');
            $totalMaxUsed = $deviceAggs->sum('max_used_spots'); // simplistic approximation
            $totalMinUsed = $deviceAggs->sum('min_used_spots');
            
            // Re-calculate real avg occupancy from raw snapshots to be accurate
            $snapshots = DeviceTelemetrySnapshot::where('parking_zone_id', $zone->id)
                ->whereBetween('recorded_at', [$start, $end])
                ->get();
                
            if ($snapshots->isEmpty()) continue;
            
            // Group by time roughly (we can average all snapshots for the zone)
            $avgOccupancy = $snapshots->avg(function ($s) {
                return $s->total_spots > 0 ? ($s->used_spots / $s->total_spots) * 100 : 0;
            });

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
            
        if ($zoneAggs->isEmpty()) return;

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
}


