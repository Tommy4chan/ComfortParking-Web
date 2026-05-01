<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\ChildDevice;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Jobs\ProcessImageRecognition;
use Carbon\Carbon;

class DeviceTelemetryController extends Controller
{
    /**
     * Authenticate a device based on device_id and Bearer Token (hash).
     */
    private function authenticateDevice(Request $request, $deviceId)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            abort(401, 'Unauthorized - Missing device token');
        }

        $device = Device::where('id', $deviceId)->where('hash', $token)->first();
        
        if (!$device) {
            abort(401, 'Unauthorized - Invalid device token');
        }
        
        return $device;
    }

    /**
     * Handle direct spot occupancy telemetry.
     */
    public function telemetry(Request $request, $device_id)
    {
        $device = $this->authenticateDevice($request, $device_id);

        if ($device->image_recognition_enabled) {
            return response()->json(['error' => 'Forbidden - This device uses image recognition mode.'], 403);
        }

        $validated = $request->validate([
            'timestamp' => 'required|date',
            'spots' => 'required|array',
            'spots.*.spot_id' => 'required|string',
            'spots.*.is_occupied' => 'required|boolean',
            'spots.*.confidence' => 'nullable|numeric|min:0|max:1',
        ]);

        DB::beginTransaction();
        try {
            $device->update(['last_reported_at' => Carbon::parse($validated['timestamp'])]);

            $totalSpots = 0;
            $usedSpots = 0;

            foreach ($validated['spots'] as $spotInfo) {
                // Find or create a ChildDevice by simple spot_id string representation inside the device scope
                // Because spot_id from payload could be string hash or identifier
                // For simplicity, we use hash = spot_id
                $childDevice = ChildDevice::firstOrCreate(
                    [
                        'device_id' => $device->id,
                        'hash' => $spotInfo['spot_id'],
                    ],
                    [
                        'title' => 'Spot ' . $spotInfo['spot_id'],
                        'is_spot_used' => false,
                        'battery_voltage' => 0, // Mock default values
                    ]
                );

                $oldSpotUsed = $childDevice->is_spot_used;
                $newSpotUsed = $spotInfo['is_occupied'];

                $childDevice->update([
                    'is_spot_used' => $newSpotUsed,
                    'last_reported_at' => Carbon::parse($validated['timestamp']),
                ]);

                if ($oldSpotUsed !== $newSpotUsed) {
                    ParkingEvent::create([
                        'child_device_id' => $childDevice->id,
                        'device_id' => $device->id,
                        'parking_zone_id' => $device->parking_zone_id,
                        'event_type' => $newSpotUsed ? 'arrival' : 'departure',
                        'occurred_at' => Carbon::parse($validated['timestamp']),
                        'previous_state' => $oldSpotUsed,
                        'new_state' => $newSpotUsed,
                    ]);
                }
            }

            $usedSpots = ChildDevice::where('device_id', $device->id)->where('is_spot_used', true)->count();
            $totalSpots = ChildDevice::where('device_id', $device->id)->count();

            DeviceTelemetrySnapshot::create([
                'device_id' => $device->id,
                'parking_zone_id' => $device->parking_zone_id,
                'recorded_at' => Carbon::parse($validated['timestamp']),
                'used_spots' => $usedSpots,
                'total_spots' => $totalSpots,
                'battery_voltage_mv' => $device->battery_voltage ?? 0,
                'status' => 'online', // inferred
                'response_time_ms' => null,
                'online_child_count' => $totalSpots,
                'offline_child_count' => 0,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Data received successfully',
                'timestamp' => now()->toIso8601String()
            ], 202);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to process telemetry payload'], 400);
        }
    }

    /**
     * Handle image upload for occupancy recognition.
     */
    public function images(Request $request, $device_id)
    {
        $device = $this->authenticateDevice($request, $device_id);

        if (!$device->image_recognition_enabled) {
            return response()->json(['error' => 'Forbidden - Image recognition feature is disabled for this device.'], 403);
        }

        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg',
            'timestamp' => 'required|date',
        ]);

        // Process file upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $timestamp = now()->timestamp;
            $extension = $image->getClientOriginalExtension();
            
            $permanentFilename = sprintf(
                'device-images/%s/%s.%s',
                $device->id,
                $timestamp,
                $extension
            );

            // Delete old image if exists
            if ($device->last_image_path && Storage::exists($device->last_image_path)) {
                Storage::delete($device->last_image_path);
            }

            Storage::disk('public')->putFileAs(
                dirname($permanentFilename),
                $image,
                basename($permanentFilename)
            );

            $device->update([
                'last_image_path' => $permanentFilename,
                'last_reported_at' => Carbon::parse($validated['timestamp']),
            ]);

            // Dispatch image processing job
            ProcessImageRecognition::dispatch($device->id, storage_path('app/public/' . $permanentFilename));

            return response()->json([
                'message' => 'Image accepted and queued for processing',
                'timestamp' => now()->toIso8601String()
            ], 202);
        }

        return response()->json(['error' => 'Missing image or unsupported format'], 400);
    }
}

