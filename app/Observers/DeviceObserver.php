<?php

namespace App\Observers;

use App\Models\Device;
use App\Services\TelemetryService;

class DeviceObserver
{
    /**
     * Handle the Device "saved" event.
     */
    public function saved(Device $device): void
    {
        $arrivals = 0;
        $departures = 0;

        if ($device->isDirty('used_parking_spots')) {
            $original = $device->getOriginal('used_parking_spots') ?? 0;
            $new = $device->used_parking_spots ?? 0;
            $delta = $new - $original;

            if ($delta > 0) {
                $arrivals = $delta;
            } elseif ($delta < 0) {
                $departures = abs($delta);
            }
        }

        app(TelemetryService::class)->recordSnapshot($arrivals, $departures);
    }
}
