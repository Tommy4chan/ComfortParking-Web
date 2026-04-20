<?php

namespace App\Observers;

use App\Models\ChildDevice;
use App\Services\TelemetryService;

class ChildDeviceObserver
{
    /**
     * Handle the ChildDevice "saved" event.
     */
    public function saved(ChildDevice $childDevice): void
    {
        app(TelemetryService::class)->recordSnapshot();
    }
}
