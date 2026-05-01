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
        Schema::table('parking_zones', function (Blueprint $table) {
            $table->boolean('is_paid')->default(false)->after('description');
            $table->string('payment_url', 2048)->nullable()->after('is_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parking_zones', function (Blueprint $table) {
            $table->dropColumn(['is_paid', 'payment_url']);
        });
    }
};
