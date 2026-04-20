<?php

namespace App\Providers;

use App\Models\ChildDevice;
use App\Models\Device;
use App\Observers\ChildDeviceObserver;
use App\Observers\DeviceObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (App::environment('production')) {
            URL::forceScheme('https');
        }

        Device::observe(DeviceObserver::class);
        ChildDevice::observe(ChildDeviceObserver::class);
    }
}
