import AppLayout from '@/layouts/app-layout';
import parkingZones from '@/routes/parking-zones';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FormTemplate from './formTemplate';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parking Zones',
        href: parkingZones.index().url,
    },
    {
        title: 'Create Parking Zone',
        href: parkingZones.create().url,
    },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Parking Zone" />
            <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-lg">
                    <FormTemplate {...parkingZones.store()} />
                </div>
            </div>
        </AppLayout>
    );
}
