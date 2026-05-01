import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    getFormattedDate,
    getFormattedDateWithTimezone,
    getRelativeTime,
} from '@/lib/utils';

interface FormattedDateProps {
    date: string | null | undefined;
    format?: 'default' | 'relative' | 'with-timezone';
    showTooltip?: boolean;
    className?: string;
    options?: Intl.DateTimeFormatOptions;
}

/**
 * Component to display formatted dates in user's local timezone
 * @param date - ISO 8601 date string from API (UTC)
 * @param format - 'default' (Nov 20, 2025, 3:30 PM), 'relative' (2 hours ago), 'with-timezone' (includes TZ)
 * @param showTooltip - Show full date on hover when using relative format
 * @param className - Additional CSS classes
 * @param options - Custom Intl.DateTimeFormatOptions
 */
export default function FormattedDate({
    date,
    format = 'default',
    showTooltip = true,
    className = '',
    options,
}: FormattedDateProps) {
    if (!date) return <span className={className}>N/A</span>;

    const getFormattedValue = () => {
        switch (format) {
            case 'relative':
                return getRelativeTime(date);
            case 'with-timezone':
                return getFormattedDateWithTimezone(date);
            default:
                return getFormattedDate(date, options);
        }
    };

    const formattedValue = getFormattedValue();

    // Show tooltip with full date when using relative time
    if (format === 'relative' && showTooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className={className}>{formattedValue}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{getFormattedDateWithTimezone(date)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <span className={className}>{formattedValue}</span>;
}
