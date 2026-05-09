import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush,
    AreaChart,
    Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TelemetryPoint {
    id: number;
    device_id: number;
    recorded_at: string;
    used_spots: number;
    total_spots: number;
    battery_voltage_mv: number;
    status: string;
    online_child_count: number;
    offline_child_count: number;
}

type Timeframe = '24h' | '7d';

interface TelemetryChartsProps {
    data: TelemetryPoint[];
    timeframe: Timeframe;
    scope?: 'device' | 'zone';
}

const BUCKET_MINUTES = 15;
const MAX_POINTS = 800;

const getStatusBucket = (status: string) => {
    if (status === 'online') return 'online';
    if (status === 'warning' || status === 'low_battery') return 'warning';
    return 'offline';
};

const getBucketDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return null;

    const bucketMinutes =
        Math.floor(date.getMinutes() / BUCKET_MINUTES) * BUCKET_MINUTES;

    date.setSeconds(0, 0);
    date.setMinutes(bucketMinutes);

    return date;
};

const getBucketKey = (value: string) => {
    const bucketDate = getBucketDate(value);
    return bucketDate ? bucketDate.toISOString() : value;
};

const downsampleSeries = <T,>(points: T[], maxPoints: number) => {
    if (points.length <= maxPoints) return points;

    const stride = Math.ceil(points.length / maxPoints);
    const sampled = points.filter((_, index) => index % stride === 0);
    const lastPoint = points[points.length - 1];

    if (sampled[sampled.length - 1] !== lastPoint) {
        sampled.push(lastPoint);
    }

    return sampled;
};

const formatAxisTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;

    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TelemetryCharts({
    data,
    timeframe,
    scope = 'device',
}: TelemetryChartsProps) {
    const batteryBadgeLabel = scope === 'zone' ? 'Devices' : 'Device';
    const healthBadgeLabel = scope === 'zone' ? 'Fleet' : 'Status';

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
 
        const now = new Date();
        const filterTime = new Date(
            timeframe === '24h'
                ? now.getTime() - 24 * 60 * 60 * 1000
                : now.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        const filtered = data
            .filter((point) => new Date(point.recorded_at) >= filterTime)
            .sort(
                (a, b) =>
                    new Date(a.recorded_at).getTime() -
                    new Date(b.recorded_at).getTime(),
            );

        if (scope === 'zone') {
            const latestByDeviceBucket = new Map<string, TelemetryPoint>();

            filtered.forEach((point) => {
                const bucketKey = getBucketKey(point.recorded_at);
                const deviceBucketKey = `${bucketKey}:${point.device_id}`;
                const existing = latestByDeviceBucket.get(deviceBucketKey);

                if (!existing) {
                    latestByDeviceBucket.set(deviceBucketKey, point);
                    return;
                }

                if (
                    new Date(point.recorded_at).getTime() >
                    new Date(existing.recorded_at).getTime()
                ) {
                    latestByDeviceBucket.set(deviceBucketKey, point);
                }
            });

            const grouped = new Map<
                string,
                {
                    recorded_at: string;
                    used_spots: number;
                    total_spots: number;
                    battery_total: number;
                    battery_count: number;
                    online: number;
                    warning: number;
                    offline: number;
                    [key: string]: number | string | null;
                }
            >();

            latestByDeviceBucket.forEach((point) => {
                const bucketKey = getBucketKey(point.recorded_at);
                const statusBucket = getStatusBucket(point.status);
                const existing = grouped.get(bucketKey) || {
                    recorded_at: bucketKey,
                    used_spots: 0,
                    total_spots: 0,
                    battery_total: 0,
                    battery_count: 0,
                    online: 0,
                    warning: 0,
                    offline: 0,
                };

                existing.used_spots += point.used_spots;
                existing.total_spots += point.total_spots;
                if (point.battery_voltage_mv !== null) {
                    existing.battery_total += point.battery_voltage_mv;
                    existing.battery_count += 1;
                    existing[`zone_dev_volt_${point.device_id}`] = parseFloat(
                        (point.battery_voltage_mv / 1000).toFixed(2),
                    );
                }
                existing[statusBucket] += 1;
                grouped.set(bucketKey, existing);
            });

            const points = Array.from(grouped.values())
                .sort(
                    (a, b) =>
                        new Date(a.recorded_at).getTime() -
                        new Date(b.recorded_at).getTime(),
                )
                .map((point) => ({
                    ...point,
                    time: formatAxisTime(point.recorded_at),
                    battery_voltage_v:
                        point.battery_count > 0
                            ? parseFloat(
                                  (
                                      point.battery_total /
                                      point.battery_count /
                                      1000
                                  ).toFixed(2),
                              )
                            : null,
                }));

            return downsampleSeries(points, MAX_POINTS);
        }

        const grouped = new Map<string, TelemetryPoint>();

        filtered.forEach((point) => {
            const bucketKey = getBucketKey(point.recorded_at);
            const existing = grouped.get(bucketKey);

            if (!existing) {
                grouped.set(bucketKey, {
                    ...point,
                    recorded_at: bucketKey,
                });
                return;
            }

            if (
                new Date(point.recorded_at).getTime() >
                new Date(existing.recorded_at).getTime()
            ) {
                grouped.set(bucketKey, {
                    ...point,
                    recorded_at: bucketKey,
                });
            }
        });

        const points = Array.from(grouped.values())
            .sort(
                (a, b) =>
                    new Date(a.recorded_at).getTime() -
                    new Date(b.recorded_at).getTime(),
            )
            .map((point) => ({
                ...point,
                time: formatAxisTime(point.recorded_at),
                battery_voltage_v: point.battery_voltage_mv
                    ? parseFloat((point.battery_voltage_mv / 1000).toFixed(2))
                    : null,
                online: getStatusBucket(point.status) === 'online' ? 1 : 0,
                warning: getStatusBucket(point.status) === 'warning' ? 1 : 0,
                offline: getStatusBucket(point.status) === 'offline' ? 1 : 0,
            }));

        return downsampleSeries(points, MAX_POINTS);
    }, [data, timeframe, scope]);

    const chartDataWithFlow = useMemo(() => {
        if (!chartData.length) return [];
        let previousUsed = chartData[0].used_spots || 0;
        return chartData.map((point, index) => {
            if (index === 0) {
                return {
                    ...point,
                    arrivals: 0,
                    departures: 0,
                };
            }

            const delta = point.used_spots - previousUsed;
            previousUsed = point.used_spots;

            return {
                ...point,
                arrivals: delta > 0 ? delta : 0,
                departures: delta < 0 ? Math.abs(delta) : 0,
            };
        });
    }, [chartData]);

    const batterySeriesKeys = useMemo(() => {
        if (!chartDataWithFlow.length) return [];

        const keys = new Set<string>();

        chartDataWithFlow.forEach((point) => {
            Object.keys(point).forEach((key) => {
                if (
                    key.startsWith('zone_dev_volt_')
                ) {
                    keys.add(key);
                }
            });
        });

        return Array.from(keys);
    }, [chartDataWithFlow]);

    const tooltipStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
    } as const;

    if (!chartData.length) {
        return (
            <div className="my-4 rounded-xl border border-dashed p-4 text-center text-muted-foreground">
                No telemetry data available for the selected timeframe.
            </div>
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <Card className="group relative h-full overflow-hidden">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                            Spot Usage
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-sky-500/30 bg-sky-500/10 font-mono text-[10px] tracking-wider text-sky-400 uppercase"
                        >
                            Occupancy
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="h-64 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartDataWithFlow}>
                            <defs>
                                <linearGradient
                                    id="usedSpotsChart"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#38BDF8"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#38BDF8"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                stroke="rgba(255,255,255,0.05)"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={80}
                            />
                            <YAxis
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                itemStyle={{ color: '#38BDF8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="used_spots"
                                stroke="#38BDF8"
                                fill="url(#usedSpotsChart)"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total_spots"
                                stroke="#64748b"
                                strokeDasharray="3 3"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Brush
                                dataKey="time"
                                height={26}
                                stroke="#38BDF8"
                                fill="rgba(0,0,0,0.35)"
                                tickFormatter={() => ''}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="group relative h-full overflow-hidden">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                            Battery Voltage
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] tracking-wider text-emerald-400 uppercase"
                        >
                            {batteryBadgeLabel}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="h-64 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataWithFlow}>
                            <CartesianGrid
                                vertical={false}
                                stroke="rgba(255,255,255,0.05)"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={80}
                            />
                            <YAxis
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickFormatter={(val) => Math.round(val * 100) / 100 + ""}
                                tickLine={false}
                                axisLine={false}
                                width={40}
                                domain={['dataMin - 0.2', 'dataMax + 0.2']}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            {batterySeriesKeys.map((key, index) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={key
                                        .replace('zone_dev_volt_', 'Device ')}
                                    stroke={`hsl(${(index * 137) % 360}, 70%, 60%)`}
                                    strokeWidth={1}
                                    strokeOpacity={0.6}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                            {scope === 'device' && (
                                <Line
                                    type="monotone"
                                    dataKey="battery_voltage_v"
                                    stroke="#34D399"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            )}
                            <Brush
                                dataKey="time"
                                height={26}
                                stroke="#34D399"
                                fill="rgba(0,0,0,0.35)"
                                tickFormatter={() => ''}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {scope !== 'device' && (
            <Card className="group relative h-full overflow-hidden">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                            Network Health
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] tracking-wider text-amber-400 uppercase"
                        >
                            {healthBadgeLabel}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="h-64 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataWithFlow}>
                            <CartesianGrid
                                vertical={false}
                                stroke="rgba(255,255,255,0.05)"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={80}
                            />
                            <YAxis
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line
                                type="step"
                                dataKey="online"
                                stroke="#34D399"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="step"
                                dataKey="warning"
                                stroke="#FBBF24"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="step"
                                dataKey="offline"
                                stroke="#FB7185"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Brush
                                dataKey="time"
                                height={26}
                                stroke="#FBBF24"
                                fill="rgba(0,0,0,0.35)"
                                tickFormatter={() => ''}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            )}

            <Card className="group relative h-full overflow-hidden">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                            Traffic Flow
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-indigo-500/30 bg-indigo-500/10 font-mono text-[10px] tracking-wider text-indigo-400 uppercase"
                        >
                            In/Out
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="h-64 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataWithFlow}>
                            <CartesianGrid
                                vertical={false}
                                stroke="rgba(255,255,255,0.05)"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={80}
                            />
                            <YAxis
                                tick={{
                                    fill: 'rgba(255,255,255,0.4)',
                                    fontSize: 10,
                                    fontFamily: 'JetBrains Mono',
                                }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line
                                type="monotone"
                                dataKey="arrivals"
                                stroke="#38BDF8"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="departures"
                                stroke="#A78BFA"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Brush
                                dataKey="time"
                                height={26}
                                stroke="#A78BFA"
                                fill="rgba(0,0,0,0.35)"
                                tickFormatter={() => ''}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
