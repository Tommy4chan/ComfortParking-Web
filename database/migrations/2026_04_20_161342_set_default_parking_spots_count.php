<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('devices')->whereNull('parking_spots_count')->update(['parking_spots_count' => 0]);

        Schema::table('devices', function (Blueprint $table) {
            $table->integer('parking_spots_count')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->integer('parking_spots_count')->nullable()->change();
        });
    }
};
