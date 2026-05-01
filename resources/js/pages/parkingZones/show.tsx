import AppLayout from '@/layouts/app-layout';
import parkingZones from '@/routes/parking-zones';
import devices from '@/routes/devices';
import { ParkingZone, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import ActionButtons from '@/components/custom-ui/actionButtons';
import DeviceTable from '@/components/custom-ui/deviceTable';
import ListLayout from '@/layouts/list/layout';
import ParkingSpotsGrid from '@/components/custom-ui/parkingSpotsGrid';
import FormattedDate from '@/components/custom-ui/formattedDate';

export default function Show({ parkingZone }: { parkingZone: ParkingZone }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Parking Zones',
            href: parkingZones.index().url,
        },
        {
            title: parkingZone.title,
            href: parkingZones.show(parkingZone.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={parkingZone.title} />
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{parkingZone.title}</CardTitle>
                                <CardDescription className="mt-2">{parkingZone.description}</CardDescription>
                            </div>
                            <ActionButtons
                                editUrl={parkingZones.edit(parkingZone.id).url}
                                destroyUrl={parkingZones.destroy(parkingZone.id).url}
                                title={parkingZone.title}
                                isBigButtons
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ParkingSpotsGrid
                            totalSpots={parkingZone.total_spots}
                            usedSpots={parkingZone.used_spots}
                            availableSpots={parkingZone.available_spots}
                        />

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="text-base">{parkingZone.latitude}, {parkingZone.longitude}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Last Reported</p>
                                <p className="text-base">
                                    <FormattedDate date={parkingZone.last_reported_at} format="with-timezone" />
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Payment</p>
                                <div className="flex items-center gap-2">
                                    {parkingZone.is_paid ? (
                                        <Badge className="border-yellow-800 bg-yellow-950 text-yellow-200">
                                            Paid
                                        </Badge>
                                    ) : (
                                        <Badge className="border-emerald-800 bg-emerald-950 text-emerald-200">
                                            Free
                                        </Badge>
                                    )}
                                    {parkingZone.is_paid && parkingZone.payment_url && (
                                        <a
                                            href={parkingZone.payment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" size="sm" type="button">
                                                <ExternalLink className="size-3.5 mr-1" />
                                                Payment page
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <ListLayout
                    title="Devices"
                    description="List of devices monitoring this parking zone"
                    createUrl={devices.create({ query: { parking_zone_id: parkingZone.id } }).url}
                    createText="Add Device"
                    isChild={true}
                >
                    <DeviceTable devices={parkingZone.devices} />
                </ListLayout>
            </div>
        </AppLayout>
    );
}
