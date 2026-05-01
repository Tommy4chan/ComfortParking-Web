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
        Schema::create('device_telemetry_hourlies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('parking_zone_id')->nullable()->constrained()->cascadeOnDelete();
            $table->timestamp('hour_bucket');
            $table->enum('scope', ['device', 'zone', 'system']);
            $table->decimal('avg_used_spots', 8, 2);
            $table->integer('max_used_spots');
            $table->integer('min_used_spots');
            $table->decimal('avg_occupancy_pct', 5, 2);
            $table->integer('total_arrivals');
            $table->integer('total_departures');
            $table->decimal('avg_response_time_ms', 8, 2)->nullable();
            $table->integer('online_device_minutes');
            $table->integer('offline_device_minutes');
            $table->timestamps();

            $table->unique(['scope', 'device_id', 'parking_zone_id', 'hour_bucket'], 'dth_unique_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_telemetry_hourlies');
    }
};
