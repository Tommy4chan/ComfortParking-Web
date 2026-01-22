<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_spots', function (Blueprint $table) {
            $table->unsignedInteger('point_1_x')->default(0);
            $table->unsignedInteger('point_1_y')->default(0);
            $table->unsignedInteger('point_2_x')->default(0);
            $table->unsignedInteger('point_2_y')->default(0);
            $table->unsignedInteger('point_3_x')->default(0);
            $table->unsignedInteger('point_3_y')->default(0);
            $table->unsignedInteger('point_4_x')->default(0);
            $table->unsignedInteger('point_4_y')->default(0);
        });

        DB::statement('
            UPDATE parking_spots SET 
                point_1_x = top_x, point_1_y = top_y,
                point_2_x = bottom_x, point_2_y = top_y,
                point_3_x = bottom_x, point_3_y = bottom_y,
                point_4_x = top_x, point_4_y = bottom_y
        ');

        // 3. Drop old columns
        Schema::table('parking_spots', function (Blueprint $table) {
            $table->dropColumn(['top_x', 'top_y', 'bottom_x', 'bottom_y']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parking_spots', function (Blueprint $table) {
            $table->unsignedInteger('top_x')->default(0);
            $table->unsignedInteger('top_y')->default(0);
            $table->unsignedInteger('bottom_x')->default(0);
            $table->unsignedInteger('bottom_y')->default(0);
        });

        DB::statement('
            UPDATE parking_spots SET 
                top_x = LEAST(point_1_x, point_2_x, point_3_x, point_4_x),
                top_y = LEAST(point_1_y, point_2_y, point_3_y, point_4_y),
                bottom_x = GREATEST(point_1_x, point_2_x, point_3_x, point_4_x),
                bottom_y = GREATEST(point_1_y, point_2_y, point_3_y, point_4_y)
        ');

        Schema::table('parking_spots', function (Blueprint $table) {
            $table->dropColumn([
                'point_1_x', 'point_1_y',
                'point_2_x', 'point_2_y',
                'point_3_x', 'point_3_y',
                'point_4_x', 'point_4_y'
            ]);
        });
    }
};
