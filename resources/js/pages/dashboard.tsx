import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { show as showDevice } from '@/routes/devices';
import { show as showZone } from '@/routes/parking-zones';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    ChevronRight,
    CircleAlert,
    CircleOff,
    Cpu,
    Map,
    ShieldAlert,
    Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ComposedChart,
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
type AlertKind =
    | 'offline'
    | 'low_battery'
    | 'heartbeat_missing'
    | 'signal_issue';

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
        totalSpots: number;
        freeSpots: number;
        online: number;
        warning: number;
        offline: number;
        arrivals: number;
        departures: number;
    }[];
    currentRange: string;
}

export default function Dashboard() {
    const { props } = usePage();
    const {
        topLoadedZones,
        deviceAlerts,
        childDeviceAlerts,
        healthStats,
        usageStats,
        telemetry24h,
        currentRange,
    } = props as unknown as DashboardProps;

    const allAlerts = [...deviceAlerts, ...childDeviceAlerts];
    const errorCount = allAlerts.filter(
        (alert) => alert.severity === 'error',
    ).length;
    const warningCount = allAlerts.filter(
        (alert) => alert.severity === 'warning',
    ).length;

    const severityMeta = {
        error: {
            label: 'CRITICAL',
            Icon: CircleOff,
            className: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
        },
        warning: {
            label: 'WARNING',
            Icon: CircleAlert,
            className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        },
    } as const;

    // currentRange is now passed from props

    const setRange = (range: string) => {
        router.visit(dashboard().url, {
            data: { range },
            preserveScroll: true,
            preserveState: true,
        });
    };

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
                className={`group relative flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/50 sm:flex-row sm:items-center shadow-sm border-l-[4px] ${alert.severity === 'error'
                        ? 'border-l-rose-500/50 hover:border-l-rose-500'
                        : 'border-l-amber-500/50 hover:border-l-amber-500'
                    }`}
            >
                <div className="min-w-0 pl-1">
                    <div className="mb-1 flex items-center gap-2">
                        <p className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {alert.source}
                        </p>
                        <Badge
                            className={`${severity.className} gap-1 rounded-sm px-1.5 py-0 font-mono text-[10px] tracking-wider uppercase`}
                        >
                            {severity.label}
                        </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground/80">
                        {alert.message}
                    </p>
                </div>

                <div className="mt-3 flex items-center gap-3 pl-3 sm:mt-0 sm:pl-0">
                    <Badge
                        variant="outline"
                        className="gap-1.5 border-white/10 bg-black/40 font-medium text-slate-300"
                    >
                        <kind.Icon className="size-3.5" />
                        {kind.label}
                    </Badge>
                    <span className="font-mono text-xs whitespace-nowrap text-muted-foreground/60">
                        {alert.since}
                    </span>
                    <ChevronRight className="size-5 text-muted-foreground/40 transition-colors group-hover:text-white" />
                </div>
            </Link>
        );
    };

    const tooltipStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
    };

    const formatChartTime = (value: string | number) => {
        const date = new Date(value);
        if (Number.isNaN(date.valueOf())) return String(value);
        return date.toLocaleString([], {
            month: currentRange === '7d' ? 'short' : undefined,
            day: currentRange === '7d' ? 'numeric' : undefined,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />



            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="mx-auto flex h-full w-full max-w-screen-2xl flex-1 flex-col gap-8 overflow-x-auto p-4 md:p-8"
            >
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                            </div>
                            <span className="font-mono text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                                Live Telemetry
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-5xl">
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex items-center gap-6 rounded-2xl border bg-card p-4 shadow-sm">
                            <div className="flex flex-col items-start gap-1 justify-center mr-4 pr-6 border-r border-white/10">
                                <span className="font-mono text-xs tracking-widest text-muted-foreground/80 uppercase">
                                    Timeframe
                                </span>
                                <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-white/5 backdrop-blur-md">
                                    <button
                                        onClick={() => setRange('24h')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-200 ${currentRange === '24h' ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                    >
                                        24H
                                    </button>
                                    <button
                                        onClick={() => setRange('7d')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-200 ${currentRange === '7d' ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                    >
                                        7D
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="mb-1 font-mono text-[10px] tracking-widest text-muted-foreground/80 uppercase">
                                    Network
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-3xl font-medium text-white">
                                        {healthStats.find(
                                            (s) => s.name === 'Online',
                                        )?.value || 0}
                                    </span>
                                    <span className="font-mono text-sm text-muted-foreground">
                                        /{' '}
                                        {healthStats.reduce(
                                            (acc, curr) => acc + curr.value,
                                            0,
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div className="flex flex-col items-end">
                                <span className="mb-1 font-mono text-[10px] tracking-widest text-muted-foreground/80 uppercase">
                                    Active Alerts
                                </span>
                                <span className="font-mono text-3xl font-medium text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
                                    {errorCount + warningCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid gap-6 xl:grid-cols-3">
                    <motion.div variants={itemVariants}>
                        <Card className="group relative h-full overflow-hidden">
                            <CardHeader className="space-y-1 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Map className="size-5 text-sky-400" />
                                        <CardTitle className="text-lg text-white">
                                            Occupancy Trend
                                        </CardTitle>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 pt-2">
                                    <span className="font-mono text-4xl font-bold text-white">
                                        {usageStats.used}
                                    </span>
                                    <span className="font-mono text-sm tracking-wider text-muted-foreground uppercase">
                                        Spots Used
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="h-64 pt-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={telemetry24h}>
                                        <defs>
                                            <linearGradient
                                                id="usedSpots"
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
                                        <XAxis dataKey="hour" tickFormatter={formatChartTime} tick={{
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
                                        <Tooltip labelFormatter={formatChartTime} contentStyle={tooltipStyle} />
                                        <Area
                                            type="monotone"
                                            dataKey="usedSpots"
                                            name="Used Spots"
                                            stroke="#38BDF8"
                                            fill="url(#usedSpots)"
                                            strokeWidth={3}
                                            activeDot={{
                                                r: 6,
                                                fill: '#38BDF8',
                                                stroke: '#000',
                                                strokeWidth: 2,
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="totalSpots"
                                            name="Total Spots"
                                            stroke="#64748b"
                                            strokeDasharray="5 4"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="group relative h-full overflow-hidden">
                            <CardHeader className="space-y-1 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="size-5 text-emerald-400" />
                                        <CardTitle className="text-lg text-white">
                                            Device Health
                                        </CardTitle>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] tracking-wider text-emerald-400 uppercase"
                                    >
                                        Telemetry
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="h-64 pt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={telemetry24h}>
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="rgba(255,255,255,0.05)"
                                        />
                                        <XAxis dataKey="hour" tickFormatter={formatChartTime} tick={{
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
                                        <Tooltip labelFormatter={formatChartTime} contentStyle={tooltipStyle} />
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
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="group relative h-full overflow-hidden">
                            <CardHeader className="space-y-1 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Zap className="size-5 text-indigo-400" />
                                        <CardTitle className="text-lg text-white">
                                            Traffic Flow
                                        </CardTitle>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="border-indigo-500/30 bg-indigo-500/10 font-mono text-[10px] tracking-wider text-indigo-400 uppercase"
                                    >
                                        In/Out
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="h-64 pt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={telemetry24h}>
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="rgba(255,255,255,0.05)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis dataKey="hour" tickFormatter={formatChartTime} tick={{
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
                                        <Tooltip labelFormatter={formatChartTime} contentStyle={tooltipStyle} />
                                        <Line
                                            type="monotone"
                                            dataKey="arrivals"
                                            stroke="#818CF8"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{
                                                r: 6,
                                                fill: '#818CF8',
                                                stroke: '#000',
                                                strokeWidth: 2,
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="departures"
                                            stroke="#C084FC"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{
                                                r: 6,
                                                fill: '#C084FC',
                                                stroke: '#000',
                                                strokeWidth: 2,
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="mt-2 grid gap-6 xl:grid-cols-2">
                    <motion.div variants={itemVariants}>
                        <Card className="flex h-full flex-col">
                            <CardHeader className="border-b border-white/5 pb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="size-5 text-rose-400" />
                                            <CardTitle className="text-xl text-white">
                                                System Alerts
                                            </CardTitle>
                                        </div>
                                        <p className="text-sm text-muted-foreground/70">
                                            Hardware anomalies requiring
                                            attention.
                                        </p>
                                    </div>
                                    {(errorCount > 0 || warningCount > 0) && (
                                        <div className="flex items-center gap-2">
                                            {errorCount > 0 && (
                                                <Badge className="animate-pulse border-rose-500/30 bg-rose-500/20 font-mono text-rose-400">
                                                    {errorCount} ERR
                                                </Badge>
                                            )}
                                            {warningCount > 0 && (
                                                <Badge className="border-amber-500/30 bg-amber-500/20 font-mono text-amber-400">
                                                    {warningCount} WRN
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6">
                                {deviceAlerts.length === 0 &&
                                    childDeviceAlerts.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                                        <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
                                            <Activity className="size-8 text-emerald-400" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-medium text-white">
                                            All Systems Nominal
                                        </h3>
                                        <p className="max-w-sm text-sm text-muted-foreground/70">
                                            No hardware anomalies detected
                                            across the parking network.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {deviceAlerts.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="border-b border-white/5 pb-2 font-mono text-xs tracking-widest text-muted-foreground/50 uppercase">
                                                    Master Controllers
                                                </h4>
                                                <div className="space-y-3">
                                                    {deviceAlerts.map(
                                                        renderAlertItem,
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {childDeviceAlerts.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="border-b border-white/5 pb-2 font-mono text-xs tracking-widest text-muted-foreground/50 uppercase">
                                                    Sensor Nodes
                                                </h4>
                                                <div className="space-y-3">
                                                    {childDeviceAlerts.map(
                                                        renderAlertItem,
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="flex h-full flex-col">
                            <CardHeader className="border-b border-white/5 pb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="size-5 text-amber-400" />
                                            <CardTitle className="text-xl text-white">
                                                High-Load Zones
                                            </CardTitle>
                                        </div>
                                        <p className="text-sm text-muted-foreground/70">
                                            Sectors operating near maximum
                                            capacity.
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6">
                                {topLoadedZones.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                                        <Map className="mb-4 size-8 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground/70">
                                            No active zones detected.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {topLoadedZones.map((zone, index) => (
                                            <Link
                                                href={showZone(zone.id).url}
                                                key={zone.zone}
                                                className="group block rounded-xl border bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:border-primary/30"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-6 items-center justify-center rounded-md bg-white/10 font-mono text-xs text-white">
                                                            {index + 1}
                                                        </div>
                                                        <h3 className="text-base font-bold text-white transition-colors group-hover:text-primary">
                                                            {zone.zone}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {zone.available ===
                                                            0 ? (
                                                            <Badge className="gap-1.5 rounded-sm border-rose-500/30 bg-rose-500/20 font-mono text-rose-400">
                                                                <ArrowUpRight className="size-3" />{' '}
                                                                100%
                                                            </Badge>
                                                        ) : zone.occupancy <
                                                            50 ? (
                                                            <Badge className="gap-1.5 rounded-sm border-emerald-500/20 bg-emerald-500/10 font-mono text-emerald-400">
                                                                <ArrowDownRight className="size-3" />{' '}
                                                                {zone.occupancy}
                                                                %
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="gap-1.5 rounded-sm border-amber-500/20 bg-amber-500/10 font-mono text-amber-400">
                                                                <ArrowUpRight className="size-3" />{' '}
                                                                {zone.occupancy}
                                                                %
                                                            </Badge>
                                                        )}
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                                                                Available
                                                            </span>
                                                            <span className="font-mono text-sm leading-none text-white">
                                                                {zone.available}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${zone.occupancy}%`,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            ease: 'easeOut',
                                                            delay:
                                                                0.2 +
                                                                index * 0.1,
                                                        }}
                                                        className={`absolute top-0 left-0 h-full rounded-full ${zone.available === 0
                                                                ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                                                : zone.occupancy <
                                                                    50
                                                                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                                                    : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                                            }`}
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </AppLayout>
    );
}
