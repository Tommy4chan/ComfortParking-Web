<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImageRecognition\WebhookRequest;
use App\Models\ParkingSpot;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageRecognitionWebhookController extends Controller
{

    public function handle(WebhookRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $results = $validated['results'];

        try {
            DB::transaction(function () use ($results, $request, $validated) {
                $device = null;

                foreach ($results as $result) {
                    $parkingSpotId = $result['parking_spot_id'];

                    $parkingSpot = ParkingSpot::with('childDevices')->find($parkingSpotId);

                    if (!$parkingSpot) {
                        Log::warning('Parking spot not found in webhook results', [
                            'parking_spot_id' => $parkingSpotId,
                        ]);
                        continue;
                    }

                    if (!$device) {
                        $device = $parkingSpot->device;
                    }

                    $parkingSpot->is_used = $result['is_used'];
                    $parkingSpot->save();
                }

                if ($device && !empty($validated['processed_image_base64'])) {
                    $base64Image = $validated['processed_image_base64'];
                    $timestamp = now()->timestamp;
                    
                    $imageContent = base64_decode($base64Image);
                    
                    $extension = 'jpg';

                    $filename = sprintf(
                        'device-images/%s/processed_%s.%s',
                        $device->id,
                        $timestamp,
                        $extension
                    );

                    // Delete old processed image if exists
                    if ($device->last_processed_image_path && Storage::disk('public')->exists($device->last_processed_image_path)) {
                        Storage::disk('public')->delete($device->last_processed_image_path);
                    }

                    Storage::disk('public')->put($filename, $imageContent);

                    $device->last_processed_image_path = $filename;
                    $device->save();
                }
            });

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
