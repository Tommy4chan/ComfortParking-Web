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
        'is_paid',
        'payment_url',
        'location',
    ];

    protected function casts(): array
    {
        return [
            'location' => Point::class,
            'is_paid' => 'boolean',
        ];
    }

    protected $appends = [
        'latitude',
        'longitude',
        'last_reported_at',
        'available_spots',
    ];

    public function devices(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Scope to eager load parking statistics aggregated from device columns.
     */
    public function scopeWithParkingStats($query): void
    {
        $query
            ->withSum('devices as total_spots', 'parking_spots_count')
            ->withSum('devices as used_spots', 'used_parking_spots')
            ->withMax('devices', 'last_reported_at');
    }

    /**
     * Get latitude from location point.
     */
    protected function latitude(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->location?->getLatitude(),
        );
    }

    /**
     * Get longitude from location point.
     */
    protected function longitude(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->location?->getLongitude(),
        );
    }

    /**
     * Get last reported timestamp from devices.
     */
    protected function lastReportedAt(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->devices_max_last_reported_at
                ? \Carbon\Carbon::parse($this->devices_max_last_reported_at)
                : null,
        );
    }

    /**
     * Get available spots based on total and used spots.
     */
    protected function availableSpots(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, ($this->total_spots ?? 0) - ($this->used_spots ?? 0)),
        );
    }
}
