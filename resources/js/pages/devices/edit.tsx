import AppLayout from '@/layouts/app-layout';
import { update } from '@/routes/devices';
import parkingZones from '@/routes/parking-zones';
import { Device, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FormTemplate from './formTemplate';

export default function Edit({ device }: { device: Device }) {
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
            title: 'Edit Device',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Device" />
            <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-7xl">
                    <FormTemplate
                        device={device}
                        parkingZone={device.parking_zone!}
                        {...update(device.id)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
