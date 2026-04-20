import { Badge } from "../ui/badge";

const AvailableSpotsBadge = ({ availableSpots, totalSpots }: { availableSpots: number, totalSpots: number }) => {
    const occupancyRate = totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;
    
    return (
        <Badge
            className={
                availableSpots === 0
                    ? "border-rose-800 bg-rose-950 text-rose-200 hover:bg-rose-900"
                    : occupancyRate < 50
                        ? "border-emerald-800 bg-emerald-950 text-emerald-200 hover:bg-emerald-900"
                        : "border-amber-800 bg-amber-950 text-amber-200 hover:bg-amber-900"
            }
        >
            {availableSpots}
        </Badge>
    )
}
export default AvailableSpotsBadge;