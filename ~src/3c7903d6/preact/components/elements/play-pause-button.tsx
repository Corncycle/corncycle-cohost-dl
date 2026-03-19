import classNames from "classnames";
import React, { FunctionComponent, MouseEventHandler } from "react";
import { Pause, Play } from "../icons/play-pause";
import { IconEgg } from "../icons/text-egg";

type PlayPauseButtonProps = {
    isPlaying: boolean;
    showPlay: boolean;
    extraClasses: string;
    onPlay: () => void;
    onPause: () => void;
};

export const PlayPauseButton: FunctionComponent<PlayPauseButtonProps> = ({
    isPlaying,
    showPlay,
    extraClasses,
    onPlay,
    onPause,
}) => {
    function wrapStopPropagation(handler: () => void) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handler();
        };
    }

    return (
        <button
            className={classNames(extraClasses, "cursor-pointer")}
            onClick={
                isPlaying
                    ? wrapStopPropagation(onPause)
                    : wrapStopPropagation(onPlay)
            }
            type="button"
        >
            {isPlaying ? (
                <IconEgg
                    scale={0.5}
                    className="hidden fill-notBlack opacity-90 hover:opacity-100 group-hover:block no-hover:block"
                    fillOpacity="0.4"
                >
                    <Pause fillOpacity="1" />
                </IconEgg>
            ) : showPlay ? (
                <IconEgg
                    scale={0.5}
                    className="fill-notBlack opacity-90 hover:opacity-100"
                    fillOpacity="0.4"
                >
                    <Play fillOpacity="1" />
                </IconEgg>
            ) : null}
        </button>
    );
};
