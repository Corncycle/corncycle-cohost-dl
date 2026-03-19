import { Attachment } from "./post-editor-machine";
import {
    makeSourceURL,
    selectAttachments,
    selectIsCreatingPost,
    selectIsEditing,
    selectIsFinishingAttachments,
    selectIsStartingAttachments,
} from "./post-editor-machine.helpers";
import { AttachmentState } from "@/shared/types/attachments";
import { useSelector } from "@xstate/react";
import classNames from "classnames";
import {
    default as React,
    FunctionComponent,
    Ref,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAudioPlayback } from "../../../hooks/use-audio-playback";
import {
    AttachmentLayoutV1,
    AttachmentLayoutV2,
    AttachmentLayoutChildComponent,
} from "@/client/preact/components/attachment-layout";
import { AttachmentDeleteButton } from "@/client/preact/components/elements/attachment-delete-button";
import { AudioPlayPauseButton } from "@/client/preact/components/elements/audio-play-pause";
import { AudioSeekBar } from "@/client/preact/components/elements/audio-seek-bar";
import { BasicButton } from "@/client/preact/components/elements/basic-button";
import { AttachmentComposerContext } from "./attachment-composer-context";
import { PostComposerContext } from "./post-composer-context";
import { chooseAgeRuleset } from "@/client/lib/markdown/sanitize";

export const AudioAttachmentPreview: FunctionComponent<{
    attachment: Attachment;
    canRemove: boolean;
    index?: number;
}> = ({ attachment, canRemove, index }) => {
    if (attachment.kind !== "audio") {
        throw "attempting to render a non-audio attachment as audio?";
    }

    const service = useContext(PostComposerContext);
    const send = service.send;
    const isEditing = useSelector(service, selectIsEditing);
    const isCreatingPost = useSelector(service, selectIsCreatingPost);
    const isStartingAttachments = useSelector(
        service,
        selectIsStartingAttachments
    );
    const isFinishingAttachments = useSelector(
        service,
        selectIsFinishingAttachments
    );

    const audio = useRef<HTMLAudioElement>(null);

    const title = useRef<HTMLInputElement>(null);
    const artist = useRef<HTMLInputElement>(null);

    const { togglePlayback, currentTime, isPlaying, totalDuration, seek } =
        useAudioPlayback(audio);

    const sourceURL = useMemo(() => makeSourceURL(attachment), [attachment]);

    const inputStyleClasses = `
        w-full rounded-lg border-2 bg-transparent 
        read-only:bg-gray-700 border-gray-400 text-notWhite 
        placeholder:text-gray-400 focus:border-notWhite
    `;

    const onRemove = useCallback(() => {
        if (canRemove && index !== undefined) {
            send({ type: "REMOVE_ATTACHMENT", index });
        }
    }, [canRemove, index, send]);

    const onMetadataChange = useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >(
        (e) => {
            if (
                canRemove &&
                index !== undefined &&
                title.current &&
                artist.current
            ) {
                send({
                    type: "AUDIO_METADATA_INPUT",
                    index,
                    title: title.current.value,
                    artist: artist.current.value,
                });
            }
        },
        [canRemove, index, send]
    );

    const displayTitle = useMemo(() => {
        if (attachment.metadata.title && attachment.metadata.title.length > 0) {
            return attachment.metadata.title;
        } else return "(no title specified)";
    }, [attachment]);

    const displayArtist = useMemo(() => {
        if (
            attachment.metadata.artist &&
            attachment.metadata.artist.length > 0
        ) {
            return attachment.metadata.artist;
        } else return "(no artist specified)";
    }, [attachment]);

    const playPauseMode = useMemo(() => {
        if (isEditing) {
            return isPlaying ? "playing" : "paused";
        } else {
            if (attachment.state === AttachmentState.Finished) {
                return "uploading:finished";
            }

            if (isStartingAttachments || isCreatingPost) {
                return "uploading:starting";
            } else if (isFinishingAttachments) {
                return "uploading:finishing";
            } else {
                return "uploading:pending";
            }
        }
    }, [
        attachment.state,
        isCreatingPost,
        isFinishingAttachments,
        isStartingAttachments,
        isEditing,
        isPlaying,
    ]);

    return (
        <figure className="group relative w-full flex-initial">
            <audio
                src={sourceURL}
                preload="metadata"
                className="w-full p-2"
                ref={audio}
            />

            <div className="flex flex-row">
                <AudioPlayPauseButton
                    mode={playPauseMode}
                    className="flex-shrink-0 flex-grow"
                    togglePlayback={togglePlayback}
                />

                <div className="flex w-full flex-col bg-notBlack p-2">
                    {canRemove ? (
                        <>
                            <AttachmentDeleteButton onDelete={onRemove} />
                            <input
                                className={classNames(
                                    inputStyleClasses,
                                    "mb-1"
                                )}
                                type="text"
                                placeholder="add title information"
                                defaultValue={attachment.metadata.title}
                                ref={title}
                                onChange={onMetadataChange}
                                disabled={!isEditing}
                            />
                            <input
                                className={inputStyleClasses}
                                type="text"
                                name="artist"
                                placeholder="add artist information"
                                defaultValue={attachment.metadata.artist}
                                ref={artist}
                                onChange={onMetadataChange}
                                disabled={!isEditing}
                            />
                        </>
                    ) : (
                        <>
                            <div>{displayTitle}</div>
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
AudioAttachmentPreview.displayName = "AudioAttachmentPreview";

export const ImageAttachmentPreview: FunctionComponent<{
    attachment: Attachment;
    canRemove: boolean;
    index: number;
    aspectRatio?: number;
}> = React.memo(({ attachment, canRemove, index, aspectRatio }) => {
    if (attachment.kind !== "image") {
        throw "attempting to render a non-image attachment as an image?";
    }

    const { t } = useTranslation();
    const service = useContext(PostComposerContext);
    const attachmentComposerRef = useContext(AttachmentComposerContext);
    const send = service.send;
    const isEditing = useSelector(service, selectIsEditing);
    const isCreatingPost = useSelector(service, selectIsCreatingPost);
    const isStartingAttachments = useSelector(
        service,
        selectIsStartingAttachments
    );
    const isFinishingAttachments = useSelector(
        service,
        selectIsFinishingAttachments
    );

    const onRemove = useCallback(() => {
        if (canRemove && index !== undefined) {
            send({ type: "REMOVE_ATTACHMENT", index });
        }
    }, [canRemove, index, send]);

    const displayString = useMemo(() => {
        if (attachment.state === AttachmentState.Finished) {
            return t(
                "client:post-editor.attachment-state.finished",
                "uploaded!"
            );
        }

        if (isStartingAttachments || isCreatingPost) {
            return t(
                "client:post-editor.attachment-state.starting",
                "starting..."
            );
        } else if (isFinishingAttachments) {
            return t(
                "client:post-editor.attachment-state.finishing",
                "finishing up..."
            );
        } else {
            return t(
                "client:post-editor.attachment-state.pending",
                "uploading..."
            );
        }
    }, [
        attachment.state,
        isCreatingPost,
        isFinishingAttachments,
        isStartingAttachments,
        t,
    ]);

    const sourceURL = useMemo(() => makeSourceURL(attachment), [attachment]);
    const altTextButtonLabel = useMemo(
        () =>
            (attachment.metadata.altText ?? "").length > 0
                ? "edit description"
                : "add description",
        [attachment]
    );

    return (
        <div className="group relative w-full flex-initial">
            <img
                src={sourceURL}
                className="h-full w-full object-cover"
                style={{
                    aspectRatio: aspectRatio ? `${aspectRatio} / 1` : undefined,
                }}
                alt={attachment.metadata.altText}
            />
            {canRemove ? (
                <>
                    <AttachmentDeleteButton onDelete={onRemove} />
                    <BasicButton
                        buttonSize="small"
                        buttonColor="cherry"
                        extraClasses="absolute bottom-3 left-3"
                        disabled={!isEditing || !attachmentComposerRef?.current}
                        onClick={() =>
                            attachmentComposerRef?.current?.open(index)
                        }
                    >
                        {altTextButtonLabel}
                    </BasicButton>
                </>
            ) : null}
            <div
                className={`absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-80 text-notWhite ${
                    !isEditing ? "block" : "hidden"
                }`}
            >
                {displayString}
            </div>
        </div>
    );
});
ImageAttachmentPreview.displayName = "ImageAttachmentPreview";

type PreviewsFromAttachmentsProps = {
    canRemove: boolean;
};

const magicPreviewAttachment = (canRemove: boolean) => {
    const component: AttachmentLayoutChildComponent<Attachment> = ({
        attachment,
        index,
        rowLength,
        aspectRatio,
    }) => {
        switch (attachment.kind) {
            case "image":
                return (
                    <ImageAttachmentPreview
                        canRemove={canRemove}
                        index={index}
                        attachment={attachment}
                        key={attachment.attachmentId ?? index}
                        aspectRatio={aspectRatio}
                    />
                );
            case "audio":
                return (
                    <AudioAttachmentPreview
                        canRemove={canRemove}
                        index={index}
                        attachment={attachment}
                        key={attachment.attachmentId ?? index}
                    />
                );
        }
    };

    component.displayName = "MagicPreviewAttachment";
    return component;
};

function attachmentKind(attachment: Attachment) {
    return attachment.kind;
}

function attachmentDimensions(attachment: Attachment) {
    if (attachment.kind === "image") {
        return {
            width: attachment.metadata.width,
            height: attachment.metadata.height,
        };
    } else return undefined;
}

export const PreviewsFromAttachments: FunctionComponent<PreviewsFromAttachmentsProps> =
    React.memo(({ canRemove }) => {
        const service = useContext(PostComposerContext);
        const attachments = useSelector(service, selectAttachments);
        const ruleset = chooseAgeRuleset(new Date());

        if (ruleset.attachmentLayoutBehavior === "v2") {
            return (
                <AttachmentLayoutV2
                    attachments={attachments}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={magicPreviewAttachment(canRemove)}
                />
            );
        } else {
            return (
                <AttachmentLayoutV1
                    attachments={attachments}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={magicPreviewAttachment(canRemove)}
                />
            );
        }
    });
PreviewsFromAttachments.displayName = "PreviewsFromAttachments";
