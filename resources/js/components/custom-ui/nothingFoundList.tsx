import { Link } from "@inertiajs/react"
import { buttonVariants } from "../ui/button";
import { Plus } from "lucide-react";

interface NothingFoundListProps {
    createUrl?: string;
    title: string;
    description: string;
    createText?: string;
}

const NothingFoundList = ({ createUrl, title, description, createText }: NothingFoundListProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
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
    )
}

export default NothingFoundList