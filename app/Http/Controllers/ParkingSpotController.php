<?php

namespace App\Http\Controllers;

use App\Http\Requests\ParkingSpot\CreateParkingSpotRequest;
use App\Http\Requests\ParkingSpot\StoreParkingSpotRequest;
use App\Http\Requests\ParkingSpot\UpdateParkingSpotRequest;
use App\Models\Device;
use App\Models\ParkingSpot;
use Inertia\Inertia;

class ParkingSpotController extends Controller
{

    public function create(CreateParkingSpotRequest $request)
    {
        $validated = $request->validated();
        $device = Device::with('parkingZone')->findOrFail($validated['device_id']);

        return Inertia::render('parkingSpots/create', [
            'device' => $device,
        ]);
    }

    public function store(StoreParkingSpotRequest $request)
    {
        $validated = $request->validated();

        ParkingSpot::create($validated);

        return redirect()->route('devices.show', $validated['device_id']);
    }
    
    public function edit(ParkingSpot $parkingSpot)
    {
        $parkingSpot->load(['device.parkingZone', 'device.parkingSpots']);

        return Inertia::render('parkingSpots/edit', [
            'parkingSpot' => $parkingSpot,
        ]);
    }

    public function update(UpdateParkingSpotRequest $request, ParkingSpot $parkingSpot)
    {
        $validated = $request->validated();

        $parkingSpot->update($validated);

        return redirect()->route('devices.show', $parkingSpot['device_id']);
    }

    public function destroy(ParkingSpot $parkingSpot)
    {
        $deviceId = $parkingSpot->device_id;
        $parkingSpot->delete();

        return redirect()->route('devices.show', $deviceId);
    }
}
