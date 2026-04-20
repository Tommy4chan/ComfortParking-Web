<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChildDevice\CreateChildDeviceRequest;
use App\Http\Requests\ChildDevice\StoreChildDeviceRequest;
use App\Http\Requests\ChildDevice\UpdateChildDeviceRequest;
use App\Models\ChildDevice;
use App\Models\Device;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChildDeviceController extends Controller
{
    public function create(CreateChildDeviceRequest $request)
    {
        $validated = $request->validated();
        $device = Device::with('parkingZone')->findOrFail($validated['device_id']);

        return Inertia::render('childDevices/create', [
            'device' => $device,
        ]);
    }

    public function store(StoreChildDeviceRequest $request)
    {
        $validated = $request->validated();

        do {
            $hash = Str::random(32);
        } while (ChildDevice::where('hash', $hash)->exists());

        ChildDevice::create(array_merge($validated, ['hash' => $hash]));

        return redirect()->route('devices.show', $validated['device_id']);
    }

    public function edit(ChildDevice $childDevice)
    {
        $childDevice->load(['device.parkingZone']);

        return Inertia::render('childDevices/edit', [
            'childDevice' => $childDevice,
        ]);
    }

    public function update(UpdateChildDeviceRequest $request, ChildDevice $childDevice)
    {
        $validated = $request->validated();

        $childDevice->update($validated);

        return redirect()->route('devices.show', $childDevice->device_id);
    }

    public function destroy(ChildDevice $childDevice)
    {
        $deviceId = $childDevice->device_id;
        $childDevice->delete();

        return redirect()->route('devices.show', $deviceId);
    }
}
