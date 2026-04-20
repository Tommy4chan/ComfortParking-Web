<?php

namespace App\Services;

use App\Models\ChildDevice;
use App\Models\Device;
use App\Models\SystemTelemetry;

class TelemetryService
{
    /**
     * Snapshots current device states and updates the telemetry table in real-time.
     */
    public function recordSnapshot(int $arrivals = 0, int $departures = 0): void
    {
        $devices = Device::all();
        $childDevices = ChildDevice::all();

        $totalSpots = 0;
        $usedSpots = 0;
        
        $online = 0;
        $warning = 0;
        $lowBattery = 0;
        $offline = 0;

        // Tally all Master Devices
        foreach ($devices as $device) {
            $totalSpots += $device->parking_spots_count ?? 0;
            $usedSpots += $device->used_parking_spots ?? 0;

            $status = $device->status;
            if ($status === 'online') $online++;
            elseif ($status === 'warning') $warning++;
            elseif ($status === 'low_battery') $lowBattery++;
            elseif ($status === 'offline') $offline++;
        }

        // Tally all Child Devices for Health
        foreach ($childDevices as $child) {
            $status = $child->status;
            if ($status === 'online') $online++;
            elseif ($status === 'warning') $warning++;
            elseif ($status === 'low_battery') $lowBattery++;
            elseif ($status === 'offline') $offline++;
        }

        $freeSpots = max(0, $totalSpots - $usedSpots);

        // Update the current hour's telemetry row
        $telemetry = SystemTelemetry::firstOrNew(
            ['recorded_at' => now()->startOfHour()]
        );

        $telemetry->used_spots = $usedSpots;
        $telemetry->free_spots = $freeSpots;
        
        if (!$telemetry->exists) {
            $telemetry->arrivals = 0;
            $telemetry->departures = 0;
        }

        if ($arrivals > 0) {
            $telemetry->arrivals += $arrivals;
        }
        if ($departures > 0) {
            $telemetry->departures += $departures;
        }

        $telemetry->online_devices = $online;
        $telemetry->warning_devices = $warning + $lowBattery;
        $telemetry->offline_devices = $offline;

        $telemetry->save();
    }
}
