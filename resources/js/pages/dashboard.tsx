import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CircleAlert, CircleOff, ChevronRight } from 'lucide-react';
import { show as showDevice } from '@/routes/devices';
import { show as showZone } from '@/routes/parking-zones';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type AlertSeverity = 'error' | 'warning';
type AlertKind = 'offline' | 'low_battery' | 'heartbeat_missing' | 'signal_issue';

interface DashboardAlertItem {
    id: string;
    device_id?: number;
    child_id?: number;
    type?: 'device' | 'child';
    source: string;
    severity: AlertSeverity;
    kind: AlertKind;
    message: string;
    since: string;
}

interface DashboardProps {
    topLoadedZones: {
        id: number;
        zone: string;
        total: number;
        used: number;
        available: number;
        occupancy: number;
    }[];
    deviceAlerts: DashboardAlertItem[];
    childDeviceAlerts: DashboardAlertItem[];
    healthStats: { name: string; value: number; color: string }[];
    usageStats: { total: number; used: number; free: number };
    zoneOccupancyList: { zone: string; used: number; available: number }[];
    telemetry24h: {
        hour: string;
        usedSpots: number;
        freeSpots: number;
        online: number;
        warning: number;
        offline: number;
        arrivals: number;
        departures: number;
    }[];
}

export default function Dashboard() {
    const { props } = usePage();
    const { topLoadedZones, deviceAlerts, childDeviceAlerts, healthStats, usageStats, telemetry24h } = props as unknown as DashboardProps;

    const allAlerts = [...deviceAlerts, ...childDeviceAlerts];
    const errorCount = allAlerts.filter((alert) => alert.severity === 'error').length;
    const warningCount = allAlerts.filter((alert) => alert.severity === 'warning').length;

    const severityMeta = {
        error: {
            label: 'Error',
            Icon: CircleOff,
            className: 'border-rose-800 bg-rose-950 text-rose-200',
        },
        warning: {
            label: 'Warning',
            Icon: CircleAlert,
            className: 'border-amber-800 bg-amber-950 text-amber-200',
        },
    } as const;

    const kindMeta = {
        offline: {
            label: 'Offline',
            Icon: CircleOff,
        },
        low_battery: {
            label: 'Low battery',
            Icon: AlertTriangle,
        },
        heartbeat_missing: {
            label: 'Missing heartbeat',
            Icon: CircleAlert,
        },
        signal_issue: {
            label: 'Signal issue',
            Icon: AlertTriangle,
        },
    } as const;

    const renderAlertItem = (alert: DashboardAlertItem) => {
        const severity = severityMeta[alert.severity];
        const kind = kindMeta[alert.kind];

        const linkHref = alert.device_id 
            ? showDevice(alert.device_id).url 
            : '#';

        return (
            <Link 
                key={alert.id} 
                href={linkHref}
                className="group flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
            >
                <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{alert.source}</p>
                    <p className="text-muted-foreground truncate text-xs">{alert.message}</p>
                </div>

                <div className="ml-3 flex items-center gap-2">
                    <Badge className="border-slate-700 bg-slate-900 text-slate-200 gap-1 hidden sm:inline-flex">
                        <kind.Icon className="size-3" />
                        {kind.label}
                    </Badge>
                    <Badge className={`${severity.className} gap-1`}>
                        <severity.Icon className="size-3" />
                        {severity.label}
                    </Badge>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">{alert.since}</span>
                    <ChevronRight className="size-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
            </Link>
        );
    };

    const tooltipStyle = {
        backgroundColor: '#09090B',
        borderColor: '#27272A',
        color: '#E4E4E7',
        borderRadius: '10px',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 xl:grid-cols-3">
                    <Card>
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle>Parking Spots Used (24h)</CardTitle>
                                <Badge className="border-slate-700 bg-slate-900 text-slate-300">Live trend</Badge>
                            </div>
                            <CardDescription>Hourly occupancy pattern for all zones combined.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72 pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry24h}>
                                    <defs>
                                        <linearGradient id="usedSpotsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#27272A" />
                                    <XAxis dataKey="hour" tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                                    <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="usedSpots" stroke="#38BDF8" fill="url(#usedSpotsGradient)" strokeWidth={2.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle>Device Health (24h)</CardTitle>
                                <Badge className="border-slate-700 bg-slate-900 text-slate-300">Telemetry</Badge>
                            </div>
                            <CardDescription>Online, warning, and offline devices over time.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72 pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={telemetry24h}>
                                    <CartesianGrid vertical={false} stroke="#27272A" />
                                    <XAxis dataKey="hour" tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                                    <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="online" stroke="#34D399" strokeWidth={2.2} dot={false} />
                                    <Line type="monotone" dataKey="warning" stroke="#FBBF24" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="offline" stroke="#FB7185" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle>Parking Flow (24h)</CardTitle>
                                <Badge className="border-slate-700 bg-slate-900 text-slate-300">Entries vs exits</Badge>
                            </div>
                            <CardDescription>Hourly arrivals and departures across all zones.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72 pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={telemetry24h}>
                                    <CartesianGrid vertical={false} stroke="#27272A" />
                                    <XAxis dataKey="hour" tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                                    <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="arrivals" stroke="#22D3EE" strokeWidth={2.2} dot={false} />
                                    <Line type="monotone" dataKey="departures" stroke="#A78BFA" strokeWidth={2.2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle>Device Errors and Warnings</CardTitle>
                                    <CardDescription>Active incidents tracked in real-time from your hardware.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="destructive">Errors: {errorCount}</Badge>
                                    <Badge className="border-amber-800 bg-amber-950 text-amber-200">Warnings: {warningCount}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {deviceAlerts.length === 0 && childDeviceAlerts.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                                    All devices are online and operating normally.
                                </div>
                            ) : (
                                <>
                                    {deviceAlerts.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold">Master Devices</p>
                                            {deviceAlerts.map(renderAlertItem)}
                                        </div>
                                    )}

                                    {childDeviceAlerts.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold">Child Sensors</p>
                                            {childDeviceAlerts.map(renderAlertItem)}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle>Most Loaded Parking Zones</CardTitle>
                                    <CardDescription>Zones with the highest real-time occupancy rates.</CardDescription>
                                </div>
                                <Badge className="border-slate-700 bg-slate-900 text-slate-200">Top 6 zones</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topLoadedZones.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                                    No parking zones configured yet.
                                </div>
                            ) : (
                                topLoadedZones.map((zone, index) => (
                                    <Link 
                                        href={showZone(zone.id).url}
                                        key={zone.zone} 
                                        className="group block rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-xs">#{index + 1}</span>
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors">{zone.zone}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {zone.available === 0 ? (
                                                    <Badge variant="destructive" className="gap-1"><ArrowUpRight className="size-3" /> 100%</Badge>
                                                ) : zone.occupancy < 50 ? (
                                                    <Badge className="border-emerald-800 bg-emerald-950 text-emerald-200 gap-1"><ArrowDownRight className="size-3" /> {zone.occupancy}%</Badge>
                                                ) : (
                                                    <Badge className="border-amber-800 bg-amber-950 text-amber-200 gap-1"><ArrowUpRight className="size-3" /> {zone.occupancy}%</Badge>
                                                )}
                                                <span className="text-muted-foreground text-xs">Free: {zone.available}</span>
                                                <ChevronRight className="size-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${zone.available === 0 ? 'bg-rose-500' : zone.occupancy < 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                style={{ width: `${zone.occupancy}%` }}
                                            />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
