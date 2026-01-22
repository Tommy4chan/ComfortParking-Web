import { Badge } from "../ui/badge";

const AvailableSpotsBadge = ({ availableSpots }: { availableSpots: number }) => {
  return (
    <Badge variant={availableSpots > 0 ? "default" : "destructive"}>
        {availableSpots}
    </Badge>
  )
}
export default AvailableSpotsBadge;