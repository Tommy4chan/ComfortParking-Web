import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/devices';
import parkingZones from '@/routes/parking-zones';
import { ParkingZone, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FormTemplate from './formTemplate';

export default function Create({ parkingZone }: { parkingZone: ParkingZone }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Parking Zones',
            href: parkingZones.index().url,
        },
        {
            title: parkingZone.title,
            href: parkingZones.show(parkingZone.id).url,
        },
        {
            title: 'Create Device',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Device" />
            <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-7xl">
                    <FormTemplate parkingZone={parkingZone} {...store()} />
                </div>
            </div>
        </AppLayout>
    );
}
