<?php

use App\Http\Controllers\ChildDeviceController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ParkingZoneController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

use App\Http\Controllers\DashboardController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('parking-zones', ParkingZoneController::class);
    Route::resource('devices', DeviceController::class);
    Route::resource('child-devices', ChildDeviceController::class)->except(['index', 'show']);
});

require __DIR__.'/settings.php';
