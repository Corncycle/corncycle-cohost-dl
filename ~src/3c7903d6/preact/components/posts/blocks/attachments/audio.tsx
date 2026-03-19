import { useAudioPlayback } from "@/client/preact/hooks/use-audio-playback";
import { AttachmentViewBlock } from "@/shared/types/post-blocks";
import { CloudArrowDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useMemo, useRef, useState } from "react";
import { AudioPlayPauseButton } from "@/client/preact/components/elements/audio-play-pause";
import { AudioSeekBar } from "@/client/preact/components/elements/audio-seek-bar";
import { BlockComponent } from "../attachment";

export const AudioAttachment: BlockComponent<AttachmentViewBlock> = ({
    block,
}) => {
    const audio = useRef<HTMLAudioElement>(null);

    const displayTitle = useMemo(() => {
        const pathEntries = new URL(block.attachment.fileURL).pathname.split(
            "/"
        );
        let displayTitle = pathEntries[pathEntries.length - 1];

        if (block.attachment.kind === "audio") {
            if (block.attachment.title) displayTitle = block.attachment.title;
        }

        return displayTitle;
    }, [block.attachment]);

    const displayArtist = useMemo(() => {
        let displayArtist = "(unknown artist)";

        if (block.attachment.kind === "audio") {
            if (block.attachment.artist)
                displayArtist = block.attachment.artist;
        }

        return displayArtist;
    }, [block.attachment]);

    const [displayPlaybackError, setDisplayPlaybackError] = useState(false);
    const { togglePlayback, currentTime, isPlaying, totalDuration, seek } =
        useAudioPlayback(audio, () => setDisplayPlaybackError(true));

    return (
        <figure className="group relative w-full flex-initial">
            <figcaption className="sr-only">
                {displayArtist} - {displayTitle}
            </figcaption>
            <audio
                src={block.attachment.fileURL}
                preload="metadata"
                className="w-full p-2"
                ref={audio}
                data-testid="audio"
            >
                <a href={block.attachment.fileURL}>download audio</a>
            </audio>

            <div className="flex flex-row">
                <AudioPlayPauseButton
                    mode={isPlaying ? "playing" : "paused"}
                    className="flex-shrink-0 flex-grow"
                    togglePlayback={togglePlayback}
                />

                <div className="flex w-full flex-col bg-notBlack p-2">
                    {displayPlaybackError ? (
                        <>
                            <div className="flex flex-row">
                                <div className="flex-1">
                                    Your web browser isn't able to play this
                                    file.
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDisplayPlaybackError(false)
                                    }
                                    className="flex flex-row text-xs text-mango"
                                >
                                    dismiss error
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="text-xs">
                                You might be able to{" "}
                                <a
                                    href={block.attachment.fileURL}
                                    download
                                    className="text-mango"
                                >
                                    download
                                </a>{" "}
                                it and play it in a dedicated audio player.
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-row">
                                <div className="flex-1">{displayTitle}</div>
                                <a
                                    href={block.attachment.fileURL}
                                    download
                                    title="download"
                                >
                                    <CloudArrowDownIcon className="h-6 w-6" />
                                </a>
                            </div>
                            <div className="text-xs">{displayArtist}</div>

                            <AudioSeekBar
                                currentTime={currentTime}
                                totalDuration={totalDuration}
                                seek={seek}
                            />
                        </>
                    )}
                </div>
            </div>
        </figure>
    );
};
