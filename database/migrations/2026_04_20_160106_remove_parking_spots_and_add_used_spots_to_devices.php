<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add used_parking_spots to devices (AI updates this directly)
        Schema::table('devices', function (Blueprint $table) {
            $table->integer('used_parking_spots')->default(0)->after('parking_spots_count');
        });

        // Drop parking_spot_id FK from child_devices
        Schema::table('child_devices', function (Blueprint $table) {
            $table->dropForeign(['parking_spot_id']);
            $table->dropColumn('parking_spot_id');
        });

        // Drop the parking_spots table entirely
        Schema::dropIfExists('parking_spots');
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn('used_parking_spots');
        });

        Schema::create('parking_spots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->integer('index');
            $table->boolean('is_used')->default(false);
            $table->integer('point_1_x')->nullable();
            $table->integer('point_1_y')->nullable();
            $table->integer('point_2_x')->nullable();
            $table->integer('point_2_y')->nullable();
            $table->integer('point_3_x')->nullable();
            $table->integer('point_3_y')->nullable();
            $table->integer('point_4_x')->nullable();
            $table->integer('point_4_y')->nullable();
        });

        Schema::table('child_devices', function (Blueprint $table) {
            $table->foreignId('parking_spot_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
