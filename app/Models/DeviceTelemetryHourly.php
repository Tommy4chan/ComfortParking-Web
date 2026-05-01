<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceTelemetryHourly extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'hour_bucket' => 'datetime',
        'avg_used_spots' => 'float',
        'avg_occupancy_pct' => 'float',
        'avg_response_time_ms' => 'float',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function parkingZone()
    {
        return $this->belongsTo(ParkingZone::class);
    }
}
