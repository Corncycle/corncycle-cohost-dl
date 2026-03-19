import { AttachmentState } from "@/shared/types/attachments";
import { AskId, AttachmentId, PostId, ProjectHandle } from "@/shared/types/ids";
import { PostState } from "@/shared/types/posts";
import { Tagged } from "@/shared/types/tagged";
import { SiteConfigType } from "@/shared/util/site-config";
import { uniqueId } from "lodash";

export type NodeId = Tagged<string, "NodeId">;

export type AnyEditorNode =
    | TextNode
    | ImageAttachmentNode
    | AudioAttachmentNode
    | AttachmentRowNode;
export type EditorDocument = AnyEditorNode[];
export type EditorNode<TType extends AnyEditorNode["type"]> = AnyEditorNode & {
    type: TType;
};
export type AttachmentEditorNode = ImageAttachmentNode | AudioAttachmentNode;

export function isAttachmentNode(
    node: AnyEditorNode
): node is AttachmentEditorNode {
    return node.type === "image-attachment" || node.type === "audio-attachment";
}

export function isImageAttachmentNode(
    node: AnyEditorNode
): node is ImageAttachmentNode {
    return node.type === "image-attachment";
}

export function isAttachmentRowNode(
    node: AnyEditorNode
): node is AttachmentRowNode {
    return node.type === "attachment-row";
}

type BaseNode = {
    type: string;
    nodeId: NodeId;
};

export type TextNode = BaseNode & {
    type: "text";
    text: string;
};

export type AttachmentCompositionId = Tagged<string, "AttachmentCompositionId">;

type AttachmentUploadState =
    | "not-started"
    | "starting"
    | "uploading"
    | "finishing"
    | "finished";

export type Attachment = {
    attachmentId?: AttachmentId;
    state: AttachmentState;
    uploadState: AttachmentUploadState;
    uploadData?: {
        objectURL: string;
        filename: string;
        contentType: string;
        size: number;
    };
};

export type ImageAttachmentNode = BaseNode & {
    type: "image-attachment";
    attachment: Attachment;
    sourceUrl: string;
    altText: string;
    width: number;
    height: number;
};

export type AudioAttachmentNode = BaseNode & {
    type: "audio-attachment";
    attachment: Attachment;
    sourceUrl: string;
    artist: string;
    title: string;
};

export type AttachmentRowNode = BaseNode & {
    type: "attachment-row";
    attachments: NodeId[];
};

export type PostEditorState =
    | "not-ready"
    | "editing"
    | "uploading"
    | "finished"
    | "failed";

export interface PostEditorContext {
    state: PostEditorState;
    siteConfig: SiteConfigType;
    projectHandle: ProjectHandle;
    hasCohostPlus: boolean;
    postId?: PostId;
    headline: string;
    body: {
        nodes: { [key: NodeId]: AnyEditorNode };
        nodeOrder: NodeId[];
    };
    validationErrors: { [field: string]: string };
    shareOfPostId: PostId | null;
    responseToAskId: AskId | null;
    currentPostState?: PostState;
    newPostState: PostState;
    adultContent: boolean;
    maximumAllowedAttachments: number;
    tags: string[];
    cws: string[];
    cwsInputOpen: boolean;
    isActivated: boolean;
    dirty: boolean;
    editingTransparentShare: boolean;
    mostRecentTextNode: NodeId | null;
}

export function generateNodeId(): NodeId {
    return uniqueId("node-") as NodeId;
}
