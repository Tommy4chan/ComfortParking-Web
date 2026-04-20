<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImageRecognition\WebhookRequest;
use App\Models\Device;
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

            $device->save();

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
