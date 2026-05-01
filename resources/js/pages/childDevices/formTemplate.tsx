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
import { ChildDevice, Device } from '@/types';
import { Form } from '@inertiajs/react';
import { Cpu, MapPinned, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

type FormTemplateProps = {
    childDevice?: ChildDevice;
    device: Device;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({
    childDevice,
    device,
    url,
    method,
}: FormTemplateProps) => {
    const isEditing = !!childDevice;

    const [points, setPoints] = useState<PointDef[]>([
        {
            id: 'pos',
            label: 'Sensor Position',
            x: childDevice?.position_x ?? null,
            y: childDevice?.position_y ?? null,
            color: 'bg-indigo-500',
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

    return (
        <Card className="w-full">
            <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <CardTitle className="text-2xl">
                            {isEditing
                                ? 'Edit Child Device'
                                : 'Create Child Device'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {isEditing
                                ? 'Update the child sensor configuration and position below.'
                                : 'Configure a new child sensor and map its position on the parent device image.'}
                        </CardDescription>
                    </div>
                    <div className="flex w-full shrink-0 items-center justify-center gap-2 rounded-full border bg-muted/40 px-4 py-2 shadow-sm md:w-auto md:justify-start">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Parent:
                        </span>
                        <span className="text-sm font-semibold">
                            {device.title}
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
                            {!isEditing && (
                                <input
                                    type="hidden"
                                    name="device_id"
                                    value={device.id}
                                />
                            )}

                            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                                {/* Left Column: Basic Details & Manual Inputs */}
                                <div className="space-y-6 xl:col-span-4">
                                    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
                                        <h3 className="border-b pb-2 text-lg font-semibold">
                                            Sensor Information
                                        </h3>

                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <p className="text-sm text-muted-foreground">
                                                {isEditing
                                                    ? 'This child device keeps its existing hardware hash and syncs with the parent gateway.'
                                                    : 'A unique hardware hash will be automatically generated for this child device after creation.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Manual Coordinates Input */}
                                    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <MapPinned className="h-5 w-5" />
                                                Sensor Coordinates
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    <span
                                                        className={`h-3 w-3 rounded-full ${points[0].color || 'bg-primary'}`}
                                                    ></span>
                                                    {points[0].label}
                                                </Label>
                                                <div className="mt-1 grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            X
                                                        </span>
                                                        <Input
                                                            id="position_x"
                                                            type="number"
                                                            name="position_x"
                                                            value={
                                                                points[0].x ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    'pos',
                                                                    'x',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="-"
                                                            min={0}
                                                            className={`h-8 ${(errors as Record<string, string>).position_x ? 'border-destructive' : ''}`}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            Y
                                                        </span>
                                                        <Input
                                                            id="position_y"
                                                            type="number"
                                                            name="position_y"
                                                            value={
                                                                points[0].y ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    'pos',
                                                                    'y',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="-"
                                                            min={0}
                                                            className={`h-8 ${(errors as Record<string, string>).position_y ? 'border-destructive' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                                <InputError
                                                    message={
                                                        (
                                                            errors as Record<
                                                                string,
                                                                string
                                                            >
                                                        ).position_x
                                                    }
                                                    className="mt-1"
                                                />
                                                <InputError
                                                    message={
                                                        (
                                                            errors as Record<
                                                                string,
                                                                string
                                                            >
                                                        ).position_y
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Visual Editor */}
                                <div className="flex h-full flex-col xl:col-span-8">
                                    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                                        <div className="border-b bg-muted/30 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                        Visual Position Mapper
                                                    </h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Click on the image to
                                                        drop the sensor pin.
                                                        This helps visualize
                                                        where the child sensor
                                                        is physically located.
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
                                                    Reset Pin
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="relative flex-grow bg-muted/10 p-4">
                                            {device.last_image_url ? (
                                                <ImagePointEditor
                                                    imageUrl={
                                                        device.last_image_url
                                                    }
                                                    points={points}
                                                    onChange={handlePointChange}
                                                />
                                            ) : (
                                                <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed bg-background">
                                                    <div className="max-w-sm space-y-2 px-4 text-center">
                                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                            <MapPinned className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <h4 className="font-medium">
                                                            No Parent Image
                                                            Available
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            The visual editor
                                                            will appear here
                                                            once the parent
                                                            device uploads its
                                                            first camera
                                                            capture.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                                        ? 'Save Sensor Configuration'
                                        : 'Create Sensor'}
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
