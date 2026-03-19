import { AttachmentId } from "@/shared/types/ids";
import {
    MarkdownStorageBlock,
    StorageBlock,
    ViewBlock,
    isAttachmentStorageBlock,
    isAttachmentViewBlock,
} from "@/shared/types/post-blocks";
import * as uuid from "uuid";
import type { EditorNode, PostEditorContext } from "./document-model";

type PostExportData = {
    blocks: StorageBlock[];
    blocksForPreview: ViewBlock[];
};

function exportTextRegion(node: EditorNode<"text">): PostExportData {
    const blocks: MarkdownStorageBlock[] = node.text
        .split("\n\n")
        .map<MarkdownStorageBlock>((p) => ({
            type: "markdown",
            markdown: {
                content: p,
            },
        }));

    return { blocks, blocksForPreview: blocks };
}

function exportImageAttachmentNode(
    node: EditorNode<"image-attachment">
): PostExportData {
    return {
        blocks: [
            {
                type: "attachment",
                attachment: {
                    // it's possible for an attachment to have a null ID
                    // if it's been newly created and not sent to the server
                    // yet (see ../post-editor-machine.ts:712).  render the
                    // block as well-formed but semantically invalid until
                    // post upload finishes.
                    attachmentId:
                        node.attachment.attachmentId ??
                        (uuid.NIL as AttachmentId),
                    altText: node.altText,
                },
            },
        ],
        blocksForPreview: [
            {
                type: "attachment",
                attachment: {
                    altText: node.altText,
                    width: node.width,
                    height: node.height,
                    attachmentId:
                        node.attachment.attachmentId ??
                        (uuid.NIL as AttachmentId),
                    kind: "image",
                    previewURL: node.sourceUrl,
                    fileURL: node.sourceUrl,
                },
            },
        ],
    };
}

function exportAudioAttachmentNode(
    node: EditorNode<"audio-attachment">
): PostExportData {
    return {
        blocks: [
            {
                type: "attachment",
                attachment: {
                    // it's possible for an attachment to have a null ID
                    // if it's been newly created and not sent to the server
                    // yet (see ../post-editor-machine.ts:712).  render the
                    // block as well-formed but semantically invalid until
                    // post upload finishes.
                    attachmentId:
                        node.attachment.attachmentId ??
                        (uuid.NIL as AttachmentId),
                },
            },
        ],
        blocksForPreview: [
            {
                type: "attachment",
                attachment: {
                    artist: node.artist,
                    title: node.title,
                    attachmentId:
                        node.attachment.attachmentId ??
                        (uuid.NIL as AttachmentId),
                    kind: "audio",
                    previewURL: node.sourceUrl,
                    fileURL: node.sourceUrl,
                },
            },
        ],
    };
}

function exportAttachmentRowNode(
    node: EditorNode<"attachment-row">,
    nodes: PostEditorContext["body"]["nodes"]
): PostExportData {
    const rowStorageBlock: StorageBlock = {
        type: "attachment-row",
        attachments: [],
    };
    const rowViewBlock: ViewBlock = {
        type: "attachment-row",
        attachments: [],
    };

    node.attachments.forEach((attachmentNodeId) => {
        let thisChildResult: PostExportData | null = null;

        const attachmentNode = nodes[attachmentNodeId];
        if (!attachmentNode) return;

        switch (attachmentNode.type) {
            case "image-attachment": {
                thisChildResult = exportImageAttachmentNode(attachmentNode);
                break;
            }
            case "audio-attachment": {
                thisChildResult = exportAudioAttachmentNode(attachmentNode);
                break;
            }
            // we only care about attachment nodes
            default:
                return;
        }

        if (!thisChildResult) return;

        rowStorageBlock.attachments.push(
            ...thisChildResult.blocks.filter(isAttachmentStorageBlock)
        );
        rowViewBlock.attachments.push(
            ...thisChildResult.blocksForPreview.filter(isAttachmentViewBlock)
        );
    });

    return { blocks: [rowStorageBlock], blocksForPreview: [rowViewBlock] };
}

export function exportCohostPost(
    editorState: PostEditorContext["body"]
): PostExportData {
    // aggregate the contents of all of the root's children
    const blocks: StorageBlock[] = [];
    const blocksForPreview: ViewBlock[] = [];

    for (const nodeId of editorState.nodeOrder) {
        let thisChildResult: PostExportData | null = null;

        const node = editorState.nodes[nodeId];
        if (!node) continue;

        switch (node.type) {
            case "text": {
                thisChildResult = exportTextRegion(node);
                break;
            }
            case "image-attachment": {
                thisChildResult = exportImageAttachmentNode(node);
                break;
            }
            case "audio-attachment": {
                thisChildResult = exportAudioAttachmentNode(node);
                break;
            }
            case "attachment-row": {
                thisChildResult = exportAttachmentRowNode(
                    node,
                    editorState.nodes
                );
                break;
            }
        }

        if (!thisChildResult) continue;

        blocks.push(...thisChildResult.blocks);
        blocksForPreview.push(...thisChildResult.blocksForPreview);
    }

    return {
        blocks,
        blocksForPreview,
    };
}
