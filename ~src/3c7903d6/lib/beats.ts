import { DateTime } from "luxon";

const BEAT_LENGTH = 86.4;

export function fromDateTime(date: DateTime, centibeats = false): string {
    const bmtDate = date.setZone("UTC+1");
    let beats =
        (bmtDate.second + bmtDate.minute * 60 + bmtDate.hour * 3600) /
        BEAT_LENGTH;

    beats = centibeats ? beats % 1000 : Math.floor(beats % 1000);

    return `@${beats
        .toFixed(centibeats ? 2 : 0)
        .padStart(centibeats ? 6 : 3, "0")}`;
}

export function fromDate(date: Date, centibeats = false): string {
    return fromDateTime(DateTime.fromJSDate(date), centibeats);
}

export function now(centibeats = false): string {
    return fromDateTime(DateTime.now(), centibeats);
}
