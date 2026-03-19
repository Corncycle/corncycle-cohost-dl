import { NodeId, PostEditorContext } from "./document-model";

export function findSelectionInEditor(): NodeId | null {
    const selection = document.getSelection();

    if (!selection) {
        // TODO: figure out what we want to do about this
        console.warn("selection is null");
        return null;
    }

    let ancestorContainer: Node | null =
        selection.getRangeAt(0).commonAncestorContainer;

    // this might still be a non-element node; keep walking up the tree until
    // we get to an element
    while (
        ancestorContainer &&
        ancestorContainer.nodeType !== Node.ELEMENT_NODE
    ) {
        ancestorContainer = ancestorContainer.parentNode;
    }

    if (!ancestorContainer) {
        // TODO: figure out what we want to do about this
        console.warn("couldn't find an element ancestor of selection node");
        return null;
    }

    const containingNode = (ancestorContainer as Element).closest(
        "[data-node-id]"
    ) as HTMLElement;
    return containingNode
        ? (containingNode.dataset.nodeIndex! as NodeId)
        : null;
}

export function findAttachmentRowContainingAttachment(
    nodeId: NodeId,
    nodes: PostEditorContext["body"]["nodes"]
): NodeId | null {
    return (
        Object.values(nodes).find(
            (node) =>
                node.type === "attachment-row" &&
                node.attachments.includes(nodeId)
        )?.nodeId ?? null
    );
}
