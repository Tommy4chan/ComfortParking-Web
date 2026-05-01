import { Hash } from 'lucide-react';
import { CopyButton } from '../ui/copyButton';

const HashText = ({ hash }: { hash: string }) => {
    return (
        <p className="flex items-center gap-2 font-mono text-sm">
            <Hash className="h-4 w-4" />
            {hash}
            <CopyButton content={hash} size={'sm'} variant={'ghost'} />
        </p>
    );
};
export default HashText;
