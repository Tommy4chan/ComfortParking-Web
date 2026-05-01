<?php

namespace Tests\Feature\ParkingZone;

use App\Models\ParkingZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParkingZonePaidTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_parking_zone_defaults_to_free(): void
    {
        $zone = ParkingZone::factory()->create();

        $this->assertFalse($zone->is_paid);
        $this->assertNull($zone->payment_url);
    }

    public function test_parking_zone_can_be_marked_as_paid_with_url(): void
    {
        $zone = ParkingZone::factory()->paid('https://pay.example.com')->create();

        $this->assertTrue($zone->is_paid);
        $this->assertSame('https://pay.example.com', $zone->payment_url);
    }

    public function test_parking_zone_can_be_paid_without_url(): void
    {
        $zone = ParkingZone::factory()->create([
            'is_paid' => true,
            'payment_url' => null,
        ]);

        $this->assertTrue($zone->is_paid);
        $this->assertNull($zone->payment_url);
    }

    public function test_store_creates_paid_zone_with_payment_url(): void
    {
        $this->actingAs($this->user);

        $this->post(route('parking-zones.store'), [
            'title' => 'Test Paid Zone',
            'latitude' => 51.5074,
            'longitude' => -0.1278,
            'is_paid' => true,
            'payment_url' => 'https://pay.example.com',
        ])->assertRedirect(route('parking-zones.index'));

        $this->assertDatabaseHas('parking_zones', [
            'title' => 'Test Paid Zone',
            'is_paid' => true,
            'payment_url' => 'https://pay.example.com',
        ]);
    }

    public function test_store_creates_free_zone_by_default(): void
    {
        $this->actingAs($this->user);

        $this->post(route('parking-zones.store'), [
            'title' => 'Free Zone',
            'latitude' => 51.5074,
            'longitude' => -0.1278,
        ])->assertRedirect(route('parking-zones.index'));

        $this->assertDatabaseHas('parking_zones', [
            'title' => 'Free Zone',
            'is_paid' => false,
            'payment_url' => null,
        ]);
    }

    public function test_update_can_toggle_zone_to_paid(): void
    {
        $this->actingAs($this->user);

        $zone = ParkingZone::factory()->create();

        $this->put(route('parking-zones.update', $zone), [
            'title' => $zone->title,
            'latitude' => 51.5074,
            'longitude' => -0.1278,
            'is_paid' => true,
            'payment_url' => 'https://pay.example.com',
        ])->assertRedirect(route('parking-zones.show', $zone));

        $this->assertDatabaseHas('parking_zones', [
            'id' => $zone->id,
            'is_paid' => true,
            'payment_url' => 'https://pay.example.com',
        ]);
    }

    public function test_payment_url_must_be_a_valid_url(): void
    {
        $this->actingAs($this->user);

        $this->post(route('parking-zones.store'), [
            'title' => 'Zone With Bad URL',
            'latitude' => 51.5074,
            'longitude' => -0.1278,
            'is_paid' => true,
            'payment_url' => 'not-a-valid-url',
        ])->assertSessionHasErrors('payment_url');
    }

    public function test_guests_cannot_create_paid_zone(): void
    {
        $this->post(route('parking-zones.store'), [
            'title' => 'Paid Zone',
            'latitude' => 51.5074,
            'longitude' => -0.1278,
            'is_paid' => true,
        ])->assertRedirect(route('login'));
    }
}
