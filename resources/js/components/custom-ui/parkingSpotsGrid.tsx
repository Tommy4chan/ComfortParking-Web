interface ParkingSpotsGridProps {
    totalSpots: number;
    usedSpots: number;
    availableSpots: number;
}

const ParkingSpotsGrid = ({
    totalSpots,
    usedSpots,
    availableSpots,
}: ParkingSpotsGridProps) => {
    const occupancyRate =
        totalSpots > 0 ? Math.round((usedSpots / totalSpots) * 100) : 0;

    const getTextColor = () => {
        if (availableSpots === 0) return 'text-rose-500';
        if (occupancyRate < 50) return 'text-emerald-500';
        return 'text-amber-500';
    };

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                    Total Spots
                </p>
                <p className="text-2xl font-bold">{totalSpots}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                    Used Spots
                </p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                    {usedSpots}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                    Available Spots
                </p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                    {availableSpots}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                    Occupancy Rate
                </p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                    {occupancyRate}%
                </p>
            </div>
        </div>
    );
};
export default ParkingSpotsGrid;
