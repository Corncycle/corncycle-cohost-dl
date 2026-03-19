import { isDefined } from "@/shared/util/filter-null-undefined";
import {
    Edge,
    attachClosestEdge,
    extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import React, {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { ExpandingTextArea } from "../../expanding-text-area";
import { getEditorNodeDragData, isEditorNodeDragData } from "./data-types";
import { NodeId } from "./document-model";
import { DropIndicator } from "./drop-indicator";
import {
    insertFile,
    moveAttachmentToNewRow,
    selectBody,
    splitTextNodeAndInsertAttachment,
    updateTextRegion,
} from "./reducer";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

export const ContentEditorTextRegion: FunctionComponent<{
    nodeId: NodeId;
}> = ({ nodeId }) => {
    const dispatch = useAppDispatch();
    const body = useAppSelector(selectBody);
    const node = body.nodes[nodeId];
    const nodeIndex = body.nodeOrder.indexOf(nodeId);

    if (node.type !== "text") {
        throw new Error("node ID doesn't map to a text node");
    }

    const innerRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const isLastNode = body.nodeOrder[body.nodeOrder.length - 1] === nodeId;

    const { t } = useTranslation();

    const blocks = useMemo(
        () =>
            node.text
                .trim()
                .split("\n\n")
                .map((text) => text.trim()),
        [node.text]
    );

    function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
        dispatch(updateTextRegion({ nodeId, text: event.target.value }));
    }

    useEffect(() => {
        const element = containerRef.current;
        invariant(element);

        return combine(
            dropTargetForElements({
                element,
                getData({ input }) {
                    return attachClosestEdge(
                        getEditorNodeDragData({
                            nodeId,
                            nodeType: "text",
                        }),
                        {
                            allowedEdges: ["bottom", "top"],
                            input,
                            element: element,
                        }
                    );
                },
                onDrop({ source: { data }, location, self }) {
                    setClosestEdge(null);
                    setIsDragging(false);
                },
                onDrag({ self, source, location }) {
                    const data = source.data;
                    if (!isEditorNodeDragData(data)) {
                        return;
                    }

                    setIsDragging(true);

                    const isSource = data.nodeId === nodeId;
                    if (isSource) {
                        setClosestEdge(null);
                        return;
                    }
                },
                onDragLeave() {
                    setIsDragging(false);
                    setClosestEdge(null);
                },
            })
        );
    }, [blocks.length, dispatch, nodeId, nodeIndex]);

    const fakeEditor = useMemo(() => {
        return (
            <div
                className={`${
                    isDragging ? "" : "invisible"
                } co-editable-body absolute top-0 flex
                w-full resize-none flex-col gap-6 overflow-x-hidden whitespace-pre-wrap break-words border-none px-3 pb-2`}
            >
                {blocks.map((block, index) => {
                    return (
                        <FakeEditorBlock
                            block={block}
                            index={index}
                            numNodes={blocks.length}
                            key={index}
                            nodeId={nodeId}
                        />
                    );
                })}
            </div>
        );
    }, [blocks, isDragging, nodeId]);

    const onPaste = useCallback<React.ClipboardEventHandler>(
        (ev) => {
            const items = ev.clipboardData?.items ?? [];
            const file: File | undefined = Array.from(items)
                .filter((item) => item.type.indexOf("image") > -1)
                .map((item) => item.getAsFile())
                .filter(isDefined)[0];
            if (file) {
                dispatch(
                    insertFile({
                        atPosition: nodeIndex + 1,
                        file,
                    })
                );
                ev.preventDefault();
                return;
            }
        },
        [dispatch, nodeIndex]
    );

    return (
        <div className="relative" ref={containerRef}>
            <ExpandingTextArea
                onInput={onChange}
                className={`${
                    isDragging ? "invisible" : ""
                } co-editable-body w-full resize-none overflow-hidden border-none
                p-0 px-3 focus:ring-0`}
                placeholder={t(
                    "client:post-editor.body-placeholder",
                    "post body (accepts markdown!)"
                )}
                minRows={isLastNode ? 4 : 1}
                value={node.text}
                ref={innerRef}
                onPaste={onPaste}
            />
            {fakeEditor}
        </div>
    );
};

const FakeEditorBlock: FunctionComponent<{
    block: string;
    index: number;
    numNodes: number;
    nodeId: NodeId;
}> = ({ block, index, nodeId, numNodes }) => {
    const dispatch = useAppDispatch();
    const containerRef = useRef<HTMLDivElement>(null);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        invariant(element);

        return dropTargetForElements({
            element,
            // blocks are sticky so that we can drop between them more cleanly
            getIsSticky: () => true,
            getData({ input }) {
                return attachClosestEdge(
                    {},
                    {
                        allowedEdges: ["bottom", "top"],
                        input,
                        element: element,
                    }
                );
            },
            onDrag({ self, source, location }) {
                const data = source.data;
                if (!isEditorNodeDragData(data)) {
                    return;
                }

                const closestEdge = extractClosestEdge(self.data);

                setClosestEdge(closestEdge);
            },
            onDragLeave() {
                setClosestEdge(null);
            },
            onDrop({ source: { data }, self }) {
                setClosestEdge(null);

                if (!isEditorNodeDragData(data)) return;

                // check if we're splitting a text node
                const edge = extractClosestEdge(self.data);
                if (edge !== "top" && edge !== "bottom") return;

                if (
                    (edge === "top" && index === 0) ||
                    (edge === "bottom" && index === numNodes - 1)
                ) {
                    // new row, this shit's easy
                    dispatch(
                        moveAttachmentToNewRow({
                            attachmentNodeId: data.nodeId,
                            relativeNodeId: nodeId,
                            position: edge === "top" ? "before" : "after",
                        })
                    );
                    return;
                }

                // ok we gotta do a split
                dispatch(
                    splitTextNodeAndInsertAttachment({
                        attachmentNodeId: data.nodeId,
                        splitBlockIndex: edge === "top" ? index : index + 1,
                        textNodeId: nodeId,
                    })
                );
            },
        });
    }, [dispatch, index, nodeId, numNodes]);

    return (
        <div data-blockindex={index} className="relative" ref={containerRef}>
            {closestEdge && <DropIndicator edge={closestEdge} gap="4px" />}
            {block}
        </div>
    );
};
