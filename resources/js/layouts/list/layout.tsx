import ActionButtons from '@/components/custom-ui/actionButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PropsWithChildren } from 'react';

interface ListLayoutProps {
    createUrl?: string;
    createText?: string;
    title?: string;
    description?: string;
    isChild?: boolean;
}

export default function ListLayout({ children, createUrl, createText, title, description, isChild = false }: PropsWithChildren<ListLayoutProps>) {

    return (
        <div className={isChild ? "" : "container mx-auto p-6"}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{title}</CardTitle>
                            <CardDescription className="mt-2">
                                {description}
                            </CardDescription>
                        </div>
                        <ActionButtons
                            createUrl={createUrl}
                            createText={createText}
                            isBigButtons
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
