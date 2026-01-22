<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Utils\DeviceUtils;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'location',
        'battery_voltage',
        'used_parking_spots',
        'parking_zone_id',
        'last_reported_at',
        'hash',
        'last_image_path',
        'last_processed_image_path',
    ];
    
    protected $casts = [
        'location' => Point::class,
        'last_reported_at' => 'datetime',
    ];

    protected $appends = [
        'latitude',
        'longitude',
        'total_parking_spots',
        'used_parking_spots',
        'available_parking_spots',
        'status',
        'last_image_url',
        'last_processed_image_url',
    ];

    protected function latitude(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->location?->getLatitude(),
        );
    }

    protected function longitude(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->location?->getLongitude(),
        );
    }

    protected function totalParkingSpots(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->parkingSpots->count(),
        );
    }

    protected function usedParkingSpots(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->parkingSpots->where('is_used', true)->count(),
        );
    }
    
    protected function availableParkingSpots(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->total_parking_spots - $this->used_parking_spots,
        );
    }

    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn () => DeviceUtils::getDeviceStatus($this)
        );
    }

    protected function lastImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->last_image_path 
                ? asset('storage/' . $this->last_image_path)
                : null
        );
    }

    protected function lastProcessedImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->last_processed_image_path 
                ? asset('storage/' . $this->last_processed_image_path)
                : null
        );
    }

    public function parkingZone()
    {
        return $this->belongsTo(ParkingZone::class);
    }

    public function childDevices()
    {
        return $this->hasMany(ChildDevice::class)->orderBy('id');
    }
    
    public function parkingSpots()
    {
        return $this->hasMany(ParkingSpot::class)->orderBy('index');
    }
}
