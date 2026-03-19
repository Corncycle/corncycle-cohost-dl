import { fromDateTime } from "@/client/lib/beats";
import { DateTime } from "luxon";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useDisplayPrefs } from "../hooks/use-display-prefs";

function beatsFormat(dateTime: DateTime): string {
    return `${dateTime
        .setZone("UTC+1")
        .toLocaleString(DateTime.DATE_MED)} ${fromDateTime(dateTime, true)}`;
}

export interface UnfriendlyTimestampProps {
    dateISO: string;
    link?: URL;
    className?: string;
}

export const UnfriendlyTimestamp: FunctionComponent<
    UnfriendlyTimestampProps
> = ({
    dateISO,
    link,
    className = "block flex-none text-sm text-gray-500 dark:text-gray-300",
}) => {
    const displayPrefs = useDisplayPrefs();
    const [luxonDT, setLuxonDT] = useState(DateTime.fromISO(dateISO).toUTC());
    const timestampText = displayPrefs.beatsTimestamps
        ? beatsFormat(luxonDT)
        : luxonDT.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

    useEffect(() => {
        setLuxonDT((current) => current.toLocal());
    }, []);

    return (
        <time dateTime={luxonDT.toISO()} className={className}>
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
