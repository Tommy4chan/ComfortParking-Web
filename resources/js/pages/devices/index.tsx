import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Device, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/devices';
import DeviceTable from '@/components/custom-ui/deviceTable';
import ListLayout from '@/layouts/list/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Devices',
        href: index().url,
    },
];

export default function Index({
    devices,
}: {
    devices: Device[];
}) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Devices" />
            <ListLayout
                title="Devices"
                description="Manage and monitor all devices connected to parking zones."
            >
                <DeviceTable devices={devices} />
            </ListLayout>
        </AppLayout>
    );
}
