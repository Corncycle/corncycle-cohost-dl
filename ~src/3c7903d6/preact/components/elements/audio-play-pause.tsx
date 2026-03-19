import {
    PauseCircleIcon,
    PlayCircleIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { t } from "i18next";
import React, { FunctionComponent, HTMLAttributes } from "react";
import { LoadingIcon } from "../loading";
import classNames from "classnames";

type AudioPlayPauseProps = {
    mode:
        | "paused"
        | "playing"
        | "uploading:starting"
        | "uploading:finishing"
        | "uploading:pending"
        | "uploading:finished";
    togglePlayback: () => void;
} & Pick<HTMLAttributes<HTMLButtonElement>, "className">;

export const AudioPlayPauseButton: FunctionComponent<AudioPlayPauseProps> = ({
    mode,
    togglePlayback,
    className,
}) => {
    let content: React.ReactElement | null = null;
    let title: string | undefined = undefined;

    switch (mode) {
        case "playing":
            content = <PauseCircleIcon className="m-auto h-9 w-9" />;
            title = "pause";
            break;
        case "paused":
            content = <PlayCircleIcon className="m-auto h-9 w-9" />;
            title = "play";
            break;
        case "uploading:starting":
        case "uploading:pending":
        case "uploading:finishing":
        case "uploading:finished": {
            const submode = mode.split(":")[1];

            content = (
                <>
                    <LoadingIcon />
                    <div className="text-xs">
                        {t(`client:post-editor.attachment-state.${submode}`)}
                    </div>
                </>
            );
            break;
        }
    }

    return (
        <button
            type="button"
            className={classNames("w-[76px] bg-cherry", className)}
            onClick={togglePlayback}
            title={title}
        >
            {content}
        </button>
    );
};
