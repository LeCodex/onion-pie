import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function RollingValueComponent({
    value,
    speed=10,
    prefix="",
    suffix="",
    ...rest
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        var interval = setInterval(() => {
            setDisplayValue((oldValue) => {
                var diff = Math.max(-speed, Math.min(value - oldValue, speed));
                // setColor(diff === 0 ? "text.secondary" : diff > 0 ? "yellow" : "red");
                return oldValue + diff;
            });
        }, 10);

        return () => {
            clearInterval(interval);
        }
    }, [value, speed]);

    return (
        <Typography /* sx={{ color: color }} */ {...rest}>{prefix}{displayValue}{suffix}</Typography>
    );
}