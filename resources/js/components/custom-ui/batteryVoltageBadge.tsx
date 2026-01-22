import { Badge } from "../ui/badge";

interface BatteryVoltageBadgeProps {
    batteryVoltage: number;
    isSmall?: boolean;
}

const BatteryVoltageBadge = ({ batteryVoltage, isSmall } : BatteryVoltageBadgeProps) => {
    return (
        <Badge
            variant={batteryVoltage > 3000 ? "default" : batteryVoltage > 2800 ? "secondary" : "destructive"}
            className={isSmall ? "" : "text-base" }
        >
            {batteryVoltage} mV
        </Badge>
    )
}
export default BatteryVoltageBadge;