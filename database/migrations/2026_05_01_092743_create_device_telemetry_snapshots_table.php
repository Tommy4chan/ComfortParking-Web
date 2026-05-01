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
        Schema::create('device_telemetry_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parking_zone_id')->constrained()->cascadeOnDelete();
            $table->timestamp('recorded_at');
            $table->integer('used_spots');
            $table->integer('total_spots');
            $table->integer('battery_voltage_mv');
            $table->enum('status', ['online', 'warning', 'low_battery', 'offline']);
            $table->integer('response_time_ms')->nullable();
            $table->integer('online_child_count')->default(0);
            $table->integer('offline_child_count')->default(0);
            $table->timestamps();

            $table->index(['device_id', 'recorded_at']);
            $table->index(['parking_zone_id', 'recorded_at']);
            $table->index('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_telemetry_snapshots');
    }
};
