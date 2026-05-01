<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingEvent extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'occurred_at' => 'datetime',
        'previous_state' => 'boolean',
        'new_state' => 'boolean',
    ];

    public function childDevice()
    {
        return $this->belongsTo(ChildDevice::class);
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function parkingZone()
    {
        return $this->belongsTo(ParkingZone::class);
    }
}
