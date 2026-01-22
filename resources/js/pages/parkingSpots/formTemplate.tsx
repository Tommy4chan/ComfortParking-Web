import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Device, ParkingSpot } from '@/types';
import { Form } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu } from 'lucide-react';
import { Input } from '@/components/ui/input';

type FormTemplateProps = {
    parkingSpot?: ParkingSpot;
    device: Device;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({ parkingSpot, device, url, method }: FormTemplateProps) => {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{parkingSpot ? 'Edit Parking Spot' : 'Create Parking Spot'}</CardTitle>
                <CardDescription>
                    {parkingSpot
                        ? 'Update the parking spot information below'
                        : 'Fill in the details to create a new parking spot'}
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
                            {!parkingSpot &&
                                <input type='hidden' name='device_id' value={device.id} />
                            }
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="index">
                                        Index <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="index"
                                        type="number"
                                        name="index"
                                        defaultValue={parkingSpot?.index}
                                        required
                                        autoFocus
                                        placeholder="e.g., 69"
                                        className={errors.index ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.index} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="point_1_x">
                                            Point 1 X <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_1_x"
                                            type="number"
                                            step="any"
                                            name="point_1_x"
                                            defaultValue={parkingSpot?.point_1_x}
                                            required
                                            placeholder="e.g., 120"
                                            className={errors.point_1_x ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_1_x} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="point_1_y">
                                            Point 1 Y <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_1_y"
                                            type="number"
                                            step="any"
                                            name="point_1_y"
                                            defaultValue={parkingSpot?.point_1_y}
                                            required
                                            placeholder="e.g., 100"
                                            className={errors.point_1_y ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_1_y} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="point_2_x">
                                            Point 2 X <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_2_x"
                                            type="number"
                                            step="any"
                                            name="point_2_x"
                                            defaultValue={parkingSpot?.point_2_x}
                                            required
                                            placeholder="e.g., 20"
                                            className={errors.point_2_x ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_2_x} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="point_2_y">
                                            Point 2 Y <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_2_y"
                                            type="number"
                                            step="any"
                                            name="point_2_y"
                                            defaultValue={parkingSpot?.point_2_y}
                                            required
                                            placeholder="e.g., 10"
                                            className={errors.point_2_y ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_2_y} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="point_3_x">
                                            Point 3 X <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_3_x"
                                            type="number"
                                            step="any"
                                            name="point_3_x"
                                            defaultValue={parkingSpot?.point_3_x}
                                            required
                                            placeholder="e.g., 20"
                                            className={errors.point_3_x ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_3_x} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="point_3_y">
                                            Point 3 Y <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_3_y"
                                            type="number"
                                            step="any"
                                            name="point_3_y"
                                            defaultValue={parkingSpot?.point_3_y}
                                            required
                                            placeholder="e.g., 10"
                                            className={errors.point_3_y ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_3_y} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="point_4_x">
                                            Point 4 X <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_4_x"
                                            type="number"
                                            step="any"
                                            name="point_4_x"
                                            defaultValue={parkingSpot?.point_4_x}
                                            required
                                            placeholder="e.g., 20"
                                            className={errors.point_4_x ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_4_x} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="point_4_y">
                                            Point 4 Y <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="point_4_y"
                                            type="number"
                                            step="any"
                                            name="point_4_y"
                                            defaultValue={parkingSpot?.point_4_y}
                                            required
                                            placeholder="e.g., 10"
                                            className={errors.point_4_y ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.point_4_y} />
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
                                    {parkingSpot ? 'Update Parking Spot' : 'Create Parking Spot'}
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
