import React, { FunctionComponent, useCallback, useState } from "react";
import { Duration } from "luxon";

type AudioSeekBarProps = {
    currentTime: number;
    totalDuration: number;
    seek: (time: number) => void;
};

function formatPlaybackTime(seconds: number): string {
    const duration = Duration.fromMillis(seconds * 1000);

    return duration.toFormat("mm:ss");
}

export const AudioSeekBar: FunctionComponent<AudioSeekBarProps> = ({
    currentTime,
    totalDuration,
    seek,
}) => {
    const [displayTimeRemaining, setDisplayTimeRemaining] = useState(false);

    const onRightTimeClick = useCallback(() => {
        setDisplayTimeRemaining(!displayTimeRemaining);
    }, [displayTimeRemaining]);

    return (
        <div className="flex flex-row items-center">
            <div className="text-xs tabular-nums">
                {formatPlaybackTime(currentTime)}
            </div>
            <input
                type="range"
                className="audio-controls mx-1 flex-1 accent-mango"
                value={currentTime}
                max={totalDuration}
                step="any"
                onChange={(e) => {
                    seek(e.target.valueAsNumber);
                }}
            />
            {
                /* display total duration only after we know the number is valid */
                totalDuration ? (
                    <button
                        className="cursor-pointer text-xs tabular-nums"
                        onClick={onRightTimeClick}
                        type="button"
                    >
                        {formatPlaybackTime(
                            displayTimeRemaining
                                ? totalDuration - currentTime
                                : totalDuration
                        )}
                    </button>
                ) : null
            }
        </div>
    );
};
