import { WirePostViewModel } from "@/shared/types/wire-models";
import { DateTime } from "luxon";
import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from "react";

// https://stackoverflow.com/a/47593316
export function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(x: number, min: number, max: number) {
    return Math.min(Math.max(x, min), max);
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * clamp(t, 0, 1);
}

// this will run for 51 hours (midnight EDT on April 1 to 11:59pm PDT on April 2)
const MAX_SECONDS = (48 + 3) * 60 * 60;

const APRIL_1 = DateTime.now().toUTC().set({ month: 4, day: 1 }).startOf("day");

const FRACTION_THRESHOLD = 0.02;
const EXPONENT_THRESHOLD = 0.5;

const MAX_DECIMAL_PLACES = 5;
const MAX_EXPONENT = 1.42;

// Since chaos day features go live at midnight EDT and the clock is tied to
// midnight UTC, we will already have 4 hours (14400 seconds) on the clock,
// which gives us a fixed maximum Number of 14,400, which seems healthy. The
// feature shuts off at 7am UTC on april 3, so the max Number count will be
// around 200k
function secondsFromDate(date: DateTime) {
    return Math.abs(date.diffNow().as("seconds"));
}

function currentOdds() {
    // we don't use the effective date here since we want the negative odds to
    // be consistent through the weekend
    const seconds = secondsFromDate(APRIL_1);
    const odds = lerp(0.05, 0.6, seconds / MAX_SECONDS);
    return odds;
}

export const Numbers: FunctionComponent<{
    post: WirePostViewModel;
}> = ({ post }) => {
    const postId = post.transparentShareOfPostId ?? post.postId;
    const publishDate = useMemo(() => {
        if (post.transparentShareOfPostId) {
            return (
                post.shareTree.find(
                    (vm) => vm.postId === post.transparentShareOfPostId
                )?.publishedAt ?? post.publishedAt
            );
        }

        return post.publishedAt;
    }, [post.publishedAt, post.shareTree, post.transparentShareOfPostId]);

    // use the publish date if it's after april 1 so that numbers don't get as big for posts made
    // while the feature is live.
    const effectiveDate = useMemo(() => {
        if (!publishDate) {
            return APRIL_1;
        }

        const publishDateTime = DateTime.fromISO(publishDate);
        return publishDateTime > APRIL_1 ? publishDateTime : APRIL_1;
    }, [publishDate]);

    const randFunc = useMemo(() => mulberry32(postId), [postId]);
    const [numberRoll, negativeRoll, fractionRoll, exponentRoll] = useMemo<
        [number, number, number, number]
    >(() => {
        return [randFunc(), randFunc(), randFunc(), randFunc()];
    }, [randFunc]);

    const [displaySeconds, setDisplaySeconds] = useState(
        secondsFromDate(effectiveDate)
    );

    const onClick = useCallback(() => {
        setDisplaySeconds(secondsFromDate(effectiveDate));
    }, [effectiveDate]);

    const displayNumber = useMemo(() => {
        let displayNumber = numberRoll * displaySeconds;
        let decimalPlaces = 0;

        // fractional Numbers?
        if (fractionRoll <= FRACTION_THRESHOLD) {
            const normalizedFraction = fractionRoll / FRACTION_THRESHOLD;
            // add 1 to the max since we're flooring; makes the effective max
            // where we want it.
            decimalPlaces = Math.floor(
                lerp(1, MAX_DECIMAL_PLACES + 1, normalizedFraction)
            );
        }

        // exponential Numbers growth?
        if (exponentRoll <= EXPONENT_THRESHOLD) {
            const normalizedExponent = exponentRoll / EXPONENT_THRESHOLD;
            const exponent = lerp(1, MAX_EXPONENT, normalizedExponent);
            displayNumber = Math.pow(displayNumber, exponent);
        }

        if (negativeRoll <= currentOdds()) {
            displayNumber *= -1;
        }

        return displayNumber.toLocaleString(undefined, {
            maximumFractionDigits: decimalPlaces,
        });
    }, [displaySeconds, exponentRoll, fractionRoll, negativeRoll, numberRoll]);

    return (
        <button onClick={onClick} type="button">
            {displayNumber} Numbers&trade;
        </button>
    );
};
