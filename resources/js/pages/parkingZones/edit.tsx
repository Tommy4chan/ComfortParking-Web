import AppLayout from '@/layouts/app-layout';
import parkingZones from '@/routes/parking-zones';
import { ParkingZone, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FormTemplate from './formTemplate';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parking Zones',
        href: parkingZones.index().url,
    },
    {
        title: 'Edit Parking Zone',
        href: '#',
    },
];

export default function Create({ parkingZone }: { parkingZone: ParkingZone }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Parking Zone" />
            <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-lg">
                    <FormTemplate
                        parkingZone={parkingZone}
                        {...parkingZones.update(parkingZone.id)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
