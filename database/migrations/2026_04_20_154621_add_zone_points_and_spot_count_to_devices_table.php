<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->integer('zone_point_1_x')->nullable()->after('last_processed_image_path');
            $table->integer('zone_point_1_y')->nullable()->after('zone_point_1_x');
            $table->integer('zone_point_2_x')->nullable()->after('zone_point_1_y');
            $table->integer('zone_point_2_y')->nullable()->after('zone_point_2_x');
            $table->integer('zone_point_3_x')->nullable()->after('zone_point_2_y');
            $table->integer('zone_point_3_y')->nullable()->after('zone_point_3_x');
            $table->integer('zone_point_4_x')->nullable()->after('zone_point_3_y');
            $table->integer('zone_point_4_y')->nullable()->after('zone_point_4_x');
            $table->integer('parking_spots_count')->nullable()->after('zone_point_4_y');
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn([
                'zone_point_1_x',
                'zone_point_1_y',
                'zone_point_2_x',
                'zone_point_2_y',
                'zone_point_3_x',
                'zone_point_3_y',
                'zone_point_4_x',
                'zone_point_4_y',
                'parking_spots_count',
            ]);
        });
    }
};
