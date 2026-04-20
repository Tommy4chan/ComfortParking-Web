<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_telemetries', function (Blueprint $table) {
            $table->id();
            $table->timestamp('recorded_at')->index();
            $table->integer('used_spots');
            $table->integer('free_spots');
            $table->integer('arrivals')->default(0);
            $table->integer('departures')->default(0);
            $table->integer('online_devices');
            $table->integer('warning_devices');
            $table->integer('offline_devices');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_telemetries');
    }
};
