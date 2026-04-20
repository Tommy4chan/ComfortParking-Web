import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { destroy, show, edit } from '@/routes/devices';
import ActionButtons from '@/components/custom-ui/actionButtons';
import AvailableSpotsBadge from '@/components/custom-ui/availableSpotsBadge';
import { Device } from '@/types';
import FormattedDate from '@/components/custom-ui/formattedDate';
import BatteryVoltageBadge from './batteryVoltageBadge';
import StatusBadge from './statusBadge';
import NothingFoundList from './nothingFoundList';

export default function DeviceTable({
    devices,
    hasActiveFilters = false,
}: {
    devices?: Device[] | null;
    hasActiveFilters?: boolean;
}) {
    const handleRowClick = (id: number) => {
        router.visit(show(id).url);
    };

    return (
        devices && devices.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-center">Total Spots</TableHead>
                        <TableHead className="text-center">Used Spots</TableHead>
                        <TableHead className="text-center">Available</TableHead>
                        <TableHead className="text-center">Battery</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Last Reported</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {devices.map((device) => (
                        <TableRow
                            key={device.id}
                            onClick={() => handleRowClick(device.id)}
                            className="cursor-pointer hover:bg-muted/50"
                        >
                            <TableCell className="font-mono text-sm">{device.id}</TableCell>
                            <TableCell>{device.title}</TableCell>
                            <TableCell className="text-center">{device.total_parking_spots}</TableCell>
                            <TableCell className="text-center">{device.used_parking_spots}</TableCell>
                            <TableCell className="text-center">
                                <AvailableSpotsBadge availableSpots={device.available_parking_spots} totalSpots={device.total_parking_spots} />
                            </TableCell>
                            <TableCell className="text-center">
                                <BatteryVoltageBadge batteryVoltage={device.battery_voltage} isSmall={true} />
                            </TableCell>
                            <TableCell className="text-center">
                                <StatusBadge status={device.status} isSmall={true} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                <FormattedDate date={device.last_reported_at} format="relative" />
                            </TableCell>
                            <TableCell>
                                <ActionButtons
                                    editUrl={edit(device.id).url}
                                    destroyUrl={destroy(device.id).url}
                                    title={device.title}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <NothingFoundList 
                title={hasActiveFilters ? 'No devices match your filters' : 'No devices found'}
                description={hasActiveFilters
                    ? 'Adjust the search criteria or reset filters to see all devices.'
                    : 'Get started by creating your first device in parking zone'}
            />
        )
    );
}
