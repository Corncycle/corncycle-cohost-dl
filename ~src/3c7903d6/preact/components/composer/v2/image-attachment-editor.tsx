import { AttachmentState } from "@/shared/types/attachments";
import {
    attachClosestEdge,
    extractClosestEdge,
    type Edge,
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
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { AttachmentDeleteButton } from "../../elements/attachment-delete-button";
import { BasicButton } from "../../elements/basic-button";
import { MoveIcon } from "../../icons/move";
import { AttachmentComposerContext } from "./attachment-composer-context";
import { getEditorNodeDragData, isEditorNodeDragData } from "./data-types";
import { NodeId } from "./document-model";
import { DropIndicator } from "./drop-indicator";
import { makeSourceURL } from "./make-source-url";
import { deleteNodeAtIndex, selectBody, selectIsEditing } from "./reducer";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

export const ATTACHMENT_NODE_DRAG_TYPE = "co-attachment-node";

export const ImageAttachmentEditor: FunctionComponent<{
    nodeId: NodeId;
    aspectRatio?: number;
}> = React.memo(({ nodeId, aspectRatio }) => {
    const dispatch = useAppDispatch();
    const node = useAppSelector(selectBody).nodes[nodeId];

    if (node.type !== "image-attachment") {
        throw new Error(`node ${nodeId} isn't image attachment?`);
    }

    const isEditing = useAppSelector(selectIsEditing);
    const attachmentComposerRef = useContext(AttachmentComposerContext);
    const { t } = useTranslation();
    const imageRef = useRef<HTMLImageElement>(null);
    const isSelected = false; // TODO: fix

    const shadeState:
        | { mode: "uploading"; displayString: string }
        | { mode: "move" | "none" } = useMemo(() => {
        invariant(
            node.type === "image-attachment",
            "node is not an image node"
        );
        if (!isEditing) {
            // isn't editing; display upload status
            if (node.attachment.state === AttachmentState.Finished) {
                return {
                    mode: "uploading",
                    displayString: t(
                        "client:post-editor.attachment-state.finished",
                        "uploaded!"
                    ),
                };
            }

            if (node.attachment.uploadState === "starting") {
                return {
                    mode: "uploading",
                    displayString: t(
                        "client:post-editor.attachment-state.starting",
                        "starting..."
                    ),
                };
            } else if (node.attachment.uploadState === "finishing") {
                return {
                    mode: "uploading",
                    displayString: t(
                        "client:post-editor.attachment-state.finishing",
                        "finishing up..."
                    ),
                };
            } else {
                return {
                    mode: "uploading",
                    displayString: t(
                        "client:post-editor.attachment-state.pending",
                        "uploading..."
                    ),
                };
            }
        } else {
            // is editing; display shade in move mode iff selected
            if (isSelected) {
                return {
                    mode: "move",
                };
            } else {
                return {
                    mode: "none",
                };
            }
        }
    }, [
        node.type,
        node.attachment.state,
        node.attachment.uploadState,
        isEditing,
        t,
        isSelected,
    ]);

    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [dragState, setDragState] = useState<"none" | "dragging">("none");

    useEffect(() => {
        invariant(imageRef.current);
        return combine(
            draggable({
                element: imageRef.current,
                getInitialData: () =>
                    getEditorNodeDragData({
                        nodeId,
                        nodeType: "image-attachment",
                    }),
                onDragStart() {
                    setDragState("dragging");
                },
                onDrop() {
                    setDragState("none");
                },
            }),
            dropTargetForElements({
                element: imageRef.current,
                getIsSticky: () => true,
                getData({ input }) {
                    invariant(imageRef.current);
                    return attachClosestEdge(
                        getEditorNodeDragData({
                            nodeId,
                            nodeType: "image-attachment",
                        }),
                        {
                            element: imageRef.current,
                            input,
                            allowedEdges: ["left", "right"],
                        }
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

                    setClosestEdge(closestEdge);
                },
                onDragLeave() {
                    setClosestEdge(null);
                },
                onDrop() {
                    setClosestEdge(null);
                },
            })
        );
    }, [nodeId]);

    const sourceURL = useMemo(() => {
        invariant(
            node.type === "image-attachment",
            "node is not an image node"
        );
        return makeSourceURL(node.attachment);
    }, [node.attachment, node.type]);
    const altTextButtonLabel = useMemo(() => {
        invariant(
            node.type === "image-attachment",
            "node is not an image node"
        );
        return node.altText.length > 0 ? "edit description" : "add description";
    }, [node.altText.length, node.type]);
    const topLevelClasses = classNames("group relative w-full flex-initial", {
        "co-selected-block ring-2": isSelected,
    });

    return (
        <div className={topLevelClasses}>
            {closestEdge && <DropIndicator edge={closestEdge} gap="4px" />}
            <img
                src={sourceURL}
                className={`no-touch-callout h-full w-full object-cover ${
                    dragState === "dragging" ? "opacity-10" : ""
                }`}
                style={{
                    aspectRatio: aspectRatio ? `${aspectRatio} / 1` : undefined,
                }}
                alt={node.altText}
                ref={imageRef}
            />
            {nodeId !== null ? (
                <>
                    <AttachmentDeleteButton
                        onDelete={() => {
                            dispatch(deleteNodeAtIndex(nodeId));
                        }}
                    />
                    <BasicButton
                        buttonSize="small"
                        buttonColor="cherry"
                        extraClasses="absolute bottom-3 left-3"
                        disabled={!isEditing || !attachmentComposerRef?.current}
                        onClick={() =>
                            attachmentComposerRef?.current?.open(nodeId)
                        }
                    >
                        {altTextButtonLabel}
                    </BasicButton>
                </>
            ) : null}
            <div
                className={`absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-80 text-notWhite ${
                    shadeState.mode !== "none" ? "block" : "hidden"
                }`}
            >
                {shadeState.mode === "uploading" ? (
                    shadeState.displayString
                ) : (
                    <div className="flex flex-col items-center">
                        <MoveIcon className="m-auto h-8 w-8 text-notWhite" />
                        {t("client:post-editor.drag-to-move", "drag to move")}
                    </div>
                )}
            </div>
        </div>
    );
});
ImageAttachmentEditor.displayName = "ImageAttachmentEditor";
