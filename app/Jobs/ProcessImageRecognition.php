<?php

namespace App\Jobs;

use App\Models\Device;
use App\Services\ImageRecognitionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessImageRecognition implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = 60;

    public $timeout = 120;

    public function __construct(
        public int $deviceId,
        public string $imagePath,
        public string $originalFilename
    ) {}

    public function handle(): void
    {
        try {
            $device = Device::find($this->deviceId);

            if (!$device) {
                Log::warning('Device not found for image recognition', [
                    'device_id' => $this->deviceId,
                ]);
                $this->cleanupImage();
                return;
            }

            if (!Storage::exists($this->imagePath)) {
                Log::error('Image file not found', [
                    'device_id' => $this->deviceId,
                    'path' => $this->imagePath,
                ]);
                return;
            }

            ImageRecognitionService::send(
                $device,
                $this->imagePath,
                $this->originalFilename
            );

            $this->cleanupImage();

        } catch (\Exception $e) {
            Log::error('Failed to process image recognition job', [
                'device_id' => $this->deviceId,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            if ($this->attempts() >= $this->tries) {
                $this->cleanupImage();
            }

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Image recognition job failed permanently', [
            'device_id' => $this->deviceId,
            'error' => $exception->getMessage(),
        ]);

        $this->cleanupImage();
    }

    private function cleanupImage(): void
    {
        if (Storage::exists($this->imagePath)) {
            Storage::delete($this->imagePath);
        }
    }
}
