<?php

namespace Database\Seeders;

use App\Models\SystemTelemetry;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SystemTelemetrySeeder extends Seeder
{
    public function run(): void
    {
        // Generate historical data for the last 24 hours
        $totalSpots = 120; // Assuming 120 spots total from default seeded data
        
        for ($i = 24; $i >= 1; $i--) {
            $recordedAt = Carbon::now()->subHours($i)->startOfHour();
            $hour = $recordedAt->hour;
            
            // Generate some realistic-looking curves
            $morningPeak = sin((($hour - 7) / 24) * M_PI * 2) * 18;
            $eveningPeak = sin((($hour - 17) / 24) * M_PI * 2) * 15;
            $baseline = 48;
            $usedSpots = max(8, min($totalSpots - 2, round($baseline + $morningPeak + $eveningPeak)));
            
            $online = max(14, round(18 + sin((($hour - 4) / 24) * M_PI * 2) * 2));
            $warning = max(2, round(4 + sin((($hour + 2) / 24) * M_PI * 2) * 1.5));
            $offline = max(0, round(2 + sin((($hour - 10) / 24) * M_PI * 2)));

            $arrivals = max(0, round(12 + sin((($hour - 8) / 24) * M_PI * 2) * 10));
            $departures = max(0, round(10 + sin((($hour - 13) / 24) * M_PI * 2) * 9));

            SystemTelemetry::create([
                'recorded_at' => $recordedAt,
                'used_spots' => $usedSpots,
                'free_spots' => $totalSpots - $usedSpots,
                'arrivals' => $arrivals,
                'departures' => $departures,
                'online_devices' => $online,
                'warning_devices' => $warning,
                'offline_devices' => $offline,
            ]);
        }
    }
}
