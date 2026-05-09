<?php

namespace App\Utils;

use Carbon\Carbon;

class TelemetryUtils
{
    /**
     * Pads a device's telemetry snapshots to ensure continuous data points.
     * Fills missing intervals by carrying over the last known state and marking as offline.
     */
    public static function padDeviceSnapshots($snapshots, Carbon $start, Carbon $end, int $intervalMinutes = 15): array
    {
        $padded = [];
        $snapshotsCollection = collect($snapshots);

        $grouped = [];
        foreach ($snapshotsCollection as $snapshot) {
            $bucket = Carbon::parse($snapshot->recorded_at)->floorMinutes($intervalMinutes)->timestamp;
            // Always keep latest within the bucket; store as plain array immediately
            $snapshotArray = is_array($snapshot) ? $snapshot : $snapshot->toArray();
            if (! isset($grouped[$bucket]) || Carbon::parse($snapshot->recorded_at) > Carbon::parse($grouped[$bucket]['recorded_at'])) {
                $grouped[$bucket] = $snapshotArray;
            }
        }

        $currentBucket = $start->copy()->floorMinutes($intervalMinutes);
        $endBucket = $end->copy()->floorMinutes($intervalMinutes);

        $lastKnown = null;

        while ($currentBucket <= $endBucket) {
            $ts = $currentBucket->timestamp;

            if (isset($grouped[$ts])) {
                $lastKnown = $grouped[$ts];
                $item = $lastKnown;
                $item['recorded_at'] = $currentBucket->toIso8601String();
                $padded[] = $item;
            } else {
                if ($lastKnown) {
                    $item = $lastKnown;
                    $item['recorded_at'] = $currentBucket->toIso8601String();
                    $item['status'] = 'offline';
                    $item['battery_voltage_mv'] = null;
                    $padded[] = $item;
                }
            }

            $currentBucket->addMinutes($intervalMinutes);
        }

        return $padded;
    }

    /**
     * Pads zone telemetry by maintaining the state of ALL devices in the zone independently,
     * so that the total aggregation doesn't spike downward if a device skips a report.
     */
    public static function padZoneSnapshots($snapshots, Carbon $start, Carbon $end, int $intervalMinutes = 15): array
    {
        $padded = [];
        $snapshotsCollection = collect($snapshots);

        // Group by bucket AND device
        $groupedByBucketDevice = [];
        $deviceIds = [];

        foreach ($snapshotsCollection as $snapshot) {
            $bucket = Carbon::parse($snapshot->recorded_at)->floorMinutes($intervalMinutes)->timestamp;
            $deviceId = is_array($snapshot) ? ($snapshot['device_id'] ?? null) : ($snapshot->device_id ?? null);
            if (! $deviceId) {
                continue;
            }

            $deviceIds[$deviceId] = true;
            $snapshotArray = is_array($snapshot) ? $snapshot : $snapshot->toArray();

            if (! isset($groupedByBucketDevice[$bucket][$deviceId]) ||
                Carbon::parse($snapshot->recorded_at) > Carbon::parse($groupedByBucketDevice[$bucket][$deviceId]['recorded_at'])) {
                $groupedByBucketDevice[$bucket][$deviceId] = $snapshotArray;
            }
        }

        $deviceIds = array_keys($deviceIds);
        $currentBucket = $start->copy()->floorMinutes($intervalMinutes);
        $endBucket = $end->copy()->floorMinutes($intervalMinutes);

        $lastKnownState = [];

        while ($currentBucket <= $endBucket) {
            $ts = $currentBucket->timestamp;

            foreach ($deviceIds as $deviceId) {
                if (isset($groupedByBucketDevice[$ts][$deviceId])) {
                    $lastKnownState[$deviceId] = $groupedByBucketDevice[$ts][$deviceId];
                    $item = $lastKnownState[$deviceId];
                    $item['recorded_at'] = $currentBucket->toIso8601String();
                    $padded[] = $item;
                } elseif (isset($lastKnownState[$deviceId])) {
                    $item = $lastKnownState[$deviceId];
                    $item['recorded_at'] = $currentBucket->toIso8601String();
                    $item['status'] = 'offline';
                    $item['battery_voltage_mv'] = null;
                    $padded[] = $item;
                }
            }

            $currentBucket->addMinutes($intervalMinutes);
        }

        return $padded;
    }
}
