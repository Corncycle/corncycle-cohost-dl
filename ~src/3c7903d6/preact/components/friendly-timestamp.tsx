import { fromDateTime } from "@/client/lib/beats";
import { DateTime } from "luxon";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useDisplayPrefs } from "../hooks/use-display-prefs";

export type FriendlyTimestampProps = {
    dateISO: string;
    link?: string;
} & React.HTMLAttributes<HTMLTimeElement>;

function beatsFormat(dateTime: DateTime): string {
    return `${dateTime
        .setZone("UTC+1")
        .toLocaleString(DateTime.DATE_MED)} ${fromDateTime(dateTime, true)}`;
}

/**
 * Displays a relative timestamp, updated per second until 1 minute has passed,
 * then updates per minute.
 *
 * @component
 * @example
 * const dateISO = "2006-10-20T04:20:00-0500";
 * const link = "https://example.com";
 * <FriendlyTimestamp dateISO={dateISO} link={link} />
 */
export const FriendlyTimestamp: FunctionComponent<FriendlyTimestampProps> = ({
    dateISO,
    link,
    ...props
}) => {
    const displayPrefs = useDisplayPrefs();
    const [luxonDT, setLuxonDT] = useState(DateTime.fromISO(dateISO).toUTC());
    const [timestampText, setTimestampText] = useState(() =>
        displayPrefs.beatsTimestamps
            ? beatsFormat(luxonDT)
            : luxonDT.toLocaleString(DateTime.DATETIME_SHORT)
    );
    const timerRef = useRef<NodeJS.Timeout | null>();

    // schedule the timestamp render updates
    useEffect(() => {
        function updateTimestamp() {
            setTimestampText(
                displayPrefs.beatsTimestamps
                    ? beatsFormat(luxonDT)
                    : luxonDT.toRelative({ style: "narrow" }) ?? ""
            );
            const timeSince = Date.now() - luxonDT.toMillis();
            let timeout = 60 * 1000; // 1 minute

            // update every second if we're still under a minute
            if (timeSince < 60 * 1000) {
                timeout = 1000;
            }

            timerRef.current = setTimeout(updateTimestamp, timeout);
        }
        updateTimestamp();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [displayPrefs.beatsTimestamps, luxonDT]);

    // verify we're displaying local time on the client
    useEffect(() => {
        setLuxonDT((current) => current.toLocal());
    }, []);

    // if our props change, update the timestamp
    useEffect(() => {
        setLuxonDT(DateTime.fromISO(dateISO));
    }, [dateISO]);

    return (
        <time
            dateTime={luxonDT.toISO()}
            className={
                props.className ??
                "block flex-none text-xs tabular-nums text-gray-500"
            }
            title={luxonDT.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}
            {...props}
        >
            {link ? (
                <a href={link.toString()} className="hover:underline">
                    {timestampText}
                </a>
            ) : (
                timestampText
            )}
        </time>
    );
};
