import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { ParkingZone, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { index, destroy, show, create, edit } from '@/routes/parking-zones';
import ActionButtons from '@/components/custom-ui/actionButtons';
import AvailableSpotsBadge from '@/components/custom-ui/availableSpotsBadge';
import ListLayout from '@/layouts/list/layout';
import FormattedDate from '@/components/custom-ui/formattedDate';
import NothingFoundList from '@/components/custom-ui/nothingFoundList';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parking Zones',
        href: index().url,
    },
];

export default function Index({
    parkingZones,
}: {
    parkingZones: ParkingZone[];
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [occupancyFilter, setOccupancyFilter] = useState('all');
    const [reportFilter, setReportFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const handleRowClick = (id: number) => {
        router.visit(show(id).url);
    };

    const createText = "Create Parking Zone";

    const reportIsRecent = (lastReportedAt: string | null) => {
        if (!lastReportedAt) {
            return false;
        }

        const reportTime = new Date(lastReportedAt).getTime();
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        return reportTime >= oneDayAgo;
    };

    const filteredParkingZones = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = parkingZones.filter((parkingZone) => {
            const occupancyRate = parkingZone.total_spots > 0
                ? (parkingZone.used_spots / parkingZone.total_spots) * 100
                : 0;

            const matchesSearch = normalizedSearch.length === 0
                || parkingZone.title.toLowerCase().includes(normalizedSearch)
                || parkingZone.id.toString().includes(normalizedSearch);

            const matchesOccupancy = occupancyFilter === 'all'
                || (occupancyFilter === 'low' && occupancyRate < 50)
                || (occupancyFilter === 'medium' && occupancyRate >= 50 && occupancyRate < 80)
                || (occupancyFilter === 'high' && occupancyRate >= 80);

            const matchesReport = reportFilter === 'all'
                || (reportFilter === 'recent' && reportIsRecent(parkingZone.last_reported_at))
                || (reportFilter === 'stale' && !!parkingZone.last_reported_at && !reportIsRecent(parkingZone.last_reported_at))
                || (reportFilter === 'missing' && !parkingZone.last_reported_at);

            return matchesSearch && matchesOccupancy && matchesReport;
        });

        return filtered.sort((a, b) => {
            const occupancyA = a.total_spots > 0 ? (a.used_spots / a.total_spots) * 100 : 0;
            const occupancyB = b.total_spots > 0 ? (b.used_spots / b.total_spots) * 100 : 0;

            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }

            if (sortBy === 'available') {
                return b.available_spots - a.available_spots;
            }

            if (sortBy === 'occupancy') {
                return occupancyB - occupancyA;
            }

            const timeA = a.last_reported_at ? new Date(a.last_reported_at).getTime() : 0;
            const timeB = b.last_reported_at ? new Date(b.last_reported_at).getTime() : 0;

            return timeB - timeA;
        });
    }, [parkingZones, searchTerm, occupancyFilter, reportFilter, sortBy]);

    const hasActiveFilters = searchTerm.trim().length > 0
        || occupancyFilter !== 'all'
        || reportFilter !== 'all'
        || sortBy !== 'recent';

    const highOccupancyCount = parkingZones.filter((parkingZone) => {
        if (parkingZone.total_spots <= 0) {
            return false;
        }

        return (parkingZone.used_spots / parkingZone.total_spots) * 100 >= 80;
    }).length;

    const recentlyReportedCount = parkingZones.filter((parkingZone) => reportIsRecent(parkingZone.last_reported_at)).length;

    const totalAvailableSpots = parkingZones.reduce((sum, parkingZone) => sum + parkingZone.available_spots, 0);

    const clearFilters = () => {
        setSearchTerm('');
        setOccupancyFilter('all');
        setReportFilter('all');
        setSortBy('recent');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parking Zones" />
            <ListLayout
                title="Parking Zones"
                description="Manage and monitor all parking zones"
                createUrl={create().url}
                createText={createText}
            >
                <div className="mb-6 space-y-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative w-full xl:max-w-sm">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search by title or zone ID"
                                className="pl-9"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>

                        <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-3">
                            <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
                                <SelectTrigger className="w-full xl:w-48">
                                    <SelectValue placeholder="Occupancy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All occupancy levels</SelectItem>
                                    <SelectItem value="low">Low (&lt; 50%)</SelectItem>
                                    <SelectItem value="medium">Medium (50-79%)</SelectItem>
                                    <SelectItem value="high">High (&ge; 80%)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={reportFilter} onValueChange={setReportFilter}>
                                <SelectTrigger className="w-full xl:w-44">
                                    <SelectValue placeholder="Reported" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any report state</SelectItem>
                                    <SelectItem value="recent">Reported in 24h</SelectItem>
                                    <SelectItem value="stale">Older than 24h</SelectItem>
                                    <SelectItem value="missing">Never reported</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full xl:w-44">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">Sort: last reported</SelectItem>
                                    <SelectItem value="title">Sort: title</SelectItem>
                                    <SelectItem value="available">Sort: available spots</SelectItem>
                                    <SelectItem value="occupancy">Sort: occupancy</SelectItem>
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
                            <Button variant="ghost" size="sm" type="button" onClick={clearFilters}>
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-slate-700 bg-slate-800 text-slate-100">
                            Visible: {filteredParkingZones.length}
                        </Badge>
                        <Badge className="border-emerald-800 bg-emerald-950 text-emerald-200">
                            Free spots: {totalAvailableSpots}
                        </Badge>
                        <Badge className="border-amber-800 bg-amber-950 text-amber-200">
                            High occupancy: {highOccupancyCount}
                        </Badge>
                        <Badge className="border-slate-700 bg-slate-900 text-slate-300">
                            Reported in 24h: {recentlyReportedCount}
                        </Badge>
                        {hasActiveFilters && (
                            <Badge className="border-violet-800 bg-violet-950 text-violet-200">
                                Filters active
                            </Badge>
                        )}
                    </div>
                </div>

                {filteredParkingZones.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="text-center">Total Spots</TableHead>
                                <TableHead className="text-center">Used Spots</TableHead>
                                <TableHead className="text-center">Available</TableHead>
                                <TableHead className="text-center">Occupancy rate</TableHead>
                                <TableHead>Last Reported</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParkingZones.map((parkingZone) => {
                                const occupancyRate = parkingZone.total_spots > 0
                                    ? (parkingZone.used_spots / parkingZone.total_spots) * 100
                                    : 0;

                                return (
                                    <TableRow
                                        key={parkingZone.id}
                                        onClick={() => handleRowClick(parkingZone.id)}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell className="font-mono text-sm">{parkingZone.id}</TableCell>
                                        <TableCell className="font-medium">{parkingZone.title}</TableCell>
                                        <TableCell className="text-center">{parkingZone.total_spots}</TableCell>
                                        <TableCell className="text-center">{parkingZone.used_spots}</TableCell>
                                        <TableCell className="text-center">
                                            <AvailableSpotsBadge availableSpots={parkingZone.available_spots} totalSpots={parkingZone.total_spots} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={
                                                    parkingZone.available_spots === 0
                                                        ? "border-rose-800 bg-rose-950 text-rose-200"
                                                        : occupancyRate < 50
                                                            ? "border-emerald-800 bg-emerald-950 text-emerald-200"
                                                            : "border-amber-800 bg-amber-950 text-amber-200"
                                                }
                                            >
                                                {Math.round(occupancyRate)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <FormattedDate date={parkingZone.last_reported_at} format="relative" />
                                        </TableCell>
                                        <TableCell>
                                            <ActionButtons
                                                editUrl={edit(parkingZone.id).url}
                                                destroyUrl={destroy(parkingZone.id).url}
                                                title={parkingZone.title}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <NothingFoundList
                        createUrl={hasActiveFilters ? undefined : create().url}
                        createText={hasActiveFilters ? undefined : createText}
                        title={hasActiveFilters ? 'No parking zones match your filters' : 'No parking zones found'}
                        description={hasActiveFilters
                            ? 'Adjust search criteria or reset filters to see all zones.'
                            : 'Get started by creating your first parking zone'}
                    />
                )}
            </ListLayout>
        </AppLayout>
    );
}
