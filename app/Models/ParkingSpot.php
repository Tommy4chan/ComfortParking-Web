<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParkingSpot extends Model
{
    protected $fillable = [
        'device_id',
        'is_used',
        'index',
        'point_1_x',
        'point_1_y',
        'point_2_x',
        'point_2_y',
        'point_3_x',
        'point_3_y',
        'point_4_x',
        'point_4_y',
    ];

    public $timestamps = false;

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function childDevices()
    {
        return $this->hasMany(ChildDevice::class)->orderBy('id');
    }
}
