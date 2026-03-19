import React, {
    FunctionComponent,
    ReactElement,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { ContentEditorTextRegion } from "./content-editor-text-region";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { selectBody, insertFile } from "./reducer";
import { ImageAttachmentEditor } from "./image-attachment-editor";
import { AudioAttachmentEditor } from "./audio-attachment-editor";
import { isDefined } from "@/shared/util/filter-null-undefined";
import { AttachmentRowEditor } from "./attachment-row-editor";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { getEditorNodeDragData, isEditorNodeDragData } from "./data-types";

export const ContentEditor: FunctionComponent = (props) => {
    const dispatch = useAppDispatch();
    const body = useAppSelector(selectBody);
    const containerRef = useRef<HTMLDivElement>(null);

    const children = body.nodeOrder.map((nodeId) => {
        const node = body.nodes[nodeId];
        if (node.type === "text") {
            return <ContentEditorTextRegion key={nodeId} nodeId={nodeId} />;
        } else if (node.type === "image-attachment") {
            return <ImageAttachmentEditor key={nodeId} nodeId={nodeId} />;
        } else if (node.type === "audio-attachment") {
            return <AudioAttachmentEditor key={nodeId} nodeId={nodeId} />;
        } else if (node.type === "attachment-row") {
            return <AttachmentRowEditor key={nodeId} nodeId={nodeId} />;
        }
    });

    return (
        <div className="flex flex-col gap-3" ref={containerRef}>
            {children}
        </div>
    );
};
