import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Device, ParkingZone } from '@/types';
import { Input } from '@/components/ui/input';
import { Form } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Crosshair, RefreshCcw } from 'lucide-react';
import ImagePointEditor, { PointDef } from '@/components/custom-ui/imagePointEditor';

type FormTemplateProps = {
    device?: Device;
    parkingZone: ParkingZone;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({ device, parkingZone, url, method }: FormTemplateProps) => {
    const isEditing = !!device;

    const [points, setPoints] = useState<PointDef[]>([
        { id: '1', label: 'Point 1', color: 'bg-red-500', x: device?.zone_point_1_x ?? null, y: device?.zone_point_1_y ?? null },
        { id: '2', label: 'Point 2', color: 'bg-blue-500', x: device?.zone_point_2_x ?? null, y: device?.zone_point_2_y ?? null },
        { id: '3', label: 'Point 3', color: 'bg-green-500', x: device?.zone_point_3_x ?? null, y: device?.zone_point_3_y ?? null },
        { id: '4', label: 'Point 4', color: 'bg-yellow-500', x: device?.zone_point_4_x ?? null, y: device?.zone_point_4_y ?? null },
    ]);

    const handlePointChange = (id: string, x: number | null, y: number | null) => {
        setPoints(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
    };

    const handleResetPoints = () => {
        setPoints(prev => prev.map(p => ({ ...p, x: null, y: null })));
    };

    const handleInputChange = (id: string, axis: 'x' | 'y', val: string) => {
        const num = val === '' ? null : parseInt(val, 10);
        setPoints(prev => prev.map(p => p.id === id ? { ...p, [axis]: num } : p));
    };

    return (
        <Card className="w-full">
            <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">{isEditing ? 'Edit Device' : 'Create Device'}</CardTitle>
                        <CardDescription className="mt-1">
                            {isEditing
                                ? 'Update the device configuration and zone mapping below.'
                                : 'Configure a new device and its associated parking zone area.'}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-full border shadow-sm shrink-0 w-full md:w-auto justify-center md:justify-start">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Zone:</span>
                        <span className="text-sm font-semibold">{parkingZone.title}</span>
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
                            <input type="hidden" name="parking_zone_id" value={parkingZone.id} />

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                {/* Left Column: Basic Details */}
                                <div className="xl:col-span-4 space-y-6">
                                    <div className="space-y-4 rounded-xl border p-5 bg-card shadow-sm">
                                        <h3 className="font-semibold text-lg border-b pb-2">Device Details</h3>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="title">
                                                Device Title <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                name="title"
                                                defaultValue={device?.title || ''}
                                                required
                                                autoFocus
                                                placeholder="e.g., Sensor A1"
                                                className={errors.title ? 'border-destructive' : ''}
                                            />
                                            <InputError message={errors.title} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="latitude">
                                                    Latitude <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="latitude"
                                                    type="number"
                                                    step="any"
                                                    name="latitude"
                                                    defaultValue={device?.latitude}
                                                    required
                                                    placeholder="40.7128"
                                                    className={errors.latitude ? 'border-destructive' : ''}
                                                />
                                                <InputError message={errors.latitude} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="longitude">
                                                    Longitude <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="longitude"
                                                    type="number"
                                                    step="any"
                                                    name="longitude"
                                                    defaultValue={device?.longitude}
                                                    required
                                                    placeholder="-74.0060"
                                                    className={errors.longitude ? 'border-destructive' : ''}
                                                />
                                                <InputError message={errors.longitude} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="parking_spots_count">
                                                Parking Spots Count{' '}
                                                {isEditing && <span className="text-destructive">*</span>}
                                                {!isEditing && (
                                                    <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                                                )}
                                            </Label>
                                            <Input
                                                id="parking_spots_count"
                                                type="number"
                                                name="parking_spots_count"
                                                defaultValue={device?.parking_spots_count ?? ''}
                                                required={isEditing}
                                                min={1}
                                                placeholder="Total monitored spots"
                                                className={errors.parking_spots_count ? 'border-destructive' : ''}
                                            />
                                            <InputError message={errors.parking_spots_count} />
                                        </div>
                                    </div>

                                    {/* Manual Coordinates Input */}
                                    <div className="space-y-4 rounded-xl border p-5 bg-card shadow-sm">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <Crosshair className="w-5 h-5" />
                                                Coordinate Values
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                                            {points.map((point) => (
                                                <div key={point.id} className="space-y-2 p-3 bg-muted/20 rounded-lg border">
                                                    <Label className="text-sm font-medium flex items-center gap-2">
                                                        <span className={`w-3 h-3 rounded-full ${point.color}`}></span>
                                                        {point.label}
                                                    </Label>
                                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground font-mono">X</span>
                                                            <Input
                                                                type="number"
                                                                name={`zone_point_${point.id}_x`}
                                                                value={point.x ?? ''}
                                                                onChange={(e) => handleInputChange(point.id, 'x', e.target.value)}
                                                                placeholder="-"
                                                                min={0}
                                                                className={`h-8 ${(errors as Record<string, string>)[`zone_point_${point.id}_x`] ? 'border-destructive' : ''}`}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground font-mono">Y</span>
                                                            <Input
                                                                type="number"
                                                                name={`zone_point_${point.id}_y`}
                                                                value={point.y ?? ''}
                                                                onChange={(e) => handleInputChange(point.id, 'y', e.target.value)}
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
                                </div>

                                {/* Right Column: Visual Editor */}
                                <div className="xl:col-span-8 flex flex-col h-full">
                                    <div className="rounded-xl border shadow-sm bg-card overflow-hidden flex flex-col h-full">
                                        <div className="p-4 border-b bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        Visual Zone Mapper
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Click on the image to place the points sequentially and form the monitoring zone.
                                                    </p>
                                                </div>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleResetPoints}
                                                    className="shrink-0"
                                                >
                                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                                    Reset Points
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-grow bg-muted/10 relative">
                                            {device?.last_image_url ? (
                                                <ImagePointEditor 
                                                    imageUrl={device.last_image_url} 
                                                    points={points} 
                                                    onChange={handlePointChange} 
                                                    onReset={handleResetPoints}
                                                />
                                            ) : (
                                                <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-background">
                                                    <div className="text-center space-y-2 px-4 max-w-sm">
                                                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                            <Crosshair className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                        <h4 className="font-medium">No Image Available</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            The visual editor will appear here once the device uploads its first camera capture. You can input coordinates manually on the left in the meantime.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t pt-6 mt-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full sm:w-auto px-8"
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    {isEditing ? 'Save Device Configuration' : 'Create Device'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    )
}
export default FormTemplate