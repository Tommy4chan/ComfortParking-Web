import AppLayout from '@/layouts/app-layout';
import parkingZones from '@/routes/parking-zones';
import devices from '@/routes/devices';
import { Device, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Hash, Plus, Image as ImageIcon } from 'lucide-react';
import ActionButtons from '@/components/custom-ui/actionButtons';
import ParkingSpotsGrid from '@/components/custom-ui/parkingSpotsGrid';
import FormattedDate from '@/components/custom-ui/formattedDate';
import BatteryVoltageBadge from '@/components/custom-ui/batteryVoltageBadge';
import StatusBadge from '@/components/custom-ui/statusBadge';
import { CopyButton } from '@/components/ui/copyButton';
import NothingFoundList from '@/components/custom-ui/nothingFoundList';
import childDevices from '@/routes/child-devices';
import { buttonVariants } from '@/components/ui/button';
import HashText from '@/components/custom-ui/hashText';
import ListLayout from '@/layouts/list/layout';
import SpotStatusBadge from '@/components/custom-ui/spotStatusBadge';
import parkingSpots from '@/routes/parking-spots';
import { useState } from 'react';
import ImageDialog from '@/components/custom-ui/imageDialog';

export default function Show({ device }: { device: Device }) {
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [processedImageDialogOpen, setProcessedImageDialogOpen] = useState(false);
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Parking Zones',
            href: parkingZones.index().url,
        },
        {
            title: device.parking_zone?.title || 'Parking Zone',
            href: parkingZones.show(device.parking_zone_id).url,
        },
        {
            title: device.title,
            href: devices.show(device.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={device.title} />
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{device.title}</CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <Link
                                        href={parkingZones.show(device.parking_zone_id).url}
                                        className="hover:underline"
                                    >
                                        {device.parking_zone?.title}
                                    </Link>
                                </CardDescription>
                            </div>
                            <ActionButtons
                                destroyUrl={devices.destroy(device.id).url}
                                editUrl={devices.edit(device.id).url}
                                title={device.title}
                                isBigButtons={true}

                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ParkingSpotsGrid
                            totalSpots={device.total_parking_spots}
                            usedSpots={device.used_parking_spots}
                            availableSpots={device.available_parking_spots}
                        />

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Battery Voltage</p>
                                <BatteryVoltageBadge batteryVoltage={device.battery_voltage} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <StatusBadge status={device.status} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="text-base">{device.latitude}, {device.longitude}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Device Hash</p>
                                <HashText hash={device.hash} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Last Reported</p>
                                <p className="text-base">
                                    <FormattedDate date={device.last_reported_at} format="with-timezone" />
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ListLayout
                    createUrl={parkingSpots.create({ query: { device_id: device.id } }).url}
                    createText='Add Parking spot'
                    title='Parking Spots'
                    description='List of individual parking spots'
                    isChild={true}
                >
                    {device.parking_spots && device.parking_spots.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Index</TableHead>
                                    <TableHead className="text-center">Spot Status</TableHead>
                                    <TableHead className="text-center">Point 1</TableHead>
                                    <TableHead className="text-center">Point 2</TableHead>
                                    <TableHead className="text-center">Point 3</TableHead>
                                    <TableHead className="text-center">Point 4</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {device.parking_spots.map((parkingSpot) => (
                                    <TableRow key={parkingSpot.id}>
                                        <TableCell className="font-mono text-sm">{parkingSpot.index}</TableCell>
                                        <TableCell className="text-center">
                                            <SpotStatusBadge
                                                isUsed={parkingSpot.is_used}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            ({parkingSpot.point_1_x}, {parkingSpot.point_1_y})
                                        </TableCell>
                                        <TableCell className="text-center">
                                            ({parkingSpot.point_2_x}, {parkingSpot.point_2_y})
                                        </TableCell>
                                        <TableCell className="text-center">
                                            ({parkingSpot.point_3_x}, {parkingSpot.point_3_y})
                                        </TableCell>
                                        <TableCell className="text-center">
                                            ({parkingSpot.point_4_x}, {parkingSpot.point_4_y})
                                        </TableCell>
                                        <TableCell>
                                            <ActionButtons
                                                editUrl={parkingSpots.edit(parkingSpot.id).url}
                                                destroyUrl={parkingSpots.destroy(parkingSpot.id).url}
                                                title={`Parking Spot #${parkingSpot.index}`}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <NothingFoundList
                            title="No parkin spots found"
                            description="Get started by creating your first parking spot"
                            createUrl={parkingSpots.create({ query: { device_id: device.id } }).url}
                            createText='Add Parking spot'
                        />
                    )}
                </ListLayout>

                <ListLayout
                    createUrl={childDevices.create({ query: { device_id: device.id } }).url}
                    createText='Add Child Device'
                    title='Child Devices'
                    description='List of individual parking spot sensors'
                    isChild={true}
                >
                    {device.child_devices && device.child_devices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead className="text-center">Spot Status</TableHead>
                                    <TableHead className="text-center">Battery</TableHead>
                                    <TableHead className="text-center">Device Status</TableHead>
                                    <TableHead>Parking Spot</TableHead>
                                    <TableHead>Hash</TableHead>
                                    <TableHead>Last Reported</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {device.child_devices.map((childDevice) => (
                                    <TableRow key={childDevice.id}>
                                        <TableCell className="font-mono text-sm">
                                            {childDevice.id}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <SpotStatusBadge
                                                isUsed={childDevice.is_spot_used}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <BatteryVoltageBadge batteryVoltage={childDevice.battery_voltage} isSmall={true} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusBadge status={childDevice.status} isSmall={true} />
                                        </TableCell>
                                        <TableCell>
                                            {childDevice.parking_spot_id ? (
                                                <>Parking Spot #{device.parking_spots?.find(s => s.id === childDevice.parking_spot_id)?.index ?? 'N/A'}</>
                                            ) : (
                                                <span className="text-muted-foreground">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <HashText hash={childDevice.hash} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <FormattedDate date={childDevice.last_reported_at} format="relative" />
                                        </TableCell>
                                        <TableCell>
                                            <ActionButtons
                                                editUrl={childDevices.edit(childDevice.id).url}
                                                destroyUrl={childDevices.destroy(childDevice.id).url}
                                                title="Child Device"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <NothingFoundList
                            title="No child device found"
                            description="Get started by creating your first child device"
                            createUrl={childDevices.create({ query: { device_id: device.id } }).url}
                            createText='Add Child Device'
                        />
                    )}
                </ListLayout>

                
                {(device.last_image_url || device.last_processed_image_url) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {device.last_image_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Last Received Image
                                    </CardTitle>
                                    <CardDescription>
                                        Most recent image captured by this device
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div 
                                        className="relative cursor-pointer group overflow-hidden rounded-lg border bg-muted"
                                        onClick={() => setImageDialogOpen(true)}
                                    >
                                        <img
                                            src={device.last_image_url}
                                            alt={`Last image from ${device.title}`}
                                            className="w-full h-auto object-contain max-h-96 transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-md">
                                                Click to enlarge
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {device.last_processed_image_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Last Processed Image
                                    </CardTitle>
                                    <CardDescription>
                                        Image processed by recognition service
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div 
                                        className="relative cursor-pointer group overflow-hidden rounded-lg border bg-muted"
                                        onClick={() => setProcessedImageDialogOpen(true)}
                                    >
                                        <img
                                            src={device.last_processed_image_url}
                                            alt={`Last processed image from ${device.title}`}
                                            className="w-full h-auto object-contain max-h-96 transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-md">
                                                Click to enlarge
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <ImageDialog
                    open={imageDialogOpen}
                    onOpenChange={setImageDialogOpen}
                    title={`Device Image - ${device.title}`}
                    imageUrl={device.last_image_url}
                />

                <ImageDialog
                    open={processedImageDialogOpen}
                    onOpenChange={setProcessedImageDialogOpen}
                    title={`Processed Image - ${device.title}`}
                    imageUrl={device.last_processed_image_url}
                />

            </div>
        </AppLayout>
    );
}
