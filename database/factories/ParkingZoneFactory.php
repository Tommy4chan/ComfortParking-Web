<?php

namespace Database\Factories;

use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ParkingZone>
 */
class ParkingZoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->city() . ' Parking',
            'description' => fake()->optional()->sentence(),
            'location' => Point::makeGeodetic(
                fake()->latitude(),
                fake()->longitude(),
            ),
            'is_paid' => false,
            'payment_url' => null,
        ];
    }

    /**
     * Mark the zone as a paid parking zone.
     */
    public function paid(?string $paymentUrl = null): static
    {
        return $this->state(fn () => [
            'is_paid' => true,
            'payment_url' => $paymentUrl ?? fake()->url(),
        ]);
    }
}
