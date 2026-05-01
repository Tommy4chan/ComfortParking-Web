import DeviceTable from '@/components/custom-ui/deviceTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import ListLayout from '@/layouts/list/layout';
import { index } from '@/routes/devices';
import { Device, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Devices',
        href: index().url,
    },
];

export default function Index({ devices }: { devices: Device[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [batteryFilter, setBatteryFilter] = useState('all');
    const [reportFilter, setReportFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const reportIsRecent = (lastReportedAt: string | null) => {
        if (!lastReportedAt) {
            return false;
        }

        const reportTime = new Date(lastReportedAt).getTime();
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        return reportTime >= oneDayAgo;
    };

    const filteredDevices = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = devices.filter((device) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                device.title.toLowerCase().includes(normalizedSearch) ||
                device.id.toString().includes(normalizedSearch) ||
                device.hash.toLowerCase().includes(normalizedSearch);

            const matchesStatus =
                statusFilter === 'all' || device.status === statusFilter;

            const matchesBattery =
                batteryFilter === 'all' ||
                (batteryFilter === 'good' && device.battery_voltage >= 3.7) ||
                (batteryFilter === 'low' &&
                    device.battery_voltage >= 3.4 &&
                    device.battery_voltage < 3.7) ||
                (batteryFilter === 'critical' && device.battery_voltage < 3.4);

            const matchesReport =
                reportFilter === 'all' ||
                (reportFilter === 'recent' &&
                    reportIsRecent(device.last_reported_at)) ||
                (reportFilter === 'stale' &&
                    !!device.last_reported_at &&
                    !reportIsRecent(device.last_reported_at)) ||
                (reportFilter === 'missing' && !device.last_reported_at);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesBattery &&
                matchesReport
            );
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }

            if (sortBy === 'battery') {
                return b.battery_voltage - a.battery_voltage;
            }

            if (sortBy === 'spots') {
                return b.available_parking_spots - a.available_parking_spots;
            }

            if (sortBy === 'status') {
                return a.status.localeCompare(b.status);
            }

            const timeA = a.last_reported_at
                ? new Date(a.last_reported_at).getTime()
                : 0;
            const timeB = b.last_reported_at
                ? new Date(b.last_reported_at).getTime()
                : 0;

            return timeB - timeA;
        });
    }, [
        devices,
        searchTerm,
        statusFilter,
        batteryFilter,
        reportFilter,
        sortBy,
    ]);

    const hasActiveFilters =
        searchTerm.trim().length > 0 ||
        statusFilter !== 'all' ||
        batteryFilter !== 'all' ||
        reportFilter !== 'all' ||
        sortBy !== 'recent';

    const onlineCount = devices.filter(
        (device) => device.status === 'online',
    ).length;
    const warningCount = devices.filter(
        (device) => device.status === 'warning',
    ).length;
    const offlineCount = devices.filter(
        (device) => device.status === 'offline',
    ).length;
    const totalAvailableSpots = devices.reduce(
        (sum, device) => sum + device.available_parking_spots,
        0,
    );

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setBatteryFilter('all');
        setReportFilter('all');
        setSortBy('recent');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Devices" />
            <ListLayout
                title="Devices"
                description="Manage and monitor all devices connected to parking zones."
            >
                <div className="mb-6 space-y-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative w-full xl:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by title, hash, or device ID"
                                className="pl-9"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>

                        <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-4">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full xl:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Any status
                                    </SelectItem>
                                    <SelectItem value="online">
                                        Online
                                    </SelectItem>
                                    <SelectItem value="warning">
                                        Warning
                                    </SelectItem>
                                    <SelectItem value="offline">
                                        Offline
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={batteryFilter}
                                onValueChange={setBatteryFilter}
                            >
                                <SelectTrigger className="w-full xl:w-40">
                                    <SelectValue placeholder="Battery" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All battery levels
                                    </SelectItem>
                                    <SelectItem value="good">
                                        Good (&ge; 3.7V)
                                    </SelectItem>
                                    <SelectItem value="low">
                                        Low (3.4V - 3.69V)
                                    </SelectItem>
                                    <SelectItem value="critical">
                                        Critical (&lt; 3.4V)
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={reportFilter}
                                onValueChange={setReportFilter}
                            >
                                <SelectTrigger className="w-full xl:w-44">
                                    <SelectValue placeholder="Reported" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Any report state
                                    </SelectItem>
                                    <SelectItem value="recent">
                                        Reported in 24h
                                    </SelectItem>
                                    <SelectItem value="stale">
                                        Older than 24h
                                    </SelectItem>
                                    <SelectItem value="missing">
                                        Never reported
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full xl:w-44">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">
                                        Sort: last reported
                                    </SelectItem>
                                    <SelectItem value="title">
                                        Sort: title
                                    </SelectItem>
                                    <SelectItem value="battery">
                                        Sort: battery
                                    </SelectItem>
                                    <SelectItem value="spots">
                                        Sort: available spots
                                    </SelectItem>
                                    <SelectItem value="status">
                                        Sort: status
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" type="button">
                                <Download className="size-4" />
                                Export CSV
                            </Button>
                            <Button variant="outline" size="sm" type="button">
                                Refresh
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={clearFilters}
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-slate-700 bg-slate-800 text-slate-100">
                            Visible: {filteredDevices.length}
                        </Badge>
                        <Badge className="border-emerald-800 bg-emerald-950 text-emerald-200">
                            Online: {onlineCount}
                        </Badge>
                        <Badge className="border-amber-800 bg-amber-950 text-amber-200">
                            Warning: {warningCount}
                        </Badge>
                        <Badge className="border-rose-800 bg-rose-950 text-rose-200">
                            Offline: {offlineCount}
                        </Badge>
                        <Badge className="border-cyan-800 bg-cyan-950 text-cyan-200">
                            Free spots: {totalAvailableSpots}
                        </Badge>
                        {hasActiveFilters && (
                            <Badge className="border-violet-800 bg-violet-950 text-violet-200">
                                Filters active
                            </Badge>
                        )}
                    </div>
                </div>

                <DeviceTable
                    devices={filteredDevices}
                    hasActiveFilters={hasActiveFilters}
                />
            </ListLayout>
        </AppLayout>
    );
}
