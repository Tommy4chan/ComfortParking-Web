<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceTelemetrySnapshot extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'recorded_at' => 'datetime',
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
