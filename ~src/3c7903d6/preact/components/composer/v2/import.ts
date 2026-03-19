import { AttachmentState } from "@/shared/types/attachments";
import {
    AttachmentViewBlock,
    ViewBlock,
    isAskViewBlock,
    isAttachmentRowViewBlock,
    isAttachmentViewBlock,
    isMarkdownViewBlock,
} from "@/shared/types/post-blocks";
import {
    Attachment,
    EditorNode,
    PostEditorContext,
    generateNodeId,
    isImageAttachmentNode,
} from "./document-model";
import { makeSourceURL } from "./make-source-url";

function nodeFromAttachment(block: AttachmentViewBlock) {
    const attachment: Attachment = {
        attachmentId: block.attachment.attachmentId,
        state: AttachmentState.Finished,
        uploadState: "finished",
    };

    if (block.attachment.kind === "audio") {
        const newNode: EditorNode<"audio-attachment"> = {
            type: "audio-attachment",
            attachment,
            sourceUrl: makeSourceURL(attachment),
            artist: block.attachment.artist ?? "",
            title: block.attachment.title ?? "",
            nodeId: generateNodeId(),
        };
        return newNode;
    } else if (block.attachment.kind === "image") {
        const newNode: EditorNode<"image-attachment"> = {
            type: "image-attachment",
            attachment,
            sourceUrl: makeSourceURL(attachment),
            altText: block.attachment.altText ?? "",
            width: block.attachment.width ?? 0,
            height: block.attachment.height ?? 0,
            nodeId: generateNodeId(),
        };

        return newNode;
    }
}

function attachmentRowWithAttachments(
    attachments: EditorNode<"image-attachment">[]
): EditorNode<"attachment-row"> {
    const rowNode: EditorNode<"attachment-row"> = {
        type: "attachment-row",
        attachments: [],
        nodeId: generateNodeId(),
    };

    for (const attachment of attachments) {
        rowNode.attachments.push(attachment.nodeId);
    }

    return rowNode;
}

export function importCohostPost(
    blocks: ViewBlock[]
): PostEditorContext["body"] {
    const nodes: PostEditorContext["body"]["nodes"] = {};
    const nodeOrder: PostEditorContext["body"]["nodeOrder"] = [];
    let accumulatedText: string = "";
    let accumulatedAttachmentRow: EditorNode<"image-attachment">[] = [];

    // run this in all handlers that don't involve text.
    function handleAccumulatedText() {
        if (accumulatedText.length > 0) {
            const textNode: EditorNode<"text"> = {
                type: "text",
                text: accumulatedText,
                nodeId: generateNodeId(),
            };

            nodes[textNode.nodeId] = textNode;
            nodeOrder.push(textNode.nodeId);
            accumulatedText = "";
        }
    }

    // run this in all handlers that don't involve image attachments.
    function handleAccumulatedAttachmentRow() {
        if (accumulatedAttachmentRow.length === 0) return;

        accumulatedAttachmentRow.forEach((attachment) => {
            nodes[attachment.nodeId] = attachment;
        });

        if (accumulatedAttachmentRow.length % 2 === 0) {
            // even
            for (let i = 0; i < accumulatedAttachmentRow.length; i += 2) {
                const row = attachmentRowWithAttachments(
                    accumulatedAttachmentRow.slice(i, i + 2)
                );

                nodes[row.nodeId] = row;
                nodeOrder.push(row.nodeId);
            }
        } else if (accumulatedAttachmentRow.length >= 3) {
            // odd, >= 3 (currently only exactly 3, this will change at some point)
            const firstThree = accumulatedAttachmentRow.splice(0, 3);
            const firstThreeRow = attachmentRowWithAttachments(firstThree);
            nodes[firstThreeRow.nodeId] = firstThreeRow;
            nodeOrder.push(firstThreeRow.nodeId);
            for (let i = 0; i < accumulatedAttachmentRow.length; i += 2) {
                const row = attachmentRowWithAttachments(
                    accumulatedAttachmentRow.slice(i, i + 2)
                );

                nodes[row.nodeId] = row;
                nodeOrder.push(row.nodeId);
            }
        } else {
            // only one
            const row = attachmentRowWithAttachments(accumulatedAttachmentRow);

            nodes[row.nodeId] = row;
            nodeOrder.push(row.nodeId);
        }

        accumulatedAttachmentRow = [];
    }

    for (const block of blocks) {
        if (isAskViewBlock(block)) {
            // this doesn't get loaded into the content editor
            continue;
        }

        if (isMarkdownViewBlock(block)) {
            handleAccumulatedAttachmentRow();

            // adjacent markdown blocks should be separated by a paragraph break
            if (accumulatedText.length > 0) {
                accumulatedText += "\n\n";
            }

            accumulatedText += block.markdown.content;
        }

        if (isAttachmentRowViewBlock(block)) {
            handleAccumulatedText();
            handleAccumulatedAttachmentRow();

            const rowNode: EditorNode<"attachment-row"> = {
                type: "attachment-row",
                attachments: [],
                nodeId: generateNodeId(),
            };

            for (const attachmentBlock of block.attachments) {
                const newNode = nodeFromAttachment(attachmentBlock);
                if (newNode) {
                    rowNode.attachments.push(newNode.nodeId);
                    nodes[newNode.nodeId] = newNode;
                }
            }
            nodes[rowNode.nodeId] = rowNode;
            nodeOrder.push(rowNode.nodeId);
        }

        if (isAttachmentViewBlock(block)) {
            handleAccumulatedText();

            const newNode = nodeFromAttachment(block);

            if (newNode) {
                if (isImageAttachmentNode(newNode)) {
                    accumulatedAttachmentRow.push(newNode);
                } else {
                    nodes[newNode.nodeId] = newNode;
                    nodeOrder.push(newNode.nodeId);
                }
            }
        }
    }

    // reached the end of the post. handle any remaining text or attachment
    // rows. attachments first.
    handleAccumulatedAttachmentRow();

    // now text. we don't check length here because we always want to end with a
    // text node, empty or not.
    const textNode: EditorNode<"text"> = {
        type: "text",
        text: accumulatedText,
        nodeId: generateNodeId(),
    };

    nodes[textNode.nodeId] = textNode;
    nodeOrder.push(textNode.nodeId);
    accumulatedText = "";

    return { nodes, nodeOrder };
}

export const test_nodeFromAttachment = nodeFromAttachment;
