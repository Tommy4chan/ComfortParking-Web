<?php

namespace App\Models;

use App\Utils\DeviceUtils;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'image_recognition_enabled',
        'last_image_path',
        'last_processed_image_path',
        'zone_point_1_x',
        'zone_point_1_y',
        'zone_point_2_x',
        'zone_point_2_y',
        'zone_point_3_x',
        'zone_point_3_y',
        'zone_point_4_x',
        'zone_point_4_y',
        'parking_spots_count',
    ];

    protected $casts = [
        'location' => Point::class,
        'last_reported_at' => 'datetime',
        'image_recognition_enabled' => 'boolean',
    ];

    protected $appends = [
        'latitude',
        'longitude',
        'total_parking_spots',
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
            get: fn () => $this->parking_spots_count ?? 0,
        );
    }

    protected function availableParkingSpots(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, ($this->parking_spots_count ?? 0) - ($this->used_parking_spots ?? 0)),
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
                ? asset('storage/'.$this->last_image_path)
                : null
        );
    }

    protected function lastProcessedImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->last_processed_image_path
                ? asset('storage/'.$this->last_processed_image_path)
                : null
        );
    }

    public function parkingZone(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ParkingZone::class);
    }

    public function childDevices(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ChildDevice::class)->orderBy('id');
    }
}
