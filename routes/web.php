<?php

use App\Http\Controllers\ChildDeviceController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ParkingSpotController;
use App\Http\Controllers\ParkingZoneController;
use App\Models\ParkingSpot;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::resource('parking-zones', ParkingZoneController::class);
    Route::resource('devices', DeviceController::class);
    Route::resource('child-devices', ChildDeviceController::class)->except(['index', 'show']);
    Route::resource('parking-spots', ParkingSpotController::class)->except(['index', 'show']);
});

require __DIR__.'/settings.php';
