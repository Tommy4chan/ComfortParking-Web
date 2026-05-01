<?php

namespace App\Http\Controllers;

use App\Http\Requests\ParkingZone\StoreParkingZoneRequest;
use App\Http\Requests\ParkingZone\UpdateParkingZoneRequest;
use App\Models\ParkingZone;
use Clickbar\Magellan\Data\Geometries\Point;
use Inertia\Inertia;

class ParkingZoneController extends Controller
{
    public function index()
    {
        $parkingZones = ParkingZone::query()
            ->withParkingStats()
            ->orderBy('id')
            ->get();

        return Inertia::render('parkingZones/index', [
            'parkingZones' => $parkingZones,
        ]);
    }

    public function create()
    {
        return Inertia::render('parkingZones/create');
    }

    public function store(StoreParkingZoneRequest $request)
    {
        $validated = $request->validated();

        $location = Point::makeGeodetic(
            $validated['latitude'],
            $validated['longitude']
        );

        ParkingZone::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_paid' => $validated['is_paid'] ?? false,
            'payment_url' => $validated['payment_url'] ?? null,
            'location' => $location,
        ]);

        return redirect()->route('parking-zones.index');
    }

    public function show(string $id)
    {
        $parkingZone = ParkingZone::query()
            ->withParkingStats()
            ->with('devices')
            ->findOrFail($id);

        return Inertia::render('parkingZones/show', [
            'parkingZone' => $parkingZone,
        ]);
    }

    public function edit(ParkingZone $parkingZone)
    {
        return Inertia::render('parkingZones/edit', [
            'parkingZone' => $parkingZone,
        ]);
    }

    public function update(UpdateParkingZoneRequest $request, ParkingZone $parkingZone)
    {
        $validated = $request->validated();

        $validated['location'] = Point::makeGeodetic(
            $validated['latitude'],
            $validated['longitude']
        );

        unset($validated['latitude'], $validated['longitude']);

        $parkingZone->update($validated);

        return redirect()->route('parking-zones.show', $parkingZone->id);
    }

    public function destroy(ParkingZone $parkingZone)
    {
        $parkingZone->delete();

        return redirect()->route('parking-zones.index');
    }
}
