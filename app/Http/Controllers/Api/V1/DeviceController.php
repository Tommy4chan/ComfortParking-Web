<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Device\SyncDeviceRequest;
use App\Jobs\ProcessImageRecognition;
use App\Models\ChildDevice;
use App\Models\Device;
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

                    $childDevice->update([
                        'battery_voltage' => $childData['battery_voltage'],
                        'is_spot_used' => $childData['is_spot_used'],
                        'last_reported_at' => now(),
                    ]);
                }
            }

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
}
