import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ChildDevice, Device } from '@/types';
import { Form } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, MapPinned, RefreshCcw } from 'lucide-react';
import ImagePointEditor, { PointDef } from '@/components/custom-ui/imagePointEditor';

type FormTemplateProps = {
    childDevice?: ChildDevice;
    device: Device;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({ childDevice, device, url, method }: FormTemplateProps) => {
    const isEditing = !!childDevice;

    const [points, setPoints] = useState<PointDef[]>([
        { 
            id: 'pos', 
            label: 'Sensor Position', 
            x: childDevice?.position_x ?? null, 
            y: childDevice?.position_y ?? null,
            color: 'bg-indigo-500' 
        }
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
                        <CardTitle className="text-2xl">{isEditing ? 'Edit Child Device' : 'Create Child Device'}</CardTitle>
                        <CardDescription className="mt-1">
                            {isEditing
                                ? 'Update the child sensor configuration and position below.'
                                : 'Configure a new child sensor and map its position on the parent device image.'}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-full border shadow-sm shrink-0 w-full md:w-auto justify-center md:justify-start">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Parent:</span>
                        <span className="text-sm font-semibold">{device.title}</span>
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
                            {!isEditing &&
                                <input type='hidden' name='device_id' value={device.id} />
                            }
                            
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                {/* Left Column: Basic Details & Manual Inputs */}
                                <div className="xl:col-span-4 space-y-6">
                                    <div className="space-y-4 rounded-xl border p-5 bg-card shadow-sm">
                                        <h3 className="font-semibold text-lg border-b pb-2">Sensor Information</h3>
                                        
                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <p className="text-sm text-muted-foreground">
                                                {isEditing
                                                    ? 'This child device keeps its existing hardware hash and syncs with the parent gateway.'
                                                    : 'A unique hardware hash will be automatically generated for this child device after creation.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Manual Coordinates Input */}
                                    <div className="space-y-4 rounded-xl border p-5 bg-card shadow-sm">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <MapPinned className="w-5 h-5" />
                                                Sensor Coordinates
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2 p-3 bg-muted/20 rounded-lg border">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-full ${points[0].color || 'bg-primary'}`}></span>
                                                    {points[0].label}
                                                </Label>
                                                <div className="grid grid-cols-2 gap-3 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground font-mono">X</span>
                                                        <Input
                                                            id="position_x"
                                                            type="number"
                                                            name="position_x"
                                                            value={points[0].x ?? ''}
                                                            onChange={(e) => handleInputChange('pos', 'x', e.target.value)}
                                                            placeholder="-"
                                                            min={0}
                                                            className={`h-8 ${(errors as Record<string, string>).position_x ? 'border-destructive' : ''}`}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground font-mono">Y</span>
                                                        <Input
                                                            id="position_y"
                                                            type="number"
                                                            name="position_y"
                                                            value={points[0].y ?? ''}
                                                            onChange={(e) => handleInputChange('pos', 'y', e.target.value)}
                                                            placeholder="-"
                                                            min={0}
                                                            className={`h-8 ${(errors as Record<string, string>).position_y ? 'border-destructive' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                                <InputError message={(errors as Record<string, string>).position_x} className="mt-1" />
                                                <InputError message={(errors as Record<string, string>).position_y} className="mt-1" />
                                            </div>
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
                                                        Visual Position Mapper
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Click on the image to drop the sensor pin. This helps visualize where the child sensor is physically located.
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
                                                    Reset Pin
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-grow bg-muted/10 relative">
                                            {device.last_image_url ? (
                                                <ImagePointEditor 
                                                    imageUrl={device.last_image_url} 
                                                    points={points} 
                                                    onChange={handlePointChange} 
                                                />
                                            ) : (
                                                <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-background">
                                                    <div className="text-center space-y-2 px-4 max-w-sm">
                                                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                            <MapPinned className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                        <h4 className="font-medium">No Parent Image Available</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            The visual editor will appear here once the parent device uploads its first camera capture.
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
                                    {isEditing ? 'Save Sensor Configuration' : 'Create Sensor'}
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
