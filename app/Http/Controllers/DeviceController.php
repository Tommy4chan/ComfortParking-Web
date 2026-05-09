<?php

namespace App\Http\Controllers;

use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use App\Models\Device;
use App\Models\ParkingZone;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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
            'zone_point_1_x' => $validated['zone_point_1_x'] ?? null,
            'zone_point_1_y' => $validated['zone_point_1_y'] ?? null,
            'zone_point_2_x' => $validated['zone_point_2_x'] ?? null,
            'zone_point_2_y' => $validated['zone_point_2_y'] ?? null,
            'zone_point_3_x' => $validated['zone_point_3_x'] ?? null,
            'zone_point_3_y' => $validated['zone_point_3_y'] ?? null,
            'zone_point_4_x' => $validated['zone_point_4_x'] ?? null,
            'zone_point_4_y' => $validated['zone_point_4_y'] ?? null,
            'parking_spots_count' => $validated['parking_spots_count'] ?? null,
            'image_recognition_enabled' => $request->has('image_recognition_enabled') ? filter_var($request->input('image_recognition_enabled'), FILTER_VALIDATE_BOOLEAN) : false,
        ]);

        return redirect()->route('devices.show', $device->id);
    }

    public function show(Request $request, Device $device): Response
    {
        $device->load(['parkingZone', 'childDevices']);

        $range = $request->query('range', '24h');
        $hoursBack = $range === '7d' ? 24 * 7 : 24;
        $start = now()->subHours($hoursBack);
        $end = now();

        $snapshots = \App\Models\DeviceTelemetrySnapshot::where('device_id', $device->id)
            ->where('recorded_at', '>=', $start)
            ->orderBy('recorded_at', 'asc')
            ->get();

        $telemetry = \App\Utils\TelemetryUtils::padDeviceSnapshots($snapshots, $start, $end);

        return Inertia::render('devices/show', [
            'device' => $device,
            'telemetry' => $telemetry,
            'currentRange' => $range,
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
            'zone_point_1_x' => $validated['zone_point_1_x'] ?? null,
            'zone_point_1_y' => $validated['zone_point_1_y'] ?? null,
            'zone_point_2_x' => $validated['zone_point_2_x'] ?? null,
            'zone_point_2_y' => $validated['zone_point_2_y'] ?? null,
            'zone_point_3_x' => $validated['zone_point_3_x'] ?? null,
            'zone_point_3_y' => $validated['zone_point_3_y'] ?? null,
            'zone_point_4_x' => $validated['zone_point_4_x'] ?? null,
            'zone_point_4_y' => $validated['zone_point_4_y'] ?? null,
            'parking_spots_count' => $validated['parking_spots_count'],
            'image_recognition_enabled' => $request->has('image_recognition_enabled') ? filter_var($request->input('image_recognition_enabled'), FILTER_VALIDATE_BOOLEAN) : false,
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
