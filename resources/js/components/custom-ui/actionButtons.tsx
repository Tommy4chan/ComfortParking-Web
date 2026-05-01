import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActionButtonsProps {
    createUrl?: string;
    createText?: string;
    showUrl?: string;
    editUrl?: string;
    destroyUrl?: string;
    title?: string;
    isBigButtons?: boolean;
}

const ActionButtons = ({
    createUrl,
    createText,
    showUrl,
    editUrl,
    destroyUrl,
    title,
    isBigButtons = false,
}: ActionButtonsProps) => {
    const deleteObj = () => {
        if (!destroyUrl) return;

        router.delete(destroyUrl, {
            onSuccess: () => {
                toast.success(`${title} deleted successfully`);
            },
            onError: () => {
                toast.error('Failed to delete parking zone');
            },
        });
    };

    return (
        <div
            className="flex justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
        >
            {createUrl && (
                <Link
                    href={createUrl}
                    className={
                        isBigButtons
                            ? buttonVariants({ variant: 'default' })
                            : buttonVariants({ variant: 'ghost', size: 'sm' })
                    }
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {isBigButtons && createText}
                </Link>
            )}
            {showUrl && (
                <Link
                    href={showUrl}
                    className={
                        isBigButtons
                            ? buttonVariants({ variant: 'default' })
                            : buttonVariants({ variant: 'ghost', size: 'sm' })
                    }
                >
                    <Eye className="h-4 w-4" />
                    {isBigButtons && 'View'}
                </Link>
            )}
            {editUrl && (
                <Link
                    href={editUrl}
                    className={
                        isBigButtons
                            ? buttonVariants({ variant: 'default' })
                            : buttonVariants({ variant: 'ghost', size: 'sm' })
                    }
                >
                    <Pencil className="h-4 w-4" />
                    {isBigButtons && 'Edit'}
                </Link>
            )}
            {destroyUrl && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant={isBigButtons ? 'destructive' : 'ghost'}
                            size={isBigButtons ? 'default' : 'sm'}
                            className="cursor-pointer"
                        >
                            <Trash2
                                className={`h-4 w-4 ${!isBigButtons ? 'text-destructive' : ''}`}
                            />
                            {isBigButtons && 'Delete'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the "{title}" and all
                                associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={deleteObj}
                                className="cursor-pointer"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};

export default ActionButtons;
