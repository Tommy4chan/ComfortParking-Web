import { Badge } from "../ui/badge"

const SpotStatusBadge = ({isUsed} : {isUsed: boolean}) => {
    return (
        <Badge variant={isUsed ? "destructive" : "default"}>
            {isUsed ? 'Occupied' : 'Available'}
        </Badge>
    )
}
export default SpotStatusBadge