<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Device\SyncDeviceRequest;
use App\Jobs\ProcessImageRecognition;
use App\Models\ChildDevice;
use App\Models\Device;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeviceController extends Controller
{
    public function sync(SyncDeviceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $device = Device::where('hash', $validated['hash'])->firstOrFail();

        DB::beginTransaction();
        try {
            $device->update([
                'battery_voltage' => $validated['battery_voltage'],
                'last_reported_at' => now(),
            ]);

            if (!empty($validated['children'])) {
                foreach ($validated['children'] as $childData) {
                    $childDevice = ChildDevice::where('hash', $childData['hash'])
                        ->where('device_id', $device->id)
                        ->firstOrFail();

                    $oldSpotUsed = $childDevice->is_spot_used;

                    $childDevice->update([
                        'battery_voltage' => $childData['battery_voltage'],
                        'is_spot_used' => $childData['is_spot_used'],
                        'last_reported_at' => now(),
                    ]);

                    if ($oldSpotUsed !== $childData['is_spot_used']) {
                        ParkingEvent::create([
                            'child_device_id' => $childDevice->id,
                            'device_id' => $device->id,
                            'parking_zone_id' => $device->parking_zone_id,
                            'event_type' => $childData['is_spot_used'] ? 'arrival' : 'departure',
                            'occurred_at' => now(),
                            'previous_state' => $oldSpotUsed,
                            'new_state' => $childData['is_spot_used'],
                        ]);
                    }
                }
            }

            $usedSpots = ChildDevice::where('device_id', $device->id)->where('is_spot_used', true)->count();
            $totalSpots = ChildDevice::where('device_id', $device->id)->count();
            
            DeviceTelemetrySnapshot::create([
                'device_id' => $device->id,
                'parking_zone_id' => $device->parking_zone_id,
                'recorded_at' => now(),
                'used_spots' => $usedSpots,
                'total_spots' => $totalSpots,
                'battery_voltage_mv' => $validated['battery_voltage'],
                'status' => $device->status,
                'response_time_ms' => null, // Sync endpoint doesn't track this easily, maybe later
                'online_child_count' => $totalSpots,
                'offline_child_count' => 0,
            ]);

            DB::commit();

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $timestamp = now()->timestamp;
                $extension = $image->getClientOriginalExtension();
                
                $tempFilename = sprintf(
                    'device-images/temp/%s_%s.%s',
                    $device->id,
                    $timestamp,
                    $extension
                );
                $tempPath = Storage::putFileAs(
                    dirname($tempFilename),
                    $image,
                    basename($tempFilename)
                );
                
                $permanentFilename = sprintf(
                    'device-images/%s/%s.%s',
                    $device->id,
                    $timestamp,
                    $extension
                );

                // Delete old image if exists
                if ($device->last_image_path && Storage::disk('public')->exists($device->last_image_path)) {
                    Storage::disk('public')->delete($device->last_image_path);
                }

                $permanentPath = Storage::disk('public')->putFileAs(
                    dirname($permanentFilename),
                    $image,
                    basename($permanentFilename)
                );
                
                $device->update(['last_image_path' => $permanentPath]);
                
                ProcessImageRecognition::dispatch(
                    $device->id,
                    $tempPath,
                    $image->getClientOriginalName()
                );
            }

            return response()->json([
                'success' => true,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Sync failed'
            ], 500);
        }
    }

    public function syncSpots(\App\Http\Requests\Device\SyncSpotsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $device = Device::where('hash', $validated['hash'])->firstOrFail();

        DB::beginTransaction();
        try {
            $device->update([
                'battery_voltage' => $validated['battery_voltage'],
                'used_parking_spots' => $validated['used_parking_spots'],
                'last_reported_at' => now(),
            ]);

            DeviceTelemetrySnapshot::create([
                'device_id' => $device->id,
                'parking_zone_id' => $device->parking_zone_id,
                'recorded_at' => now(),
                'used_spots' => $validated['used_parking_spots'],
                'total_spots' => $device->parking_spots_count,
                'battery_voltage_mv' => $validated['battery_voltage'],
                'status' => $device->status,
                'response_time_ms' => null,
                'online_child_count' => 0,
                'offline_child_count' => 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Sync failed'
            ], 500);
        }
    }
}
