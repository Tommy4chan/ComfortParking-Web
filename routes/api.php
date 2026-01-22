<?php

use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\ImageRecognitionWebhookController;
use App\Http\Controllers\Api\V1\ParkingZoneController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Version 1
Route::prefix('v1')->name('api.')->group(function () {
    
    // Parking Zones REST API
    Route::get('zones/in-bounds', [ParkingZoneController::class, 'inBounds'])->name('zones.in-bounds');
    Route::get('zones/nearby', [ParkingZoneController::class, 'nearby'])->name('zones.nearby');

    // Device sync endpoint for IoT devices
    Route::post('devices/sync', [DeviceController::class, 'sync'])->name('devices.sync');

    // Webhook for external image recognition API
    Route::post('webhooks/image-recognition', [ImageRecognitionWebhookController::class, 'handle'])
        ->middleware('verify.webhook.signature')
        ->name('webhooks.image-recognition');
});
