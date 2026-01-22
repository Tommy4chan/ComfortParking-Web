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
        Schema::create('child_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('battery_voltage')->default(0)->comment('Battery voltage in mV');
            $table->string('hash', 32)->unique();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->boolean('is_spot_used')->default(false);
            $table->dateTime('last_reported_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('child_devices');
    }
};
