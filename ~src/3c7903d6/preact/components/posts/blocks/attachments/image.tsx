import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";
import { useDisplayPrefs } from "@/client/preact/hooks/use-display-prefs";
import { PlayPauseButton } from "@/client/preact/components/elements/play-pause-button";
import { BlockComponent } from "../attachment";
import { AttachmentViewBlock } from "@/shared/types/post-blocks";
import { useImageOptimizer } from "@/client/preact/hooks/use-image-optimizer";

export const ImageAttachment: BlockComponent<AttachmentViewBlock> = ({
    block,
    onClick,
    maxWidth,
    aspectRatio,
}) => {
    const displayPrefs = useDisplayPrefs();
    const [src, setSrc] = useState(
        displayPrefs.gifsStartPaused
            ? block.attachment.previewURL
            : block.attachment.fileURL
    );
    const [isPlaying, setIsPlaying] = useState(!displayPrefs.gifsStartPaused);

    const handlePause = () => {
        setIsPlaying(false);
        setSrc(block.attachment.previewURL);
    };

    const handlePlay = () => {
        setIsPlaying(true);
        setSrc(block.attachment.fileURL);
    };

    if (!block.attachment.fileURL) {
        console.error(
            `fileURL wasn't provided for attachment with ID ${block.attachment.attachmentId}`
        );
        return null;
    }

    return (
        <button
            onClick={onClick}
            className="group relative w-full flex-initial"
        >
            <ClientAttachment
                block={block}
                maxWidth={maxWidth}
                src={src}
                aspectRatio={aspectRatio}
            />
            {block.attachment.previewURL !== block.attachment.fileURL ? (
                <PlayPauseButton
                    isPlaying={isPlaying}
                    showPlay={
                        block.attachment.previewURL !== block.attachment.fileURL
                    }
                    extraClasses="absolute bottom-3 right-3 w-12"
                    onPlay={handlePlay}
                    onPause={handlePause}
                />
            ) : null}
        </button>
    );
};

const ClientAttachment: FunctionComponent<{
    block: AttachmentViewBlock;
    maxWidth: number;
    src: string;
    aspectRatio?: number;
}> = ({ block, maxWidth, src, aspectRatio }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const srcWithDpr = useImageOptimizer(src, maxWidth, aspectRatio);

    return (
        <img
            ref={imgRef}
            src={srcWithDpr(1)}
            srcSet={`
                ${srcWithDpr(1)} 1x,
                ${srcWithDpr(2)} 2x,
                ${srcWithDpr(3)} 3x,
            `}
            className={`h-full w-full object-cover`}
            data-attachment-id={block.attachment.attachmentId}
            alt={block.attachment.altText ?? undefined}
            title={block.attachment.altText ?? undefined}
            style={{
                aspectRatio: aspectRatio ? `${aspectRatio} / 1` : undefined,
            }}
        />
    );
};
