import ImagePointEditor, {
    PointDef,
} from '@/components/custom-ui/imagePointEditor';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Device, ParkingZone } from '@/types';
import { Form } from '@inertiajs/react';
import { Crosshair, MapPin, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

type FormTemplateProps = {
    device?: Device;
    parkingZone: ParkingZone;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({
    device,
    parkingZone,
    url,
    method,
}: FormTemplateProps) => {
    const isEditing = !!device;

    const [isImageRecEnabled, setIsImageRecEnabled] = useState(
        device?.image_recognition_enabled ?? false,
    );

    const [points, setPoints] = useState<PointDef[]>([
        {
            id: '1',
            label: 'Point 1',
            color: 'bg-red-500',
            x: device?.zone_point_1_x ?? null,
            y: device?.zone_point_1_y ?? null,
        },
        {
            id: '2',
            label: 'Point 2',
            color: 'bg-blue-500',
            x: device?.zone_point_2_x ?? null,
            y: device?.zone_point_2_y ?? null,
        },
        {
            id: '3',
            label: 'Point 3',
            color: 'bg-green-500',
            x: device?.zone_point_3_x ?? null,
            y: device?.zone_point_3_y ?? null,
        },
        {
            id: '4',
            label: 'Point 4',
            color: 'bg-yellow-500',
            x: device?.zone_point_4_x ?? null,
            y: device?.zone_point_4_y ?? null,
        },
    ]);

    const handlePointChange = (
        id: string,
        x: number | null,
        y: number | null,
    ) => {
        setPoints((prev) =>
            prev.map((p) => (p.id === id ? { ...p, x, y } : p)),
        );
    };

    const handleResetPoints = () => {
        setPoints((prev) => prev.map((p) => ({ ...p, x: null, y: null })));
    };

    const handleInputChange = (id: string, axis: 'x' | 'y', val: string) => {
        const num = val === '' ? null : parseInt(val, 10);
        setPoints((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [axis]: num } : p)),
        );
    };

    const leftColumnClass = `space-y-6 ${
        isImageRecEnabled ? 'xl:col-span-4' : 'xl:col-span-12'
    }`;

    return (
        <Card className="w-full">
            <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <CardTitle className="text-2xl">
                            {isEditing ? 'Edit Device' : 'Create Device'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {isEditing
                                ? 'Update the device configuration and zone mapping below.'
                                : 'Configure a new device and its associated parking zone area.'}
                        </CardDescription>
                    </div>
                    <div className="flex w-full shrink-0 items-center justify-center gap-2 rounded-full border bg-muted/40 px-4 py-2 shadow-sm md:w-auto md:justify-start">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Zone:
                        </span>
                        <span className="text-sm font-semibold">
                            {parkingZone.title}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <Form
                    action={url}
                    method={method}
                    className="flex flex-col gap-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="parking_zone_id"
                                value={parkingZone.id}
                            />
                            
                            <input
                                type="hidden"
                                name="image_recognition_enabled"
                                value={isImageRecEnabled ? '1' : '0'}
                            />

                            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                                {/* Left Column: Basic Details */}
                                <div className={leftColumnClass}>
                                    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
                                        <h3 className="border-b pb-2 text-lg font-semibold">
                                            Device Details
                                        </h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="title">
                                                Device Title{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                name="title"
                                                defaultValue={
                                                    device?.title || ''
                                                }
                                                required
                                                autoFocus
                                                placeholder="e.g., Sensor A1"
                                                className={
                                                    errors.title
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            <InputError
                                                message={errors.title}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="latitude">
                                                    Latitude{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="latitude"
                                                    type="number"
                                                    step="any"
                                                    name="latitude"
                                                    defaultValue={
                                                        device?.latitude
                                                    }
                                                    required
                                                    placeholder="40.7128"
                                                    className={
                                                        errors.latitude
                                                            ? 'border-destructive'
                                                            : ''
                                                    }
                                                />
                                                <InputError
                                                    message={errors.latitude}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="longitude">
                                                    Longitude{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="longitude"
                                                    type="number"
                                                    step="any"
                                                    name="longitude"
                                                    defaultValue={
                                                        device?.longitude
                                                    }
                                                    required
                                                    placeholder="-74.0060"
                                                    className={
                                                        errors.longitude
                                                            ? 'border-destructive'
                                                            : ''
                                                    }
                                                />
                                                <InputError
                                                    message={errors.longitude}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="parking_spots_count">
                                                Parking Spots Count{' '}
                                                {isEditing && (
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                )}
                                                {!isEditing && (
                                                    <span className="ml-1 text-xs text-muted-foreground">
                                                        (optional)
                                                    </span>
                                                )}
                                            </Label>
                                            <Input
                                                id="parking_spots_count"
                                                type="number"
                                                name="parking_spots_count"
                                                defaultValue={
                                                    device?.parking_spots_count ??
                                                    ''
                                                }
                                                required={isEditing}
                                                min={1}
                                                placeholder="Total monitored spots"
                                                className={
                                                    errors.parking_spots_count
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.parking_spots_count
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="image_recognition_enabled">
                                                    Image Recognition
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable server-side CV spot detection.
                                                </p>
                                            </div>
                                            <Switch
                                                id="image_recognition_enabled"
                                                checked={isImageRecEnabled}
                                                onCheckedChange={setIsImageRecEnabled}
                                            />
                                            <InputError
                                                message={
                                                    errors.image_recognition_enabled
                                                }
                                            />
                                        </div>
                                    </div>

                                    {!isImageRecEnabled && (
                                        <div className="flex items-start gap-4 rounded-xl border bg-muted/20 p-5 text-sm text-muted-foreground shadow-sm">
                                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                <Crosshair className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-semibold text-foreground">
                                                    Visual mapper disabled
                                                </p>
                                                <p>
                                                    Turn on image recognition to unlock the
                                                    visual zone mapper and coordinate editor.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {isImageRecEnabled && (
                                        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                    <Crosshair className="h-5 w-5" />
                                                    Coordinate Values
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                                {points.map((point) => (
                                                    <div
                                                        key={point.id}
                                                        className="space-y-2 rounded-lg border bg-muted/20 p-3"
                                                    >
                                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                                            <span
                                                                className={`h-3 w-3 rounded-full ${point.color}`}
                                                            ></span>
                                                            {point.label}
                                                        </Label>
                                                        <div className="mt-1 grid grid-cols-2 gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs text-muted-foreground">
                                                                    X
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    name={`zone_point_${point.id}_x`}
                                                                    value={
                                                                        point.x ??
                                                                        ''
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleInputChange(
                                                                            point.id,
                                                                            'x',
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="-"
                                                                    min={0}
                                                                    className={`h-8 ${(errors as Record<string, string>)[`zone_point_${point.id}_x`] ? 'border-destructive' : ''}`}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs text-muted-foreground">
                                                                    Y
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    name={`zone_point_${point.id}_y`}
                                                                    value={
                                                                        point.y ??
                                                                        ''
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleInputChange(
                                                                            point.id,
                                                                            'y',
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="-"
                                                                    min={0}
                                                                    className={`h-8 ${(errors as Record<string, string>)[`zone_point_${point.id}_y`] ? 'border-destructive' : ''}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Visual Editor */}
                                {isImageRecEnabled && (
                                    <div className="flex h-full flex-col xl:col-span-8">
                                        <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                                            <div className="border-b bg-muted/30 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                            Visual Zone Mapper
                                                        </h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            Click on the image to
                                                            place the points
                                                            sequentially and form
                                                            the monitoring zone.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleResetPoints}
                                                        className="shrink-0"
                                                    >
                                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                                        Reset Points
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="relative flex-grow bg-muted/10 p-4">
                                                {device?.last_image_url ? (
                                                    <ImagePointEditor
                                                        imageUrl={
                                                            device.last_image_url
                                                        }
                                                        points={points}
                                                        onChange={handlePointChange}
                                                        onReset={handleResetPoints}
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed bg-background">
                                                        <div className="max-w-sm space-y-2 px-4 text-center">
                                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                                <Crosshair className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                            <h4 className="font-medium">
                                                                No Image Available
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                The visual editor
                                                                will appear here
                                                                once the device
                                                                uploads its first
                                                                camera capture. You
                                                                can input
                                                                coordinates manually
                                                                on the left in the
                                                                meantime.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-4 border-t pt-6">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full px-8 sm:w-auto"
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    {isEditing
                                        ? 'Save Device Configuration'
                                        : 'Create Device'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
};
export default FormTemplate;
