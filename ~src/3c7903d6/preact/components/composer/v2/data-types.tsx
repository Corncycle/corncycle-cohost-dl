// following the pattern in

import { AnyEditorNode, NodeId } from "./document-model";

// https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/docs/constellation/05-core-package/09-recipes/typing-data.mdx
const privateKey = Symbol("EditorNode");

type EditorNodeDragData = {
    [privateKey]: true;
    nodeId: NodeId;
    nodeType: AnyEditorNode["type"];
};

export function getEditorNodeDragData(
    data: Omit<EditorNodeDragData, typeof privateKey>
) {
    return {
        [privateKey]: true,
        ...data,
    };
}

export function isEditorNodeDragData(
    data: Record<string | symbol, unknown>
): data is EditorNodeDragData {
    return Boolean(data[privateKey]);
}
