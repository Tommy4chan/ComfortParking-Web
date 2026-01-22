<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ParkingZone\ParkingZoneBoundsRequest;
use App\Http\Requests\ParkingZone\ParkingZoneNearbyRequest;
use App\Models\ParkingZone;
use Clickbar\Magellan\Data\Geometries\Point;
use Clickbar\Magellan\Database\Expressions\AsGeography;
use Clickbar\Magellan\Database\PostgisFunctions\ST;
use Illuminate\Http\JsonResponse;

class ParkingZoneController extends Controller
{
    /**
     * Get parking zones within map viewport bounds
     * Used for map-based queries with visible area
     */
    public function inBounds(ParkingZoneBoundsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Create envelope (bounding box) from coordinates
        $parkingZones = ParkingZone::select(['id', 'title', 'description', 'location'])
            ->whereRaw("
                ST_Within(
                    location::geometry,
                    ST_MakeEnvelope(?, ?, ?, ?, 4326)
                )
            ", [
                $validated['min_lng'],
                $validated['min_lat'],
                $validated['max_lng'],
                $validated['max_lat']
            ])
            ->withParkingStats()
            ->get();

        return response()->json(
            $parkingZones,
        );
    }

    public function nearby(ParkingZoneNearbyRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $userLocation = Point::makeGeodetic($validated['lat'], $validated['lng']);

        $locationAsGeography = new AsGeography('location');

        $parkingZones = ParkingZone::select(['id', 'title', 'description', 'location'])
            ->addSelect(ST::distance($locationAsGeography, $userLocation)->as('distance'))
            ->where(ST::distance($locationAsGeography, $userLocation), '<=', $validated['radius'])
            ->withParkingStats()
            ->orderBy(ST::distance($locationAsGeography, $userLocation))
            ->get();

        return response()->json(
            $parkingZones,
        );
    }

}
