import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    imageUrl: string | null;
}

export default function ImageDialog({
    open,
    onOpenChange,
    title,
    imageUrl,
}: ImageDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[90vw] sm:max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex justify-center">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-auto max-h-[85vh] w-auto object-contain"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
