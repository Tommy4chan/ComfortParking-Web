import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Device, ParkingZone } from '@/types';
import { Input } from '@/components/ui/input';
import { Form } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin } from 'lucide-react';

type FormTemplateProps = {
    device?: Device;
    parkingZone: ParkingZone;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({ device, parkingZone, url, method }: FormTemplateProps) => {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{device ? 'Edit Device' : 'Create Device'}</CardTitle>
                <CardDescription>
                    {device 
                        ? 'Update the device information below' 
                        : 'Fill in the details to create a new device'}
                </CardDescription>
                <Alert className="mt-4">
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                        <span className="font-semibold">Parking Zone:</span> {parkingZone.title}
                    </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent>
                <Form
                    action={url}
                    method={method}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="parking_zone_id" value={parkingZone.id} />
                            
                            <div className="space-y-4">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            placeholder="e.g., 40.7128"
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
                                            placeholder="e.g., -74.0060"
                                            className={errors.longitude ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.longitude} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    {device ? 'Update Device' : 'Create Device'}
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