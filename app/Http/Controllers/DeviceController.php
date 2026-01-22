<?php

namespace App\Http\Controllers;

use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use App\Models\Device;
use App\Models\ParkingZone;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::all();

        return Inertia::render('devices/index', [
            'devices' => $devices,
        ]);
    }

    public function create(Request $request)
    {
        $parkingZoneId = $request->query('parking_zone_id');

        $parkingZone = ParkingZone::findOrFail($parkingZoneId);

        return Inertia::render('devices/create', [
            'parkingZone' => $parkingZone,
        ]);
    }

    public function store(StoreDeviceRequest $request)
    {
        $validated = $request->validated();

        $location = Point::makeGeodetic(
            $validated['latitude'],
            $validated['longitude']
        );

        do {
            $hash = Str::random(32);
        } while (Device::where('hash', $hash)->exists());

        $device = Device::create([
            'title' => $validated['title'],
            'parking_zone_id' => $validated['parking_zone_id'],
            'location' => $location,
            'hash' => $hash,
        ]);

        return redirect()->route('devices.show', $device->id);
    }

    public function show(Device $device)
    {
        $device->load(['parkingZone', 'childDevices', 'parkingSpots']);

        return Inertia::render('devices/show', [
            'device' => $device,
        ]);
    }

    public function edit(Device $device)
    {
        $device->load('parkingZone');

        return Inertia::render('devices/edit', [
            'device' => $device,
        ]);
    }

    public function update(UpdateDeviceRequest $request, Device $device)
    {
        $validated = $request->validated();

        $location = Point::makeGeodetic(
            $validated['latitude'],
            $validated['longitude']
        );

        $device->update([
            'title' => $validated['title'],
            'parking_zone_id' => $validated['parking_zone_id'],
            'location' => $location,
        ]);

        return redirect()->route('devices.show', $device->id);
    }

    public function destroy(Device $device)
    {
        $parkingZoneId = $device->parking_zone_id;
        $device->delete();

        return redirect()->route('parking-zones.show', $parkingZoneId);
    }
}
