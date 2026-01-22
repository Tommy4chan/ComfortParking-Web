import { buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { ParkingZone, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { index, destroy, show, create, edit } from '@/routes/parking-zones';
import ActionButtons from '@/components/custom-ui/actionButtons';
import AvailableSpotsBadge from '@/components/custom-ui/availableSpotsBadge';
import ListLayout from '@/layouts/list/layout';
import FormattedDate from '@/components/custom-ui/formattedDate';
import NothingFoundList from '@/components/custom-ui/nothingFoundList';

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
    const handleRowClick = (id: number) => {
        router.visit(show(id).url);
    };

    const createText = "Create Parking Zone";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parking Zones" />
            <ListLayout
                title="Parking Zones"
                description="Manage and monitor all parking zones"
                createUrl={create().url}
                createText={createText}
            >
                {parkingZones.length > 0 ? (
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
                            {parkingZones.map((parkingZone) => {
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
                                            <AvailableSpotsBadge availableSpots={parkingZone.available_spots} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    occupancyRate < 50 ? "outline" :
                                                        occupancyRate < 80 ? "secondary" :
                                                            "destructive"
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
                                                showUrl={show(parkingZone.id).url}
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
                        createUrl={create().url}
                        createText={createText}
                        title="No parking zones found"
                        description="Get started by creating your first parking zone"
                    />
                )}
            </ListLayout>
        </AppLayout>
    );
}
