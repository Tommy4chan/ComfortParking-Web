<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemTelemetry extends Model
{
    use HasFactory;

    protected $fillable = [
        'recorded_at',
        'used_spots',
        'free_spots',
        'arrivals',
        'departures',
        'online_devices',
        'warning_devices',
        'offline_devices',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];
}
