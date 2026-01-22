import AppLayout from '@/layouts/app-layout';
import parkingZones from '@/routes/parking-zones';
import devices from '@/routes/devices';
import { ChildDevice, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FormTemplate from './formTemplate';
import { update } from '@/routes/child-devices';

export default function Edit({ childDevice }: { childDevice: ChildDevice }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Parking Zones',
            href: parkingZones.index().url,
        },
        {
            title: childDevice.device?.parking_zone?.title || 'Parking Zone',
            href: parkingZones.show(childDevice.device?.parking_zone_id || 0).url,
        },
        {
            title: childDevice.device?.title || 'Device',
            href: devices.show(childDevice.device_id).url,
        },
        {
            title: 'Edit Child Device',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Child Device" />
            <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-lg">
                    <FormTemplate
                        childDevice={childDevice}
                        device={childDevice.device!}
                        parkingSpots={childDevice.device?.parking_spots}
                        {...update(childDevice.id)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
