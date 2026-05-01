import { Badge } from '../ui/badge';

interface StatusBadgeProps {
    status: 'online' | 'warning' | 'offline';
    isSmall?: boolean;
}

const StatusBadge = ({ status, isSmall }: StatusBadgeProps) => {
    return (
        <Badge
            variant={
                status === 'online'
                    ? 'default'
                    : status === 'warning'
                      ? 'secondary'
                      : 'destructive'
            }
            className={isSmall ? '' : 'text-base'}
        >
            {status}
        </Badge>
    );
};
export default StatusBadge;
