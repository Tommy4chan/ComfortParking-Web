<?php

namespace App\Http\Controllers;

use App\Models\ChildDevice;
use App\Models\Device;
use App\Models\ParkingZone;
use App\Models\DeviceTelemetryHourly;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $zones = ParkingZone::withParkingStats()->get();

        $topLoadedZones = $zones->map(function ($zone) {
            $total = (int) ($zone->total_spots ?? 0);
            $used = (int) ($zone->used_spots ?? 0);
            $available = max(0, $total - $used);
            $occupancy = $total > 0 ? round(($used / $total) * 100) : 0;

            return [
                'id' => $zone->id,
                'zone' => $zone->title,
                'total' => $total,
                'used' => $used,
                'available' => $available,
                'occupancy' => $occupancy,
            ];
        })->sortByDesc('occupancy')->take(6)->values();

        $devices = Device::all();
        $childDevices = ChildDevice::with('device')->get();

        $deviceAlerts = [];
        $healthStats = [
            'online' => 0,
            'warning' => 0,
            'low_battery' => 0,
            'offline' => 0,
        ];

        foreach ($devices as $device) {
            $status = $device->status;
            $healthStats[$status]++;

            if ($status !== 'online') {
                $deviceAlerts[] = [
                    'id' => 'dev-'.$device->id,
                    'device_id' => $device->id,
                    'type' => 'device',
                    'source' => $device->title,
                    'severity' => $status === 'offline' ? 'error' : 'warning',
                    'kind' => $status === 'low_battery' ? 'low_battery' : ($status === 'offline' ? 'offline' : 'heartbeat_missing'),
                    'message' => $this->getAlertMessage($status, $device),
                    'since' => $device->last_reported_at ? $device->last_reported_at->diffForHumans() : 'Never',
                ];
            }
        }

        $childDeviceAlerts = [];
        foreach ($childDevices as $child) {
            $status = $child->status;
            $healthStats[$status]++;

            if ($status !== 'online') {
                $childDeviceAlerts[] = [
                    'id' => 'child-'.$child->id,
                    'device_id' => $child->device_id,
                    'child_id' => $child->id,
                    'type' => 'child',
                    'source' => ($child->device ? $child->device->title : 'Unknown Device').' (Child #'.$child->id.')',
                    'severity' => $status === 'offline' ? 'error' : 'warning',
                    'kind' => $status === 'low_battery' ? 'low_battery' : ($status === 'offline' ? 'offline' : 'heartbeat_missing'),
                    'message' => $this->getAlertMessage($status, $child),
                    'since' => $child->last_reported_at ? $child->last_reported_at->diffForHumans() : 'Never',
                ];
            }
        }

        $totalSpots = $zones->sum('total_spots');
        $usedSpots = $zones->sum('used_spots');

        $range = request('range', '24h');
        
        $hoursBack = 24;
        if ($range === '7d') $hoursBack = 24 * 7;
        // 30d option removed as per user request

        $telemetry = DeviceTelemetryHourly::where('scope', 'system')
            ->where('hour_bucket', '>=', now()->subHours($hoursBack))
            ->orderBy('hour_bucket', 'asc')
            ->get()
            ->map(function ($t) use ($totalSpots, $range) {
                $format = $range === '24h' ? 'H:00' : 'd M H:00';
                return [
                    'hour' => $t->hour_bucket->format($format),
                    'usedSpots' => round($t->avg_used_spots),
                    'freeSpots' => max(0, $totalSpots - round($t->avg_used_spots)),
                    'online' => round($t->online_device_minutes / 60), 
                    'warning' => 0, 
                    'offline' => round($t->offline_device_minutes / 60),
                    'arrivals' => $t->total_arrivals,
                    'departures' => $t->total_departures,
                ];
            });

        return Inertia::render('dashboard', [
            'topLoadedZones' => $topLoadedZones,
            'deviceAlerts' => $deviceAlerts,
            'childDeviceAlerts' => $childDeviceAlerts,
            'healthStats' => [
                ['name' => 'Online', 'value' => $healthStats['online'], 'color' => '#34D399'],
                ['name' => 'Warning', 'value' => $healthStats['warning'], 'color' => '#FBBF24'],
                ['name' => 'Low Battery', 'value' => $healthStats['low_battery'], 'color' => '#F97316'],
                ['name' => 'Offline', 'value' => $healthStats['offline'], 'color' => '#FB7185'],
            ],
            'usageStats' => [
                'total' => $totalSpots,
                'used' => $usedSpots,
                'free' => max(0, $totalSpots - $usedSpots),
            ],
            'zoneOccupancyList' => $topLoadedZones->take(10), // up to 10 for bar chart
            'telemetry24h' => $telemetry,
            'currentRange' => $range,
        ]);
    }

    private function getAlertMessage(string $status, $model): string
    {
        if ($status === 'offline') {
            return 'Device is completely offline. '.($model->last_reported_at ? 'Last seen '.$model->last_reported_at->diffForHumans().'.' : 'Never reported.');
        }
        if ($status === 'low_battery') {
            return 'Battery level is critical ('.number_format($model->battery_voltage / 1000, 2).'V). Needs replacement soon.';
        }

        return 'Device is experiencing connectivity warnings or delayed heartbeats.';
    }
}
