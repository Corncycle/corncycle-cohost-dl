import { AttachmentState } from "@/shared/types/attachments";
import {
    Edge,
    attachClosestEdge,
    extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
    draggable,
    dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import classNames from "classnames";
import {
    FunctionComponent,
    default as React,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import invariant from "tiny-invariant";
import { useAudioPlayback } from "../../../hooks/use-audio-playback";
import { AttachmentDeleteButton } from "../../elements/attachment-delete-button";
import { AudioPlayPauseButton } from "../../elements/audio-play-pause";
import { MoveIcon } from "../../icons/move";
import { getEditorNodeDragData, isEditorNodeDragData } from "./data-types";
import { NodeId } from "./document-model";
import { DropIndicator } from "./drop-indicator";
import { makeSourceURL } from "./make-source-url";
import {
    deleteNodeAtIndex,
    moveAttachmentToNewRow,
    selectBody,
    selectIsEditing,
    updateAudioMetadata,
} from "./reducer";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

export const AudioAttachmentEditor: FunctionComponent<{
    nodeId: NodeId;
}> = ({ nodeId }) => {
    const dispatch = useAppDispatch();
    const isEditing = useAppSelector(selectIsEditing);
    const body = useAppSelector(selectBody);
    const node = body.nodes[nodeId];
    const nodePosition = body.nodeOrder.indexOf(nodeId);

    if (node.type !== "audio-attachment") {
        throw new Error(`region ${nodeId} isn't audio attachment?`);
    }

    const sourceURL = makeSourceURL(node.attachment);
    const isSelected = false;

    const audio = useRef<HTMLAudioElement>(null);

    const titleElement = useRef<HTMLInputElement>(null);
    const artistElement = useRef<HTMLInputElement>(null);

    const { togglePlayback, isPlaying } = useAudioPlayback(audio);

    const inputStyleClasses = `
        w-full rounded-lg border-2 bg-transparent 
        read-only:bg-gray-700 border-gray-400 text-notWhite 
        placeholder:text-gray-400 focus:border-notWhite
    `;

    const onMetadataChange = useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >(
        (e) => {
            if (titleElement.current && artistElement.current) {
                dispatch(
                    updateAudioMetadata({
                        nodeId,
                        title: titleElement.current.value,
                        artist: artistElement.current.value,
                    })
                );
            }
        },
        [dispatch, nodeId]
    );

    const playPauseMode = useMemo(() => {
        invariant(
            node.type === "audio-attachment",
            "node is not an audio node"
        );

        if (isEditing) {
            return isPlaying ? "playing" : "paused";
        } else {
            if (node.attachment.state === AttachmentState.Finished) {
                return "uploading:finished";
            }

            if (node.attachment.uploadState === "starting") {
                return "uploading:starting";
            } else if (node.attachment.uploadState === "finishing") {
                return "uploading:finishing";
            } else {
                return "uploading:pending";
            }
        }
    }, [
        node.type,
        node.attachment.state,
        node.attachment.uploadState,
        isEditing,
        isPlaying,
    ]);

    const onDelete = useCallback(() => {
        dispatch(deleteNodeAtIndex(nodeId));
    }, [nodeId, dispatch]);

    const topLevelClasses = classNames("group relative w-full flex-initial", {
        "co-selected-block ring-2": isSelected,
    });

    const dragHandleRef = useRef<HTMLDivElement>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [dragState, setDragState] = useState<"none" | "dragging">("none");

    useEffect(() => {
        const element = containerRef.current;
        invariant(element);

        return combine(
            draggable({
                element,
                getInitialData: () =>
                    getEditorNodeDragData({
                        nodeId,
                        nodeType: "audio-attachment",
                    }),
                onDragStart() {
                    setDragState("dragging");
                },
                onDrop() {
                    setDragState("none");
                },
                dragHandle: dragHandleRef.current ?? undefined,
            }),
            dropTargetForElements({
                element,
                getIsSticky: () => true,
                getData({ input }) {
                    invariant(containerRef.current);
                    return attachClosestEdge(
                        getEditorNodeDragData({
                            nodeId,
                            nodeType: "audio-attachment",
                        }),
                        {
                            allowedEdges: ["bottom", "top"],
                            input,
                            element: containerRef.current,
                        }
                    );
                },
                onDrop({ source: { data }, location, self }) {
                    console.log("we droppin", data);
                    setClosestEdge(null);

                    if (!isEditorNodeDragData(data)) return;

                    // we might be going outside a row. let's find out.
                    const edge = extractClosestEdge(self.data);
                    if (edge !== "top" && edge !== "bottom") return;

                    // ok. new row time.
                    dispatch(
                        moveAttachmentToNewRow({
                            attachmentNodeId: data.nodeId,
                            relativeNodeId: nodeId,
                            position: edge === "top" ? "before" : "after",
                        })
                    );
                },
                onDrag({ self, source }) {
                    const data = source.data;
                    if (!isEditorNodeDragData(data)) {
                        return;
                    }

                    const isSource = data.nodeId === nodeId;
                    if (isSource) {
                        setClosestEdge(null);
                        return;
                    }

                    const closestEdge = extractClosestEdge(self.data);

                    console.log("closest edge", closestEdge);

                    setClosestEdge(closestEdge);
                },
                onDragLeave() {
                    setClosestEdge(null);
                },
            })
        );
    }, [dispatch, node, nodeId, nodePosition]);

    return (
        <figure className={topLevelClasses} ref={containerRef}>
            {closestEdge && <DropIndicator edge={closestEdge} gap="4px" />}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                src={sourceURL}
                preload="metadata"
                className="w-full p-2"
                ref={audio}
            />

            <div className="flex flex-row">
                <div className="flex flex-col gap-1">
                    {/* drag handle */}
                    <div
                        className="flex w-[76px] basis-1/2 items-center bg-cherry"
                        title="move this attachment"
                        ref={dragHandleRef}
                    >
                        <MoveIcon className="m-auto h-8 w-8 text-notWhite" />
                    </div>

                    <AudioPlayPauseButton
                        mode={playPauseMode}
                        className="basis-1/2"
                        togglePlayback={togglePlayback}
                    />
                </div>

                <div className="flex w-full flex-col bg-notBlack p-2">
                    <AttachmentDeleteButton onDelete={onDelete} />
                    <input
                        className={classNames(inputStyleClasses, "mb-1")}
                        type="text"
                        placeholder="add title information"
                        defaultValue={node.title}
                        ref={titleElement}
                        onChange={onMetadataChange}
                        disabled={!isEditing}
                    />
                    <input
                        className={inputStyleClasses}
                        type="text"
                        name="artist"
                        placeholder="add artist information"
                        defaultValue={node.artist}
                        ref={artistElement}
                        onChange={onMetadataChange}
                        disabled={!isEditing}
                    />
                </div>
            </div>
        </figure>
    );
};
AudioAttachmentEditor.displayName = "AudioAttachmentEditor";
