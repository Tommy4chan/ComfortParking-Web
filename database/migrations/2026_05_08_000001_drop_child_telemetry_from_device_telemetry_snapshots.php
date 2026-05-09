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
        if (Schema::hasColumn('device_telemetry_snapshots', 'child_telemetry')) {
            Schema::table('device_telemetry_snapshots', function (Blueprint $table) {
                $table->dropColumn('child_telemetry');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('device_telemetry_snapshots', 'child_telemetry')) {
            Schema::table('device_telemetry_snapshots', function (Blueprint $table) {
                $table->json('child_telemetry')->nullable()->after('offline_child_count');
            });
        }
    }
};
