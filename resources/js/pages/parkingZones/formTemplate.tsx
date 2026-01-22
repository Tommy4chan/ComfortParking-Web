import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ParkingZone } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { Form } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FormTemplateProps = {
    parkingZone?: ParkingZone;
    url: string;
    method: 'post' | 'put' | 'patch';
};

const FormTemplate = ({ parkingZone, url, method }: FormTemplateProps) => {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{parkingZone ? 'Edit Parking Zone' : 'Create Parking Zone'}</CardTitle>
                <CardDescription>
                    {parkingZone 
                        ? 'Update the parking zone information below' 
                        : 'Fill in the details to create a new parking zone'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form
                    action={url}
                    method={method}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        name="title"
                                        defaultValue={parkingZone?.title || ''}
                                        required
                                        autoFocus
                                        placeholder="e.g., Downtown Parking Area"
                                        className={errors.title ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={parkingZone?.description || ''}
                                        placeholder="Provide additional details about this parking zone..."
                                        rows={4}
                                        className={errors.description ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.description} />
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
                                            defaultValue={parkingZone?.latitude || ''}
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
                                            defaultValue={parkingZone?.longitude || ''}
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
                                    {parkingZone ? 'Update' : 'Create'}
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