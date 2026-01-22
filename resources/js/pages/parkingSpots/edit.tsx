import AppLayout from '@/layouts/app-layout';
import parkingZones from '@/routes/parking-zones';
import devices from '@/routes/devices';
import { ParkingSpot, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FormTemplate from './formTemplate';
import { update } from '@/routes/parking-spots';

export default function Edit({ parkingSpot }: { parkingSpot: ParkingSpot }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Parking Zones',
            href: parkingZones.index().url,
        },
        {
            title: parkingSpot.device?.parking_zone?.title || 'Parking Zone',
            href: parkingZones.show(parkingSpot.device?.parking_zone_id || 0).url,
        },
        {
            title: parkingSpot.device?.title || 'Device',
            href: devices.show(parkingSpot.device_id).url,
        },
        {
            title: 'Edit Parking Spot',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Parking Spot" />
            <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-lg">
                    <FormTemplate
                        parkingSpot={parkingSpot}
                        device={parkingSpot.device!}
                        {...update(parkingSpot.id)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
