<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use App\Utils\DeviceUtils;

class ChildDevice extends Model
{
    protected $fillable = [
        'device_id',
        'battery_voltage',
        'is_spot_used',
        'parking_spot_id',
        'last_reported_at',
        'hash',
    ];

    protected $casts = [
        'is_spot_used' => 'boolean',
        'last_reported_at' => 'datetime',
    ];

    protected $appends = [
        'status',
    ];

    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn () => DeviceUtils::getChildDeviceStatus($this)
        );
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    
    public function parkingSpot()
    {
        return $this->belongsTo(ParkingSpot::class);
    }
}
