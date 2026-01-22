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
        Schema::create('parking_spots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->boolean('is_used')->default(false);
            $table->unsignedSmallInteger('index')->comment('Parking spot number to identify it');
            $table->unsignedInteger('top_x');
            $table->unsignedInteger('top_y');
            $table->unsignedInteger('bottom_x');
            $table->unsignedInteger('bottom_y');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_spots');
    }
};
