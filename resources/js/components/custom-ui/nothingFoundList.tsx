import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { buttonVariants } from '../ui/button';

interface NothingFoundListProps {
    createUrl?: string;
    title: string;
    description: string;
    createText?: string;
}

const NothingFoundList = ({
    createUrl,
    title,
    description,
    createText,
}: NothingFoundListProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-2 text-lg font-medium text-muted-foreground">
                {title}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
            {createUrl && (
                <Link
                    href={createUrl}
                    className={buttonVariants({ variant: 'default' })}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {createText}
                </Link>
            )}
        </div>
    );
};

export default NothingFoundList;
