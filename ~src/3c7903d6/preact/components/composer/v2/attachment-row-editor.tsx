import { isDefined } from "@/shared/util/filter-null-undefined";
import {
    Edge,
    attachClosestEdge,
    extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import React, { useEffect, useMemo, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { AudioAttachmentEditor } from "./audio-attachment-editor";
import { getEditorNodeDragData, isEditorNodeDragData } from "./data-types";
import {
    AttachmentEditorNode,
    NodeId,
    isAttachmentNode,
} from "./document-model";
import { DropIndicator } from "./drop-indicator";
import { ImageAttachmentEditor } from "./image-attachment-editor";
import {
    moveAttachmentToExistingRow,
    moveAttachmentToNewRow,
    selectBody,
} from "./reducer";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

function attachmentDimensions(attachment: AttachmentEditorNode) {
    if (attachment.type === "image-attachment") {
        return {
            width: attachment.width,
            height: attachment.height,
        };
    } else if (attachment.type === "audio-attachment") {
        return undefined;
    }
}

export const AttachmentRowEditor: React.FC<{ nodeId: NodeId }> = ({
    nodeId,
}) => {
    const dispatch = useAppDispatch();
    const body = useAppSelector(selectBody);
    const allNodes = body.nodes;
    const node = allNodes[nodeId];
    const nodePosition = body.nodeOrder.indexOf(nodeId);

    if (node.type !== "attachment-row") {
        throw new Error(`region ${nodeId} isn't attachment row?`);
    }

    const containerRef = useRef<HTMLDivElement>(null);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        invariant(element);

        return combine(
            dropTargetForElements({
                element,
                getIsSticky: () => true,
                getData({ input }) {
                    invariant(containerRef.current);
                    return attachClosestEdge(
                        getEditorNodeDragData({
                            nodeId,
                            nodeType: "attachment-row",
                        }),
                        {
                            allowedEdges: ["bottom", "top"],
                            input,
                            element: containerRef.current,
                        }
                    );
                },
                onDrop({ source: { data }, location, self }) {
                    setClosestEdge(null);

                    if (!isEditorNodeDragData(data)) return;

                    // figure out where to place it in our current list
                    const attachmentTarget = location.current.dropTargets.find(
                        (dropTarget) => {
                            if (
                                !isEditorNodeDragData(dropTarget.data) ||
                                dropTarget.data.nodeId === data.nodeId
                            )
                                return false;
                            const edge = extractClosestEdge(dropTarget.data);
                            return edge === "left" || edge === "right";
                        }
                    );

                    // we're going in the row! nice
                    if (attachmentTarget) {
                        if (!isEditorNodeDragData(attachmentTarget.data))
                            return;

                        const closestEdge = extractClosestEdge(
                            attachmentTarget.data
                        );
                        const attachmentIndex = node.attachments.indexOf(
                            attachmentTarget.data.nodeId
                        );
                        const insertLocation =
                            closestEdge === "left"
                                ? Math.max(attachmentIndex - 1, 0)
                                : attachmentIndex + 1;
                        dispatch(
                            moveAttachmentToExistingRow({
                                attachmentNodeId: data.nodeId,
                                rowNodeId: nodeId,
                                positionInRow: insertLocation,
                            })
                        );

                        return;
                    }

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
                onDrag({ self, source, location }) {
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

                    // verify if any of our contained attachments have a closest
                    // edge set. we don't want to double render the indicator.
                    const locationSet = location.current.dropTargets.some(
                        (dropTarget) => {
                            if (!isEditorNodeDragData(dropTarget.data))
                                return false;

                            // ignore ourselves
                            const targetData = getEditorNodeDragData(
                                dropTarget.data
                            );
                            if (targetData.nodeId === nodeId) return false;

                            // ignore the source
                            if (targetData.nodeId === data.nodeId) return false;

                            const closestEdge = extractClosestEdge(
                                dropTarget.data
                            );
                            return closestEdge !== null;
                        }
                    );

                    setClosestEdge(locationSet ? null : closestEdge);
                },
                onDragLeave() {
                    setClosestEdge(null);
                },
            })
        );
    }, [dispatch, node.attachments, nodeId, nodePosition]);

    const aspectRatio = useMemo(() => {
        const attachmentNodes = node.attachments
            .map((attachmentId) => allNodes[attachmentId])
            .filter(isDefined)
            .filter(isAttachmentNode);

        if (attachmentNodes.length === 0) return undefined;

        const largestAttachment = attachmentNodes.reduce((prev, curr) => {
            const currDimensions = attachmentDimensions(curr),
                prevDimensions = prev ? attachmentDimensions(prev) : undefined;

            if (
                currDimensions &&
                (!prevDimensions ||
                    currDimensions.height * currDimensions.width >
                        prevDimensions.height * prevDimensions.width)
            ) {
                return curr;
            } else {
                return prev;
            }
        });

        const largestAttachmentDimensions = largestAttachment
            ? attachmentDimensions(largestAttachment)
            : undefined;
        let aspectRatio: number | undefined = undefined;

        if (attachmentNodes.length > 1) {
            if (
                largestAttachmentDimensions &&
                largestAttachmentDimensions.width &&
                largestAttachmentDimensions.height
            ) {
                aspectRatio =
                    largestAttachmentDimensions.width /
                    largestAttachmentDimensions.height;
            } else {
                aspectRatio = 16 / 9;
            }
        }

        return aspectRatio;
    }, [allNodes, node.attachments]);

    return (
        <div
            className="relative flex items-center justify-between"
            ref={containerRef}
        >
            {closestEdge && <DropIndicator edge={closestEdge} gap="4px" />}
            {node.attachments.map((attachmentId) => {
                const attachmentNode = allNodes[attachmentId];
                if (attachmentNode.type === "image-attachment") {
                    return (
                        <ImageAttachmentEditor
                            key={attachmentId}
                            nodeId={attachmentId}
                            aspectRatio={aspectRatio}
                        />
                    );
                } else if (attachmentNode.type === "audio-attachment") {
                    return (
                        <AudioAttachmentEditor
                            key={attachmentId}
                            nodeId={attachmentId}
                        />
                    );
                }
            })}
        </div>
    );
};
