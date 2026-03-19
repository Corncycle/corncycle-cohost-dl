import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from "react";
import { now } from "@/client/lib/beats";

export const BeatClock: FunctionComponent<{ className?: string }> = React.memo(
    ({ className }) => {
        const [displayTime, setDisplayTime] = useState(now());

        const updateClock = useCallback(() => {
            const newTime = now();
            if (newTime !== displayTime) {
                setDisplayTime(newTime);
            }
        }, [displayTime]);

        useEffect(() => {
            const intervalId = setInterval(updateClock, 1000);
            return () => clearInterval(intervalId);
        }, [updateClock]);

        return (
            <a
                href="https://internet-ti.me/"
                className={`tabular-nums ${className ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {displayTime}
            </a>
        );
    }
);

BeatClock.displayName = "BeatClock";
