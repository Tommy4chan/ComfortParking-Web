import ActionButtons from '@/components/custom-ui/actionButtons';
import DeviceTable from '@/components/custom-ui/deviceTable';
import FormattedDate from '@/components/custom-ui/formattedDate';
import ParkingSpotsGrid from '@/components/custom-ui/parkingSpotsGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import ListLayout from '@/layouts/list/layout';
import devices from '@/routes/devices';
import parkingZones from '@/routes/parking-zones';
import { ParkingZone, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import TelemetryCharts from '@/components/custom-ui/telemetryCharts';
import { ExternalLink } from 'lucide-react';

export default function Show({ parkingZone, telemetry, currentRange = '24h' }: { parkingZone: ParkingZone, telemetry: any[], currentRange?: '24h' | '7d' }) {
    const [timeframe, setTimeframe] = useState<'24h' | '7d'>(currentRange as '24h' | '7d');

    const handleRangeChange = (range: '24h' | '7d') => {
        setTimeframe(range);
        router.get(parkingZones.show(parkingZone.id).url, { range }, { preserveScroll: true, preserveState: false });
    };
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
            <div className="container mx-auto space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    {parkingZone.title}
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    {parkingZone.description}
                                </CardDescription>
                            </div>
                            <ActionButtons
                                editUrl={parkingZones.edit(parkingZone.id).url}
                                destroyUrl={
                                    parkingZones.destroy(parkingZone.id).url
                                }
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Location
                                </p>
                                <p className="text-base">
                                    {parkingZone.latitude},{' '}
                                    {parkingZone.longitude}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Last Reported
                                </p>
                                <p className="text-base">
                                    <FormattedDate
                                        date={parkingZone.last_reported_at}
                                        format="with-timezone"
                                    />
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Payment
                                </p>
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
                                    {parkingZone.is_paid &&
                                        parkingZone.payment_url && (
                                            <a
                                                href={parkingZone.payment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                >
                                                    <ExternalLink className="mr-1 size-3.5" />
                                                    Payment page
                                                </Button>
                                            </a>
                                        )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    Zone Telemetry
                                </CardTitle>
                                <CardDescription>
                                    Visual representation of spot usage, battery patterns, and network stability across all devices in this zone.
                                </CardDescription>
                            </div>
                            <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-white/5 backdrop-blur-md">
                                <button
                                    onClick={() => handleRangeChange('24h')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-200 ${timeframe === '24h' ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                >
                                    24H
                                </button>
                                <button
                                    onClick={() => handleRangeChange('7d')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-200 ${timeframe === '7d' ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                >
                                    7D
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <TelemetryCharts
                            data={telemetry}
                            timeframe={timeframe}
                            scope="zone"
                        />
                    </CardContent>
                </Card>

                <ListLayout
                    title="Devices"
                    description="List of devices monitoring this parking zone"
                    createUrl={
                        devices.create({
                            query: { parking_zone_id: parkingZone.id },
                        }).url
                    }
                    createText="Add Device"
                    isChild={true}
                >
                    <DeviceTable devices={parkingZone.devices} />
                </ListLayout>
            </div>
        </AppLayout>
    );
}
