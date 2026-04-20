<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('child_devices', function (Blueprint $table) {
            $table->integer('position_x')->nullable()->after('last_reported_at');
            $table->integer('position_y')->nullable()->after('position_x');
        });
    }

    public function down(): void
    {
        Schema::table('child_devices', function (Blueprint $table) {
            $table->dropColumn(['position_x', 'position_y']);
        });
    }
};
