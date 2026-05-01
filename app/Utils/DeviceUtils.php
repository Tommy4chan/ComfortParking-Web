<?php

namespace App\Utils;

use App\Models\ChildDevice;
use App\Models\Device;

class DeviceUtils
{
    public static function getDeviceStatus(Device $device): string
    {
        return self::getStatus($device->last_reported_at, $device->battery_voltage);
    }

    public static function getChildDeviceStatus(ChildDevice $childDevice): string
    {
        return self::getStatus($childDevice->last_reported_at, $childDevice->battery_voltage);
    }

    public static function getStatus($lastReportedAt, $batteryVoltage): string
    {
        if (empty($lastReportedAt)) {
            return 'offline';
        }

        $minutesSinceReport = now()->diffInMinutes($lastReportedAt);
        
        if ($minutesSinceReport > 60) {
            return 'offline';
        }
        
        if ($batteryVoltage !== null && $batteryVoltage < 3100) {
            return 'warning';
        }
        
        if ($minutesSinceReport > 30) {
            return 'warning';
        }
        
        return 'online';
    }
}