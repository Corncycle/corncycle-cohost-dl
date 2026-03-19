import { getVanillaClient } from "@/client/lib/trpc-vanilla";
import * as PostsV1Types from "@/shared/api-types/posts-v1";
import { AttachmentState } from "@/shared/types/attachments";
import { AskId, AttachmentId, PostId, ProjectHandle } from "@/shared/types/ids";
import {
    isAttachmentRowStorageBlock,
    isAttachmentStorageBlock,
    isMarkdownStorageBlock,
} from "@/shared/types/post-blocks";
import { PostState } from "@/shared/types/posts";
import { WirePostViewModel } from "@/shared/types/wire-models";
import {
    SiteConfigType,
    defaultConfig,
    isValidAttachmentContentType,
} from "@/shared/util/site-config";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import {
    PayloadAction,
    createAsyncThunk,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import axios from "axios";
import _ from "lodash";
import invariant from "tiny-invariant";
import * as uuid from "uuid";
import isEmpty from "validator/lib/isEmpty";
import {
    Attachment,
    AttachmentEditorNode,
    AttachmentRowNode,
    ImageAttachmentNode,
    NodeId,
    PostEditorContext,
    PostEditorState,
    TextNode,
    generateNodeId,
    isAttachmentNode,
} from "./document-model";
import { exportCohostPost } from "./export";
import { findAttachmentRowContainingAttachment } from "./find-selection";
import { importCohostPost } from "./import";
import { startAppListening } from "./middleware";
import { type RootState } from "./store";

const _selectBody = (state: PostEditorContext) => state.body;
const _selectRenderedPost = createSelector([_selectBody], (body) =>
    exportCohostPost(body)
);

export const selectAttachmentNodeIdsToUpload = createSelector(
    [_selectBody],
    (body) => {
        const nodeIds: NodeId[] = [];

        Object.values(body.nodes).forEach((node) => {
            if (
                isAttachmentNode(node) &&
                node.attachment.state === AttachmentState.Pending
            ) {
                nodeIds.push(node.nodeId);
            }
        });

        return nodeIds;
    }
);

const getImageDimensions = (
    url: string
): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () =>
            resolve({
                width: img.width,
                height: img.height,
            });
        img.onerror = (error) => reject(error);
        img.src = url;
    });
};

export const submit = createAsyncThunk<void, void, { rejectValue: string }>(
    "postComposer/submit/start",
    (_void, thunkApi) => {
        // ================== validate post =======================
        // post contains content if it contains any attachment block, or
        // any markdown block with positive-length content
        const state = (thunkApi.getState() as RootState).postComposer;
        const { blocks } = _selectRenderedPost(state);
        const anyContentfulBlocks = _.some(
            blocks,
            (block) =>
                isAttachmentStorageBlock(block) ||
                (isAttachmentRowStorageBlock(block) &&
                    block.attachments.length > 0) ||
                (isMarkdownStorageBlock(block) &&
                    block.markdown.content.trim().length > 0)
        );

        const anyContent =
            !isEmpty(state.headline) ||
            anyContentfulBlocks ||
            state.shareOfPostId;
        const anyBrokenAttachments = _.some(
            Object.values(state.body.nodes),
            (node) =>
                isAttachmentNode(node) &&
                // allow for NIL uuid for non-uploaded attachments to avoid zod parsing issues
                node.attachment.state !== AttachmentState.Pending &&
                node.attachment.attachmentId === uuid.NIL
        );

        if (anyBrokenAttachments) {
            // t("client:post-editor.broken-attachment", "at least one of the attachments on this post failed to upload.  please remove it and try attaching it again.")
            throw thunkApi.rejectWithValue(
                "client:post-editor.broken-attachment"
            );
        }

        if (!anyContent) {
            // t("client:post-editor.must-contain-content", "must contain a headline, any body content, or any attachment")
            throw thunkApi.rejectWithValue(
                "client:post-editor.must-contain-content"
            );
        }

        // state.dirty = false;

        // ===================== start posting ====================
        const pendingAttachmentNodeIds = selectAttachmentNodeIdsToUpload(state);

        if (!state.postId) {
            // new post?  we need to create the post first so attachments have
            // something to attach to
            void thunkApi.dispatch(submitCreatePost());
        } else {
            if (pendingAttachmentNodeIds.length) {
                // skip straight to uploading attachments
                pendingAttachmentNodeIds.forEach(
                    (nodeId) =>
                        void thunkApi.dispatch(
                            submitUploadAttachment({
                                nodeId,
                                postId: state.postId!,
                            })
                        )
                );
            } else {
                // skip straight to editing an existing post
                void thunkApi.dispatch(submitUpdatePost());
            }
        }
    }
);

export const submitCreatePost = createAsyncThunk<
    { postId: PostId; nextPostEditorState: PostEditorState },
    void,
    { rejectValue: string }
>("postComposer/submit/createPost", async (_void, thunkApi) => {
    const state = (thunkApi.getState() as RootState).postComposer;
    const { blocks } = _selectRenderedPost(state);
    let stateAfterCreate = PostState.Unpublished;

    if (selectAttachmentNodeIdsToUpload(state).length === 0) {
        // no attachments to upload, skip right to being done
        stateAfterCreate = state.newPostState;
    }

    const body: PostsV1Types.CreatePostReq = {
        postState: stateAfterCreate,
        headline: state.headline,
        adultContent: state.adultContent,
        blocks,
        cws: state.cws.filter((cw) => cw.length > 0).map((cw) => cw.trim()),
        tags: state.tags
            .filter((tag) => tag.length > 0)
            .map((tag) => tag.trim()),
        shareOfPostId:
            state.shareOfPostId && !isNaN(state.shareOfPostId)
                ? state.shareOfPostId
                : undefined,
        responseToAskId: state.responseToAskId
            ? state.responseToAskId
            : undefined,
    };

    const trpcClient = getVanillaClient();

    try {
        const postId = (
            await trpcClient.posts.create.mutate({
                projectHandle: state.projectHandle,
                content: body,
            })
        ).postId;

        // if there are attachments to upload, we need to do that; otherwise
        // we're done
        const pendingAttachmentNodeIds = selectAttachmentNodeIdsToUpload(state);

        if (pendingAttachmentNodeIds.length) {
            pendingAttachmentNodeIds.forEach(
                (nodeId) =>
                    void thunkApi.dispatch(
                        submitUploadAttachment({
                            nodeId,
                            postId,
                        })
                    )
            );

            return { postId, nextPostEditorState: "uploading" };
        } else {
            return { postId, nextPostEditorState: "finished" };
        }
    } catch (e) {
        throw thunkApi.rejectWithValue("network error: posts.create");
    }
});

export const submitUploadAttachment = createAsyncThunk<
    { attachmentId: AttachmentId },
    { nodeId: NodeId; postId: PostId },
    { rejectValue: string }
>(
    "postComposer/submit/uploadAttachmentRegion",
    async ({ nodeId, postId }, thunkApi) => {
        const state = (thunkApi.getState() as RootState).postComposer;
        const node = state.body.nodes[nodeId];

        if (!isAttachmentNode(node)) {
            throw thunkApi.rejectWithValue(
                "internal error: attempting to upload a node that's not an attachment"
            );
        }

        const {
            attachment: { uploadData: localData },
        } = node;
        const trpcClient = getVanillaClient();

        if (!localData) {
            throw thunkApi.rejectWithValue(
                "internal error: trying to upload an attachment without a file!"
            );
        }

        let startAttachmentData: Awaited<
            ReturnType<typeof trpcClient.posts.attachment.start.mutate>
        >;

        const blob = await (await fetch(localData.objectURL)).blob();

        try {
            switch (node.type) {
                case "image-attachment":
                    startAttachmentData =
                        await trpcClient.posts.attachment.start.mutate({
                            projectHandle: state.projectHandle,
                            postId,
                            filename: localData.filename,
                            contentType: localData.contentType,
                            contentLength: localData.size,
                            width: node.width,
                            height: node.height,
                        });
                    break;
                case "audio-attachment":
                    startAttachmentData =
                        await trpcClient.posts.attachment.start.mutate({
                            projectHandle: state.projectHandle,
                            postId,
                            filename: localData.filename,
                            contentType: localData.contentType,
                            contentLength: localData.size,
                            metadata: {
                                title: node.title,
                                artist: node.artist,
                            },
                        });
                    break;
            }
        } catch (e) {
            throw thunkApi.rejectWithValue(
                "network error: posts.attachment.start"
            );
        }

        // - upload
        if (!startAttachmentData.url) {
            console.error(localData, blob, startAttachmentData.url);
            throw thunkApi.rejectWithValue(
                "internal error: missing upload URL for pending attachment!"
            );
        }

        const formData = new FormData();
        for (const name in startAttachmentData.requiredFields) {
            formData.append(name, startAttachmentData.requiredFields[name]);
        }
        formData.append("file", blob);
        formData.append("Content-Type", localData.contentType);

        try {
            await axios.post(startAttachmentData.url, formData, {
                withCredentials: false,
            });
        } catch (e) {
            throw thunkApi.rejectWithValue("network error: error uploading");
        }

        // - finish attachment
        try {
            await trpcClient.posts.attachment.finish.mutate({
                projectHandle: state.projectHandle,
                postId,
                attachmentId: startAttachmentData.attachmentId,
            });

            return {
                attachmentId: startAttachmentData.attachmentId,
            };
        } catch (e) {
            throw thunkApi.rejectWithValue(
                "network error: posts.attachment.finish"
            );
        }
    }
);

export const submitUpdatePost = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>("postComposer/submit/updatePost", async (_void, thunkApi) => {
    const state = (thunkApi.getState() as RootState).postComposer;
    const trpcClient = getVanillaClient();
    const { blocks } = _selectRenderedPost(state);

    const body: PostsV1Types.UpdatePostReq = {
        postState: state.newPostState,
        headline: state.headline,
        adultContent: state.adultContent,
        blocks,
        cws: state.cws.filter((cw) => cw.length > 0).map((cw) => cw.trim()),
        tags: state.tags
            .filter((tag) => tag.length > 0)
            .map((tag) => tag.trim()),
        shareOfPostId:
            state.shareOfPostId && !isNaN(state.shareOfPostId)
                ? state.shareOfPostId
                : undefined,
    };

    try {
        await trpcClient.posts.update.mutate({
            projectHandle: state.projectHandle,
            postId: state.postId!,
            content: body,
        });
    } catch (e) {
        throw thunkApi.rejectWithValue("network error: posts.update");
    }
});

// used to get around hook changing issues
const EMPTY_ARRAY: string[] = [];

function createBlankBody() {
    const emptyTextNode: TextNode = {
        type: "text",
        text: "",
        nodeId: generateNodeId(),
    };

    return {
        nodes: { [emptyTextNode.nodeId]: emptyTextNode },
        nodeOrder: [emptyTextNode.nodeId],
    };
}

const initialState: PostEditorContext = {
    state: "not-ready",
    siteConfig: defaultConfig,
    // we need to have a value set for projecthandle
    // state so we deliberately set invalid ones since it'll be
    // overwritten in the post composer.
    projectHandle: "" as ProjectHandle,
    isActivated: false,
    hasCohostPlus: false,
    currentPostState: undefined,
    headline: "",
    body: createBlankBody(),
    validationErrors: {},
    newPostState: PostState.Published,
    shareOfPostId: null,
    responseToAskId: null,
    adultContent: false,
    maximumAllowedAttachments: 4,
    tags: [],
    cws: [],
    cwsInputOpen: false,
    dirty: false,
    editingTransparentShare: false,
    mostRecentTextNode: null,
};

export const postComposerSlice = createSlice({
    name: "postComposer",
    initialState,
    reducers: (create) => ({
        initForNewPost(
            state,
            action: PayloadAction<{
                handle: ProjectHandle;
                isActivated: boolean;
                hasCohostPlus: boolean;
                siteConfig: SiteConfigType;
                shareOf: PostId | null;
                responseToAskId: AskId | null;
                tags: string[];
                cws: string[];
                adultContent: boolean;
            }>
        ) {
            // FIXME: this is terrible and should be decomposed but it's an
            // interim measure until more of the app is converted over to redux
            state.state = "editing";
            state.projectHandle = action.payload.handle;
            state.isActivated = action.payload.isActivated;
            state.hasCohostPlus = action.payload.hasCohostPlus;
            state.siteConfig = action.payload.siteConfig;

            state.shareOfPostId = action.payload.shareOf;
            state.responseToAskId = action.payload.responseToAskId;

            state.body = createBlankBody();
            state.tags = action.payload.tags;
            state.cws = action.payload.cws;
        },
        initForEditing(
            state,
            action: PayloadAction<{
                handle: ProjectHandle;
                isActivated: boolean;
                hasCohostPlus: boolean;
                siteConfig: SiteConfigType;
                post: WirePostViewModel;
            }>
        ) {
            // FIXME: this is terrible and should be decomposed but it's an
            // interim measure until more of the app is converted over to redux
            state.state = "editing";
            state.projectHandle = action.payload.handle;
            state.isActivated = action.payload.isActivated;
            state.hasCohostPlus = action.payload.hasCohostPlus;
            state.siteConfig = action.payload.siteConfig;

            const post = action.payload.post;
            state.postId = post.postId;
            state.currentPostState = post.state;
            state.newPostState = post.state;
            state.adultContent = post.effectiveAdultContent;
            state.shareOfPostId = post.shareOfPostId;
            state.headline = post.headline;

            state.body = importCohostPost(post.blocks);

            // we need to know if the existing post is a transparent share so we
            // can adjust the rendered composer accordingly
            state.editingTransparentShare = !!post.transparentShareOfPostId;

            state.tags = post.tags;
            state.cws = post.cws;
            state.responseToAskId = post.responseToAskId ?? null;
        },
        updateTextRegion(
            state,
            action: PayloadAction<{
                nodeId: NodeId;
                text: string;
            }>
        ) {
            const node = state.body.nodes[action.payload.nodeId];
            invariant(
                node.type === "text",
                "can't insert text into non-text node"
            );

            node.text = action.payload.text;
            state.body.nodes[action.payload.nodeId] = node;
            state.dirty = true;
            state.mostRecentTextNode = action.payload.nodeId;
        },
        updateImageAltText(
            state,
            action: PayloadAction<{
                nodeId: NodeId;
                altText: string;
            }>
        ) {
            const oldNode = state.body.nodes[action.payload.nodeId];

            if (oldNode.type !== "image-attachment") {
                throw `assertion failure: node at index ${action.payload.nodeId} is not image`;
            }

            state.body.nodes[action.payload.nodeId] = {
                ...oldNode,
                altText: action.payload.altText,
            };
        },
        updateAudioMetadata(
            state,
            action: PayloadAction<{
                nodeId: NodeId;
                artist: string;
                title: string;
            }>
        ) {
            const oldNode = state.body.nodes[action.payload.nodeId];

            if (oldNode.type !== "audio-attachment") {
                throw `assertion failure: node at index ${action.payload.nodeId} is not audio`;
            }

            state.body.nodes[action.payload.nodeId] = {
                ...oldNode,
                artist: action.payload.artist,
                title: action.payload.title,
            };
        },
        insertNewTextAtSelection(state, action: PayloadAction<string>) {
            const selectedNodeId = state.mostRecentTextNode;

            // TODO: this wasn't touched by jae, need to verify functionality
            // (do this during the live test phase)

            // TODO: figure out what we want to do in these error cases
            if (selectedNodeId === null) {
                throw new Error("selection isn't inside a text region?");
            }

            const selectedNode = state.body.nodes[selectedNodeId];

            if (selectedNode.type !== "text") {
                throw new Error("unexpected selected region type?");
            }

            const selectionOffset = document.getSelection()?.anchorOffset;

            // insert text at the insertion point
            state.body.nodes[selectedNodeId] = {
                type: "text",
                text:
                    selectedNode.text.slice(0, selectionOffset) +
                    action.payload +
                    selectedNode.text.slice(selectionOffset),
                nodeId: selectedNodeId,
            };
            state.dirty = true;
            state.mostRecentTextNode = selectedNodeId;
        },
        insertFile(
            state,
            action: PayloadAction<{ file: File; atPosition: number }>
        ) {
            function insertAttachment(
                attachment:
                    | {
                          position: number;
                          kind: "audio";
                          sourceUrl: string;
                          attachment: Attachment & { kind: "audio" };
                          artist: string;
                          title: string;
                      }
                    | {
                          position: number;
                          kind: "image";
                          sourceUrl: string;
                          attachment: Attachment & { kind: "image" };
                          altText: string;
                          width: number;
                          height: number;
                      }
            ) {
                const attachmentNode: AttachmentEditorNode =
                    attachment.kind === "image"
                        ? {
                              type: "image-attachment",
                              attachment: attachment.attachment,
                              sourceUrl: attachment.sourceUrl,
                              altText: attachment.altText,
                              width: attachment.width,
                              height: attachment.height,
                              nodeId: generateNodeId(),
                          }
                        : {
                              type: "audio-attachment",
                              attachment: attachment.attachment,
                              sourceUrl: attachment.sourceUrl,
                              artist: attachment.artist,
                              title: attachment.title,
                              nodeId: generateNodeId(),
                          };

                state.body.nodes[attachmentNode.nodeId] = attachmentNode;

                const nodeIdAtPosition =
                    state.body.nodeOrder[attachment.position];
                const nodeAtPosition = state.body.nodes[nodeIdAtPosition];

                // image attachments get placed in an existing row if (1) one exists
                // at the location we're requesting (2) the row isn't full (3 images
                // max)
                if (attachment.kind === "image") {
                    if (
                        nodeAtPosition &&
                        nodeAtPosition.type === "attachment-row" &&
                        nodeAtPosition.attachments.length < 3
                    ) {
                        nodeAtPosition.attachments.push(attachmentNode.nodeId);
                    } else {
                        // make a new row and stick the image in it
                        const rowNode: AttachmentRowNode = {
                            type: "attachment-row",
                            attachments: [attachmentNode.nodeId],
                            nodeId: generateNodeId(),
                        };
                        state.body.nodeOrder.splice(
                            attachment.position,
                            0,
                            rowNode.nodeId
                        );
                        state.body.nodes[rowNode.nodeId] = rowNode;
                    }
                } else {
                    // audio attachments can't be in rows
                    state.body.nodeOrder.splice(
                        attachment.position,
                        0,
                        attachmentNode.nodeId
                    );
                }

                delete state.validationErrors["attachments"];

                state.dirty = true;
            }

            const effectiveLimit = state.hasCohostPlus
                ? state.siteConfig.limits.attachmentSize.cohostPlus
                : state.siteConfig.limits.attachmentSize.normal;

            const attachmentCount = Object.values(state.body.nodes).filter(
                isAttachmentNode
            ).length;
            if (attachmentCount >= state.siteConfig.limits.attachmentCount) {
                // t("client:post-editor.too-many-attachments", "you can only add up to 10 attachments to a post!")
                state.validationErrors["attachments"] =
                    "client:post-editor.too-many-attachments";
                return;
            }

            const file = action.payload.file;

            const validityResult = isValidAttachmentContentType(
                state.siteConfig,
                file.type
            );

            if (!validityResult.valid) {
                // t("client:post-editor.attachment-must-be-image", "one or more attachments is not of a supported file type!")
                state.validationErrors["attachments"] =
                    "client:post-editor.attachment-must-be-image";
                return;
            }

            if (file.size > effectiveLimit) {
                // TODO: figure out how to get the interpolation to work
                // here since we're just passing the key.
                // t("client:post-editor.attachment-too-large", "attachments must be less than 5mb!")
                // t("client:post-editor.attachment-too-large-cohost-plus", "attachments must be less than 10mb!")
                const key = state.hasCohostPlus
                    ? "client:post-editor.attachment-too-large-cohost-plus"
                    : "client:post-editor.attachment-too-large";
                state.validationErrors["attachments"] = key;
                return;
            }

            const objectURL = URL.createObjectURL(file);

            switch (validityResult.kind) {
                case "image": {
                    const dimensions = { width: 0, height: 0 };

                    const newAttachment = {
                        kind: "image" as const,
                        uploadData: {
                            objectURL,
                            filename: file.name,
                            size: file.size,
                            contentType: file.type,
                        },
                        state: AttachmentState.Pending,
                        uploadState: "not-started" as const,
                    };

                    // insert into last attachment row, or at the end if none is available
                    const position = state.body.nodeOrder.findIndex(
                        (nodeId) => {
                            const node = state.body.nodes[nodeId];
                            return (
                                node.type === "attachment-row" &&
                                node.attachments.length < 3
                            );
                        }
                    );

                    insertAttachment({
                        position,
                        kind: "image",
                        sourceUrl: objectURL,
                        attachment: newAttachment,
                        altText: "",
                        width: dimensions.width,
                        height: dimensions.height,
                    });

                    return;
                }
                case "audio": {
                    const newAttachment = {
                        kind: "audio" as const,
                        uploadData: {
                            objectURL,
                            filename: file.name,
                            size: file.size,
                            contentType: file.type,
                        },
                        state: AttachmentState.Pending,
                        uploadState: "not-started" as const,
                    };

                    insertAttachment({
                        position: -1,
                        kind: "audio",
                        sourceUrl: objectURL,
                        attachment: newAttachment,
                        artist: "",
                        title: "",
                    });

                    return;
                }
            }
        },
        updateAttachmentDimensions(
            state,
            action: PayloadAction<{
                nodeId: NodeId;
                width: number;
                height: number;
            }>
        ) {
            const node = state.body.nodes[action.payload.nodeId];

            if (node.type !== "image-attachment") {
                throw new Error("expected image attachment node");
            }

            state.body.nodes[action.payload.nodeId] = {
                ...node,
                width: action.payload.width,
                height: action.payload.height,
            };
        },
        moveAttachmentToNewRow(
            state,
            action: PayloadAction<{
                attachmentNodeId: NodeId;
                relativeNodeId: NodeId;
                position: "before" | "after";
            }>
        ) {
            const { attachmentNodeId, relativeNodeId, position } =
                action.payload;

            const node = state.body.nodes[attachmentNodeId];

            if (node.type === "image-attachment") {
                // image attachment flow, we need attachment rows here.
                const currentRowNodeId = findAttachmentRowContainingAttachment(
                    attachmentNodeId,
                    state.body.nodes
                );

                if (currentRowNodeId === null) {
                    throw new Error("attachment not in a row");
                }

                // create new row
                const newRow: AttachmentRowNode = {
                    type: "attachment-row",
                    attachments: [attachmentNodeId],
                    nodeId: generateNodeId(),
                };

                // find where we're putting it
                const relativeNodeIndex =
                    state.body.nodeOrder.indexOf(relativeNodeId);
                const insertionIndex =
                    position === "before"
                        ? relativeNodeIndex
                        : relativeNodeIndex + 1;

                // insert the new row
                state.body.nodeOrder.splice(insertionIndex, 0, newRow.nodeId);
                state.body.nodes[newRow.nodeId] = newRow;

                // remove the attachment from its current row
                const currentRow = state.body.nodes[currentRowNodeId];
                if (!currentRow || currentRow.type !== "attachment-row") {
                    throw new Error("attachment not in a row");
                }
                currentRow.attachments = currentRow.attachments.filter(
                    (id) => id !== attachmentNodeId
                );
                if (currentRow.attachments.length === 0) {
                    // row is now empty, remove it from the tree
                    state.body.nodeOrder = state.body.nodeOrder.filter(
                        (id) => id !== currentRowNodeId
                    );
                    delete state.body.nodes[currentRowNodeId];
                }
            } else {
                // find where it currently is
                const currentNodeIndex =
                    state.body.nodeOrder.indexOf(attachmentNodeId);

                // find where we're putting it
                const relativeNodeIndex =
                    state.body.nodeOrder.indexOf(relativeNodeId);
                const newIndex =
                    position === "before"
                        ? relativeNodeIndex
                        : relativeNodeIndex + 1;

                state.body.nodeOrder = reorder({
                    list: state.body.nodeOrder,
                    startIndex: currentNodeIndex,
                    finishIndex: newIndex,
                });
            }

            // finish up
            state.dirty = true;
        },
        moveAttachmentToExistingRow(
            state,
            action: PayloadAction<{
                attachmentNodeId: NodeId;
                rowNodeId: NodeId;
                positionInRow: number;
            }>
        ) {
            const { attachmentNodeId, rowNodeId, positionInRow } =
                action.payload;
            const currentRowNodeId = findAttachmentRowContainingAttachment(
                attachmentNodeId,
                state.body.nodes
            );

            if (currentRowNodeId === null) {
                throw new Error("attachment not in a row");
            }

            if (currentRowNodeId !== rowNodeId) {
                // remove it from its current row
                const currentRow = state.body.nodes[currentRowNodeId];
                if (!currentRow || currentRow.type !== "attachment-row") {
                    throw new Error("attachment not in a row");
                }
                currentRow.attachments = currentRow.attachments.filter(
                    (id) => id !== attachmentNodeId
                );
                if (currentRow.attachments.length === 0) {
                    // row is now empty, remove it from the tree
                    state.body.nodeOrder = state.body.nodeOrder.filter(
                        (id) => id !== currentRowNodeId
                    );
                    delete state.body.nodes[currentRowNodeId];
                }
                // add to the new row
                const newRow = state.body.nodes[rowNodeId];
                if (!newRow || newRow.type !== "attachment-row") {
                    throw new Error("attachment not in a row");
                }
                newRow.attachments.splice(positionInRow, 0, attachmentNodeId);
            } else {
                // same row, just rearrange
                const currentRow = state.body.nodes[currentRowNodeId];
                if (!currentRow || currentRow.type !== "attachment-row") {
                    throw new Error("attachment not in a row");
                }

                const reordered = reorder({
                    list: currentRow.attachments,
                    startIndex:
                        currentRow.attachments.indexOf(attachmentNodeId),
                    finishIndex: positionInRow,
                });
                currentRow.attachments = reordered;
            }

            state.dirty = true;
        },
        deleteNodeAtIndex(state, action: PayloadAction<NodeId>) {
            const node = state.body.nodes[action.payload];
            if (node.type === "attachment-row") {
                if (node.attachments.length > 0) return;
            } else if (isAttachmentNode(node)) {
                // check if it's in the node order. if not, we need to find the
                // row it's in and remove from there.
                if (!state.body.nodeOrder.includes(action.payload)) {
                    for (const rowId of state.body.nodeOrder) {
                        const row = state.body.nodes[rowId];
                        if (
                            row.type === "attachment-row" &&
                            row.attachments.includes(action.payload)
                        ) {
                            row.attachments = row.attachments.filter(
                                (attachmentId) =>
                                    attachmentId !== action.payload
                            );
                            break;
                        }
                    }
                }
            }
            state.body.nodeOrder = state.body.nodeOrder.filter(
                (nodeId) => nodeId !== action.payload
            );
            delete state.body.nodes[action.payload];
            state.dirty = true;
        },
        insertTextNodeAtEnd(state) {
            const emptyTextNode: TextNode = {
                type: "text",
                text: "",
                nodeId: generateNodeId(),
            };

            state.body.nodes[emptyTextNode.nodeId] = emptyTextNode;
            state.body.nodeOrder.push(emptyTextNode.nodeId);
            state.dirty = true;
        },
        setActiveProject(state, action: PayloadAction<ProjectHandle>) {
            state.projectHandle = action.payload;
        },
        setAdultContent(state, action: PayloadAction<boolean>) {
            state.adultContent = action.payload;
        },
        setCws(state, action: PayloadAction<string[]>) {
            state.cws = action.payload;
            state.dirty = true;
        },
        setHeadline(state, action: PayloadAction<string>) {
            state.headline = action.payload.replace("\n", " ").slice(0, 140);
            state.dirty = true;
        },
        setNewPostState(state, action: PayloadAction<PostState>) {
            state.newPostState = action.payload;
            state.dirty = true;
        },
        setTags(state, action: PayloadAction<string[]>) {
            state.tags = action.payload;
            state.dirty = true;
        },
        toggleCwsInputOpen(state) {
            // if there's already text input then you can't disable CWs
            if (state.cws.length > 0) state.cwsInputOpen = true;
            state.cwsInputOpen = !state.cwsInputOpen;
        },
        abandon() {
            return { ...initialState };
        },
        mergeTextNodes(
            state,
            action: PayloadAction<{
                firstNodeId: NodeId;
            }>
        ) {
            const { firstNodeId } = action.payload;
            const nodeOrder = state.body.nodeOrder;
            const firstNodeIndex = nodeOrder.indexOf(firstNodeId);
            const secondNodeIndex = firstNodeIndex + 1;

            if (secondNodeIndex >= nodeOrder.length) {
                // nothing to do here
                return;
            }

            const firstNode = state.body.nodes[firstNodeId];
            const secondNode = state.body.nodes[nodeOrder[secondNodeIndex]];

            if (firstNode.type !== "text" || secondNode.type !== "text") {
                // nothing to do here
                return;
            }

            if (secondNode.text.trim().length === 0) {
                // we have an empty node, just remove it and move on.
                state.body.nodeOrder.splice(secondNodeIndex, 1);
                delete state.body.nodes[secondNode.nodeId];
                return;
            }

            // merge the text
            firstNode.text += "\n\n" + secondNode.text;

            // remove the second node
            state.body.nodeOrder.splice(secondNodeIndex, 1);
            delete state.body.nodes[secondNode.nodeId];
        },
        splitTextNodeAndInsertAttachment(
            state,
            action: PayloadAction<{
                textNodeId: NodeId;
                attachmentNodeId: NodeId;
                splitBlockIndex: number;
            }>
        ) {
            const { textNodeId, attachmentNodeId, splitBlockIndex } =
                action.payload;
            const textNode = state.body.nodes[textNodeId];
            const attachmentNode = state.body.nodes[attachmentNodeId];

            if (textNode.type !== "text") {
                throw new Error("can't split non-text node");
            }

            if (!isAttachmentNode(attachmentNode)) {
                throw new Error("can't split with non-attachment node");
            }

            // get the text blocks
            const blocks = textNode.text
                .trim()
                .split("\n\n")
                .map((text) => text.trim());

            const beforeBlocks = blocks.slice(0, splitBlockIndex);
            const afterBlocks = blocks.slice(splitBlockIndex);

            // update the text node
            textNode.text = beforeBlocks.join("\n\n");

            // create the new text node
            const newText: TextNode = {
                type: "text",
                text: afterBlocks.join("\n\n"),
                nodeId: generateNodeId(),
            };

            // images are in rows
            if (attachmentNode.type === "image-attachment") {
                // create the attachment row node
                const newRow: AttachmentRowNode = {
                    type: "attachment-row",
                    attachments: [attachmentNodeId],
                    nodeId: generateNodeId(),
                };

                // remove the attachment from its old row
                const oldRowId = findAttachmentRowContainingAttachment(
                    attachmentNodeId,
                    state.body.nodes
                );
                if (oldRowId) {
                    const oldRow = state.body.nodes[oldRowId];
                    if (oldRow.type === "attachment-row") {
                        oldRow.attachments = oldRow.attachments.filter(
                            (id) => id !== attachmentNodeId
                        );

                        // remove it if it's empty
                        if (oldRow.attachments.length === 0) {
                            state.body.nodeOrder = state.body.nodeOrder.filter(
                                (id) => id !== oldRowId
                            );
                            delete state.body.nodes[oldRowId];
                        }
                    }
                }

                // insert the new nodes
                state.body.nodes[newRow.nodeId] = newRow;

                state.body.nodeOrder.splice(
                    state.body.nodeOrder.indexOf(textNodeId) + 1,
                    0,
                    newRow.nodeId,
                    newText.nodeId
                );
            } else {
                // audio attachments are just in the body. remove from its old position and move it to the new one.
                state.body.nodeOrder = state.body.nodeOrder.filter(
                    (id) => id !== attachmentNodeId
                );

                state.body.nodeOrder.splice(
                    state.body.nodeOrder.indexOf(textNodeId) + 1,
                    0,
                    attachmentNodeId,
                    newText.nodeId
                );
            }

            state.body.nodes[newText.nodeId] = newText;

            state.dirty = true;
        },
    }),
    extraReducers: (builder) => {
        builder.addCase(submit.pending, (state) => {
            state.state = "uploading";
        });

        builder.addCase(submit.rejected, (state, action) => {
            if (action.payload) {
                state.validationErrors["app"] = action.payload;
            }
            state.state = "editing";
        });

        builder.addCase(submit.fulfilled, (state) => {
            state.state = "editing";
            state.dirty = false;
        });

        builder.addCase(submitCreatePost.rejected, (state, action) => {
            if (action.payload) {
                state.validationErrors["app"] = action.payload;
            }
            state.state = "failed";
        });

        builder.addCase(submitCreatePost.fulfilled, (state, action) => {
            state.postId = action.payload.postId;
            state.state = action.payload.nextPostEditorState;
        });

        builder.addCase(submitUploadAttachment.rejected, (state, action) => {
            if (action.payload) {
                state.validationErrors["app"] = action.payload;
            }
            state.state = "failed";
        });

        builder.addCase(submitUploadAttachment.fulfilled, (state, action) => {
            const nodeId = action.meta.arg.nodeId;
            // we've already successfully uploaded this region as an attachment,
            // so just assume that it's an attachment node
            const node = state.body.nodes[nodeId] as AttachmentEditorNode;

            state.body.nodes[nodeId] = {
                ...node,
                attachment: {
                    ...node.attachment,
                    attachmentId: action.payload.attachmentId,
                    state: AttachmentState.Finished,
                    uploadState: "finished",
                },
            };
        });

        builder.addCase(submitUpdatePost.rejected, (state, action) => {
            if (action.payload) {
                state.validationErrors["app"] = action.payload;
            }
            state.state = "failed";
        });

        builder.addCase(submitUpdatePost.fulfilled, (state) => {
            state.state = "finished";
        });

        startAppListening({
            actionCreator: submitUploadAttachment.fulfilled,
            effect: (action, listenerApi) => {
                const state = listenerApi.getState().postComposer;
                const attachmentsToUpload =
                    selectAttachmentNodeIdsToUpload(state);

                if (attachmentsToUpload.length == 0) {
                    // we're done uploading attachments; update the post
                    void listenerApi.dispatch(submitUpdatePost());
                }
            },
        });

        // cleanup empty attachment rows
        startAppListening({
            predicate: (action, state) =>
                Object.values(state.postComposer.body.nodes).some(
                    (node) =>
                        node.type === "attachment-row" &&
                        node.attachments.length === 0
                ),
            effect: (action, listenerApi) => {
                const state = listenerApi.getState().postComposer;
                const emptyRowIds = Object.values(state.body.nodes)
                    .filter(
                        (node) =>
                            node.type === "attachment-row" &&
                            node.attachments.length === 0
                    )
                    .map((node) => node.nodeId);

                emptyRowIds.forEach((rowId) =>
                    listenerApi.dispatch(deleteNodeAtIndex(rowId))
                );
            },
        });

        // merge text nodes
        startAppListening({
            predicate: (action, state) => {
                // check for adjacent text nodes
                const nodeOrder = state.postComposer.body.nodeOrder;
                return nodeOrder.some((nodeId, index) => {
                    if (index === nodeOrder.length - 1) return false;

                    const node = state.postComposer.body.nodes[nodeId];
                    const nextNode =
                        state.postComposer.body.nodes[nodeOrder[index + 1]];

                    return node.type === "text" && nextNode.type === "text";
                });
            },
            effect: (action, listenerApi) => {
                const state = listenerApi.getState().postComposer;
                const nodeOrder = state.body.nodeOrder;
                const firstNodeId = nodeOrder.find((nodeId, index) => {
                    if (index === nodeOrder.length - 1) return false;

                    const node = state.body.nodes[nodeId];
                    const nextNode = state.body.nodes[nodeOrder[index + 1]];

                    return node.type === "text" && nextNode.type === "text";
                });

                if (firstNodeId) {
                    listenerApi.dispatch(mergeTextNodes({ firstNodeId }));
                }
            },
        });

        // make sure we always have a text node at the end
        startAppListening({
            predicate: (action, state) => {
                const lastNode =
                    state.postComposer.body.nodes[
                        state.postComposer.body.nodeOrder[
                            state.postComposer.body.nodeOrder.length - 1
                        ]
                    ];
                if (!lastNode) return false;

                return lastNode.type !== "text";
            },
            effect: (action, listenerApi) => {
                listenerApi.dispatch(insertTextNodeAtEnd());
            },
        });

        // update image dimensions
        startAppListening({
            actionCreator: insertFile,
            effect: async (action, listenerApi) => {
                listenerApi.cancelActiveListeners();

                const state = listenerApi.getState().postComposer;

                // get image attachments with empty dimensions
                const attachments = Object.values(state.body.nodes).filter(
                    (node) =>
                        node.type === "image-attachment" &&
                        (!node.width || !node.height)
                ) as ImageAttachmentNode[];
                await Promise.all(
                    attachments.map(async (attachment) => {
                        if (!attachment.attachment.uploadData?.objectURL) {
                            return;
                        }
                        const dimensions = await getImageDimensions(
                            attachment.attachment.uploadData?.objectURL
                        );
                        listenerApi.dispatch(
                            updateAttachmentDimensions({
                                nodeId: attachment.nodeId,
                                width: dimensions.width,
                                height: dimensions.height,
                            })
                        );
                    })
                );
            },
        });
    },
    selectors: {
        selectAdultContent: (state) => state.adultContent,
        selectAttachmentNodeIdsToUpload,
        selectBody: (state) => state.body,
        selectCreatingTransparentShare: (state) => {
            const { blocks } = _selectRenderedPost(state);

            return !!state.shareOfPostId && !state.headline && !blocks.length;
        },
        selectCws: (state) => state.cws,
        selectCwsButtonEnabled: (state) =>
            !state.cwsInputOpen || state.cws.length == 0,
        selectCwsInputOpen: (state) => state.cwsInputOpen,
        selectDirty: (state) => state.dirty,
        selectEditingTransparentShare: (state) => state.editingTransparentShare,
        selectErrors: (state) =>
            _.size(state.validationErrors) > 0
                ? _.values(state.validationErrors)
                : EMPTY_ARRAY,
        selectHasErrors: (state) => _.size(state.validationErrors) > 0,
        selectHasPosted: (state) => state.state === "finished",
        selectHeadline: (state) => state.headline,
        selectIsEditing: (state) => state.state === "editing",
        selectMaxAttachmentsChosen: (state) =>
            _.filter(state.body.nodes, (node) => isAttachmentNode(node))
                .length >= state.maximumAllowedAttachments,
        selectNewPostState: (state) => state.newPostState,
        selectPostId: (state) => state.postId,
        selectProjectHandle: (state) => state.projectHandle,
        selectRenderedPost: _selectRenderedPost,
        selectShareOfPostId: (state) => state.shareOfPostId,
        selectTags: (state) => state.tags,
    },
});

export const {
    initForNewPost,
    initForEditing,
    deleteNodeAtIndex,
    insertFile,
    insertNewTextAtSelection,
    moveAttachmentToExistingRow,
    setActiveProject,
    setAdultContent,
    setCws,
    setHeadline,
    setNewPostState,
    setTags,
    toggleCwsInputOpen,
    updateAudioMetadata,
    updateImageAltText,
    updateTextRegion,
    abandon,
    moveAttachmentToNewRow,
    insertTextNodeAtEnd,
    mergeTextNodes,
    splitTextNodeAndInsertAttachment,
    updateAttachmentDimensions,
} = postComposerSlice.actions;
export const {
    selectAdultContent,
    selectBody,
    selectCreatingTransparentShare,
    selectCws,
    selectCwsButtonEnabled,
    selectCwsInputOpen,
    selectDirty,
    selectEditingTransparentShare,
    selectErrors,
    selectHasErrors,
    selectHasPosted,
    selectHeadline,
    selectIsEditing,
    selectMaxAttachmentsChosen,
    selectNewPostState,
    selectPostId,
    selectProjectHandle,
    selectRenderedPost,
    selectShareOfPostId,
    selectTags,
} = postComposerSlice.selectors;
export default postComposerSlice.reducer;
