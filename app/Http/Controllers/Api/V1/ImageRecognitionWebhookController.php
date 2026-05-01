<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImageRecognition\WebhookRequest;
use App\Models\Device;
use App\Models\DeviceTelemetrySnapshot;
use App\Models\ParkingEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageRecognitionWebhookController extends Controller
{
    public function handle(WebhookRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $device = Device::findOrFail($validated['device_id']);

            $device->used_parking_spots = $validated['used_parking_spots'];

            if (! empty($validated['processed_image_base64'])) {
                $base64Image = $validated['processed_image_base64'];
                $timestamp = now()->timestamp;

                $imageContent = base64_decode($base64Image);

                $filename = sprintf(
                    'device-images/%s/processed_%s.jpg',
                    $device->id,
                    $timestamp
                );

                // Delete old processed image if exists
                if ($device->last_processed_image_path && Storage::disk('public')->exists($device->last_processed_image_path)) {
                    Storage::disk('public')->delete($device->last_processed_image_path);
                }

                Storage::disk('public')->put($filename, $imageContent);

                $device->last_processed_image_path = $filename;
            }

            $oldUsedSpots = $device->used_parking_spots;
            $newUsedSpots = $validated['used_parking_spots'];

            $device->used_parking_spots = $newUsedSpots;
            $device->save();

            // Handle parking events based on spot count changes (since we don't have individual spots for cameras)
            if ($oldUsedSpots !== null && $oldUsedSpots !== $newUsedSpots) {
                $difference = $newUsedSpots - $oldUsedSpots;
                $eventType = $difference > 0 ? 'arrival' : 'departure';
                
                // If 2 cars arrive, we emit 2 events
                for ($i = 0; $i < abs($difference); $i++) {
                    ParkingEvent::create([
                        'child_device_id' => null, // AI cameras don't have child devices for each spot
                        'device_id' => $device->id,
                        'parking_zone_id' => $device->parking_zone_id,
                        'event_type' => $eventType,
                        'occurred_at' => now(),
                        'previous_state' => $eventType === 'arrival' ? false : true,
                        'new_state' => $eventType === 'arrival' ? true : false,
                    ]);
                }
            }

            DeviceTelemetrySnapshot::create([
                'device_id' => $device->id,
                'parking_zone_id' => $device->parking_zone_id,
                'recorded_at' => now(),
                'used_spots' => $newUsedSpots,
                'total_spots' => $device->parking_spots_count ?? 0,
                'battery_voltage_mv' => $device->battery_voltage, // Camera might be hardwired or have its own
                'status' => $device->status,
                'response_time_ms' => null,
                'online_child_count' => 0,
                'offline_child_count' => 0,
            ]);

            return response()->json([
                'success' => true,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process image recognition webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process results',
            ], 500);
        }
    }
}
