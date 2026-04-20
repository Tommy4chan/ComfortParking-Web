<?php

namespace App\Services;

use App\Models\Device;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageRecognitionService
{
    public static function send(Device $device, string $imagePath, string $originalFilename): void
    {
        $device->loadMissing('childDevices');

        $zone = [
            'point_1_x' => $device->zone_point_1_x,
            'point_1_y' => $device->zone_point_1_y,
            'point_2_x' => $device->zone_point_2_x,
            'point_2_y' => $device->zone_point_2_y,
            'point_3_x' => $device->zone_point_3_x,
            'point_3_y' => $device->zone_point_3_y,
            'point_4_x' => $device->zone_point_4_x,
            'point_4_y' => $device->zone_point_4_y,
        ];

        $childDevicesPayload = $device->childDevices->map(function ($childDevice) {
            return [
                'id' => $childDevice->id,
                'is_spot_used' => $childDevice->is_spot_used,
                'position_x' => $childDevice->position_x,
                'position_y' => $childDevice->position_y,
            ];
        })->toArray();

        $imageContent = Storage::get($imagePath);
        $imageBase64 = base64_encode($imageContent);

        $payload = [
            'device_id' => $device->id,
            'parking_spots_count' => $device->parking_spots_count,
            'zone' => json_encode($zone),
            'child_devices' => json_encode($childDevicesPayload),
            'image_base64' => $imageBase64,
        ];

        $secret = config('services.image_recognition.api_secret');
        $dataToSign = $device->id.json_encode($zone).$device->parking_spots_count;
        $signature = hash_hmac('sha256', $dataToSign, $secret);
        $headerName = config('services.image_recognition.signature_header', 'X-Signature');

        try {
            $response = Http::timeout(config('services.image_recognition.timeout', 30))
                ->withHeaders([
                    $headerName => $signature,
                ])
                ->post(config('services.image_recognition.api_url'), $payload);

            if ($response->successful()) {
                Log::info('Image recognition request sent successfully', [
                    'device_id' => $device->id,
                ]);
            } else {
                Log::error('Image recognition API returned error', [
                    'device_id' => $device->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \Exception('External API returned error: '.$response->status());
            }
        } catch (\Exception $e) {
            Log::error('Failed to send image recognition request', [
                'device_id' => $device->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
