<?php

namespace App\Models;

use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
    ];

    protected $casts = [
        'location' => Point::class,
    ];

    protected $appends = [
        'latitude',
        'longitude',
        'last_reported_at',
    ];
    
    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Get all parking spots through devices
     */
    public function parkingSpots()
    {
        return $this->hasManyThrough(ParkingSpot::class, Device::class);
    }

    /**
     * Scope to eager load parking statistics
     */
    public function scopeWithParkingStats($query)
    {
        return $query
            ->withCount('parkingSpots as total_spots')
            ->withCount(['parkingSpots as used_spots' => function ($query) {
                $query->where('is_used', true);
            }])
            ->withCount(['parkingSpots as available_spots' => function ($query) {
                $query->where('is_used', false);
            }])
            ->withMax('devices', 'last_reported_at');
    }

    /**
     * Get latitude from location point
     */
    protected function latitude(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->location?->getLatitude(),
        );
    }

    /**
     * Get longitude from location point
     */
    protected function longitude(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->location?->getLongitude(),
        );
    }

    /**
     * Get last reported timestamp from devices
     */
    protected function lastReportedAt(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->devices_max_last_reported_at 
                ? \Carbon\Carbon::parse($this->devices_max_last_reported_at) 
                : null,
        );
    }

    // public function deviceLogs()
    // {
    //     return $this->hasManyThrough(DeviceLog::class, Device::class);
    // }
}
