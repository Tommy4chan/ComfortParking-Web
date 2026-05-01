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
        Schema::create('parking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_device_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parking_zone_id')->constrained()->cascadeOnDelete();
            $table->enum('event_type', ['arrival', 'departure']);
            $table->timestamp('occurred_at');
            $table->boolean('previous_state');
            $table->boolean('new_state');
            $table->timestamps();

            $table->index(['parking_zone_id', 'occurred_at']);
            $table->index(['device_id', 'occurred_at']);
            $table->index('occurred_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_events');
    }
};
