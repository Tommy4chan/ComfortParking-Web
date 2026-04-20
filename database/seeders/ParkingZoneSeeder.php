<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\ChildDevice;
use App\Models\ParkingZone;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Seeder;

class ParkingZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lviv parking zones
        $lvivZones = [
            [
                'title' => 'Rynok Square Parking',
                'description' => 'Central parking area near historic Rynok Square',
                'latitude' => 49.8419,
                'longitude' => 24.0315,
                'devices' => 2,
            ],
            [
                'title' => 'Prospekt Svobody Parking',
                'description' => 'Main avenue parking zone with premium spots',
                'latitude' => 49.8397,
                'longitude' => 24.0297,
                'devices' => 3,
            ],
            [
                'title' => 'Opera Theatre Parking',
                'description' => 'Parking near Lviv Opera House',
                'latitude' => 49.8435,
                'longitude' => 24.0258,
                'devices' => 2,
            ],
            [
                'title' => 'High Castle Park Parking',
                'description' => 'Parking area at the base of High Castle Hill',
                'latitude' => 49.8463,
                'longitude' => 24.0391,
                'devices' => 1,
            ],
            [
                'title' => 'Train Station Parking',
                'description' => 'Large parking zone near Lviv Railway Station',
                'latitude' => 49.8395,
                'longitude' => 24.0093,
                'devices' => 4,
            ],
            [
                'title' => 'Arena Lviv Parking',
                'description' => 'Stadium parking for events and matches',
                'latitude' => 49.8086,
                'longitude' => 23.9722,
                'devices' => 3,
            ],
        ];

        // Brody parking zones
        $brodyZones = [
            [
                'title' => 'Brody Central Square',
                'description' => 'Main town square parking area',
                'latitude' => 50.0875,
                'longitude' => 25.1495,
                'devices' => 2,
            ],
            [
                'title' => 'Brody Castle Parking',
                'description' => 'Historical fortress parking zone',
                'latitude' => 50.0854,
                'longitude' => 25.1456,
                'devices' => 1,
            ],
            [
                'title' => 'Brody Market Parking',
                'description' => 'Local market and shopping area parking',
                'latitude' => 50.0891,
                'longitude' => 25.1523,
                'devices' => 2,
            ],
            [
                'title' => 'Brody Bus Station',
                'description' => 'Transit hub parking area',
                'latitude' => 50.0862,
                'longitude' => 25.1478,
                'devices' => 1,
            ],
        ];

        $this->seedCity($lvivZones);
        $this->seedCity($brodyZones);
    }

    /**
     * Seed parking zones for a city
     */
    private function seedCity(array $zones): void
    {
        foreach ($zones as $zoneData) {
            $parkingZone = ParkingZone::create([
                'title' => $zoneData['title'],
                'description' => $zoneData['description'],
                'location' => Point::makeGeodetic($zoneData['latitude'], $zoneData['longitude']),
            ]);

            // Create devices for this parking zone
            $deviceCount = $zoneData['devices'];
            for ($i = 1; $i <= $deviceCount; $i++) {
                $this->createDevice($parkingZone, $i, $zoneData['latitude'], $zoneData['longitude']);
            }
        }
    }

    private static $globalDeviceIndex = 0;

    /**
     * Create a device with parking spots
     */
    private function createDevice(ParkingZone $parkingZone, int $index, float $baseLat, float $baseLng): void
    {
        self::$globalDeviceIndex++;
        $idx = self::$globalDeviceIndex;

        // Slightly offset device location from zone center
        $latOffset = ($index - 1) * 0.0005;
        $lngOffset = ($index - 1) * 0.0005;

        $spotsCount = rand(4, 8);
        $usedSpots = rand(0, $spotsCount);

        // By default, perfect health and recent heartbeat
        $battery = rand(3700, 4200);
        $reportedAt = now()->subMinutes(rand(1, 20));

        // Inject intentional errors for simulation
        if ($idx === 3) {
            // Offline
            $reportedAt = now()->subHours(rand(3, 10));
        } elseif ($idx === 7) {
            // Low battery
            $battery = rand(3100, 3350);
        } elseif ($idx === 14) {
            // Missing heartbeat (warning)
            $reportedAt = now()->subMinutes(rand(70, 110));
        }

        $device = Device::create([
            'title' => $parkingZone->title . ' - Device ' . $index,
            'location' => Point::makeGeodetic($baseLat + $latOffset, $baseLng + $lngOffset),
            'battery_voltage' => $battery,
            'parking_zone_id' => $parkingZone->id,
            'last_reported_at' => $reportedAt,
            'hash' => bin2hex(random_bytes(16)),
            'parking_spots_count' => $spotsCount,
            'used_parking_spots' => $usedSpots,
            'zone_point_1_x' => rand(0, 100),
            'zone_point_1_y' => rand(0, 100),
            'zone_point_2_x' => rand(100, 200),
            'zone_point_2_y' => rand(0, 100),
            'zone_point_3_x' => rand(100, 200),
            'zone_point_3_y' => rand(100, 200),
            'zone_point_4_x' => rand(0, 100),
            'zone_point_4_y' => rand(100, 200),
        ]);

        // Create some child devices for this device
        $childDevicesCount = rand(1, 3); // Make sure there's at least 1 for display
        for ($child = 0; $child < $childDevicesCount; $child++) {
            
            $childBattery = rand(3700, 4200);
            $childReportedAt = now()->subMinutes(rand(1, 20));

            // Inject 1 or 2 child errors randomly across the whole DB
            if (rand(1, 30) === 1) {
                $childReportedAt = now()->subHours(5); // Offline child
            } elseif (rand(1, 30) === 2) {
                $childBattery = rand(3100, 3350); // Low battery child
            }

            ChildDevice::create([
                'device_id' => $device->id,
                'battery_voltage' => $childBattery,
                'is_spot_used' => (bool) rand(0, 1),
                'hash' => bin2hex(random_bytes(16)),
                'last_reported_at' => $childReportedAt,
                'position_x' => rand(0, 200),
                'position_y' => rand(0, 200),
            ]);
        }
    }
}
