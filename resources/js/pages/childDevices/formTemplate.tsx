import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ChildDevice, Device, ParkingSpot } from '@/types';
import { Form } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormTemplateProps = {
    childDevice?: ChildDevice;
    device: Device;
    parkingSpots?: ParkingSpot[];
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({ childDevice, device, parkingSpots, url, method }: FormTemplateProps) => {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{childDevice ? 'Edit Child Device' : 'Create Child Device'}</CardTitle>
                <CardDescription>
                    {childDevice
                        ? 'Update the child device information below'
                        : 'Fill in the details to create a new child device sensor'}
                </CardDescription>
                <Alert className="mt-4">
                    <Cpu className="h-4 w-4" />
                    <AlertDescription>
                        <span className="font-semibold">Parent Device:</span> {device.title}
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
                            {!childDevice &&
                                <input type='hidden' name='device_id' value={device.id} />
                            }
                            <div className="space-y-4">
                                {parkingSpots && parkingSpots.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="parking_spot_id">
                                            Parking Spot (Optional)
                                        </Label>
                                        <Select name="parking_spot_id" defaultValue={childDevice?.parking_spot_id?.toString() || ''}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select a parking spot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={'none'}>None</SelectItem>
                                                {parkingSpots.map((parkingSpot) => (
                                                    <SelectItem key={parkingSpot.id} value={parkingSpot.id.toString()}>
                                                        Parking Spot #{parkingSpot.index}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.parking_spot_id} />
                                    </div>
                                )}

                                <div className="rounded-lg border bg-card p-4">
                                    <p className="text-sm text-muted-foreground">
                                        {childDevice
                                            ? 'The child device will keep its existing hash and configuration.'
                                            : 'A unique hash will be automatically generated for this child device after creation.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    {childDevice ? 'Update Child Device' : 'Create Child Device'}
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
