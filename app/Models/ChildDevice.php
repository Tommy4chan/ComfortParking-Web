<?php

namespace App\Models;

use App\Utils\DeviceUtils;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class ChildDevice extends Model
{
    protected $fillable = [
        'device_id',
        'battery_voltage',
        'is_spot_used',
        'last_reported_at',
        'hash',
        'position_x',
        'position_y',
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

    public function device(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
