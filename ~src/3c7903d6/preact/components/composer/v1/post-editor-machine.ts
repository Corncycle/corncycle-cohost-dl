import * as PostsV1Types from "@/shared/api-types/posts-v1";
import { AttachmentKind, AttachmentState } from "@/shared/types/attachments";
import { AskId, AttachmentId, PostId, ProjectHandle } from "@/shared/types/ids";
import {
    AttachmentStorageBlock,
    MarkdownStorageBlock,
    StorageBlock,
} from "@/shared/types/post-blocks";
import { PostState } from "@/shared/types/posts";
import {
    defaultConfig,
    isValidAttachmentContentType,
    SiteConfigType,
} from "@/shared/util/site-config";
import axios from "axios";
import * as uuid from "uuid";
import isEmpty from "validator/lib/isEmpty";
import { assign, createMachine, DoneInvokeEvent } from "xstate";
import { getVanillaClient } from "../../../../lib/trpc-vanilla";

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

type AttachmentMetadata =
    | {
          kind: "audio";
          metadata: {
              artist?: string;
              title?: string;
          };
      }
    | {
          kind: "image";
          metadata: {
              altText?: string;
              width: number;
              height: number;
          };
      };

export type Attachment = {
    attachmentId?: AttachmentId;
    kind: AttachmentKind;
    file?: File;
    state: AttachmentState;
    uploadUrl?: string;
    requiredFields?: { [key: string]: string };
    src?: string;
} & AttachmentMetadata;

export interface PostEditorContext {
    projectHandle: ProjectHandle;
    hasCohostPlus: boolean;
    sizeLimits: SiteConfigType["limits"]["attachmentSize"];
    postId?: PostId;
    headline: string;
    attachments: Attachment[];
    validationErrors: Map<string, string>;
    markdownBlocks: MarkdownStorageBlock[];
    shareOfPostId: PostId | null;
    responseToAskId: AskId | null;
    currentPostState?: PostState;
    newPostState: PostState;
    adultContent: boolean;
    maximumAllowedAttachments: number;
    tags: string[];
    cws: string[];
    editingCws: boolean;
    isActivated: boolean;
    dirty: boolean;
    editingTransparentShare: boolean;
}

type PostEditorEvent =
    | { type: "HEADLINE_INPUT"; headline: string }
    | { type: "SUBMIT_POST" }
    | { type: "SELECT_FILE"; file: File }
    | { type: "BODY_INPUT"; body: string }
    | { type: "SET_ADULT_CONTENT"; adultContent: boolean }
    | { type: "SET_POST_STATE"; newPostState: PostState }
    | { type: "REMOVE_ATTACHMENT"; index: number }
    | { type: "TAGS_INPUT"; tags: string[] }
    | { type: "CWS_INPUT"; cws: string[] }
    | { type: "CHANGE_PROJECT"; projectHandle: ProjectHandle }
    | { type: "TOGGLE_CWS_INPUT" }
    | { type: "ALT_TEXT_INPUT"; input: string; index: number }
    | {
          type: "AUDIO_METADATA_INPUT";
          title: string;
          artist: string;
          index: number;
      };

interface ValidationError {
    fieldName: string;
    error: string;
}

export const postEditorMachine = createMachine<
    PostEditorContext,
    PostEditorEvent
>(
    {
        context: {
            // we need to have a value set for projecthandle
            // state so we deliberately set invalid ones since it'll be
            // overwritten in the post composer.
            projectHandle: "" as ProjectHandle,
            isActivated: false,
            hasCohostPlus: false,
            sizeLimits: defaultConfig.limits.attachmentSize,
            currentPostState: undefined,
            headline: "",
            attachments: [],
            validationErrors: new Map<string, string>(),
            markdownBlocks: [],
            newPostState: PostState.Published,
            shareOfPostId: null,
            responseToAskId: null,
            adultContent: false,
            maximumAllowedAttachments: 4,
            tags: [],
            cws: [],
            editingCws: false,
            dirty: false,
            editingTransparentShare: false,
        },
        initial: "launching",
        id: "editor",
        states: {
            launching: {
                invoke: {
                    src: "verifyInitialContext",
                    onDone: [
                        {
                            // assign generated state
                            actions: assign<
                                PostEditorContext,
                                DoneInvokeEvent<{ editingCws: boolean }>
                            >({
                                editingCws: (context, event) =>
                                    event.data.editingCws,
                            }),
                            target: "editing",
                        },
                    ],
                    onError: [
                        {
                            actions: assign<
                                PostEditorContext,
                                DoneInvokeEvent<{ errors: string[] }>
                            >({
                                validationErrors: (context, event) =>
                                    (context.validationErrors =
                                        context.validationErrors.set(
                                            "app",
                                            `FAILED INITIAL CONTEXT CHECK: ${event.data.errors.join(
                                                ", "
                                            )}`
                                        )),
                            }),
                            target: "unrecoverable",
                        },
                    ],
                },
            },
            editing: {
                type: "parallel",
                states: {
                    headline: {
                        initial: "typing",
                        states: {
                            typing: {
                                on: {
                                    HEADLINE_INPUT: {
                                        actions: ["assignHeadline"],
                                    },
                                },
                            },
                        },
                    },
                    body: {
                        initial: "typing",
                        states: {
                            typing: {
                                on: {
                                    BODY_INPUT: {
                                        target: "typing",
                                        actions: assign({
                                            markdownBlocks: (context, event) =>
                                                (context.markdownBlocks =
                                                    event.body
                                                        .split("\n\n")
                                                        .map<MarkdownStorageBlock>(
                                                            (p) => ({
                                                                type: "markdown",
                                                                markdown: {
                                                                    content: p,
                                                                },
                                                            })
                                                        )),
                                            dirty: (context) =>
                                                (context.dirty = true),
                                        }),
                                    },
                                },
                            },
                        },
                    },
                    attachments: {
                        initial: "waitingForSelection",
                        states: {
                            waitingForSelection: {
                                always: {
                                    cond: "maximumFilesSelected",
                                    target: "waitingForUpload",
                                },
                                on: {
                                    SELECT_FILE: {
                                        target: "validatingAttachment",
                                    },
                                    REMOVE_ATTACHMENT: {
                                        actions: "removeAttachment",
                                    },
                                },
                            },
                            validatingAttachment: {
                                invoke: {
                                    src: "validateAttachments",
                                    onDone: [
                                        {
                                            actions: assign({
                                                attachments: (
                                                    context,
                                                    event: DoneInvokeEvent<
                                                        {
                                                            file: File;
                                                        } & AttachmentMetadata
                                                    >
                                                ) => {
                                                    return [
                                                        ...context.attachments,
                                                        {
                                                            ...event.data,
                                                            state: AttachmentState.Pending,
                                                        },
                                                    ];
                                                },
                                                validationErrors: (context) =>
                                                    context.validationErrors.delete(
                                                        "attachments"
                                                    )
                                                        ? context.validationErrors
                                                        : context.validationErrors,
                                                dirty: (context) =>
                                                    (context.dirty = true),
                                            }),
                                            target: "waitingForSelection",
                                        },
                                    ],
                                    onError: [
                                        {
                                            actions: assign({
                                                validationErrors: (
                                                    context,
                                                    event: DoneInvokeEvent<{
                                                        error: string;
                                                    }>
                                                ) =>
                                                    context.validationErrors.set(
                                                        "attachments",
                                                        event.data.error
                                                    ),
                                            }),
                                            target: "waitingForSelection",
                                        },
                                    ],
                                },
                            },
                            waitingForUpload: {
                                on: {
                                    REMOVE_ATTACHMENT: {
                                        actions: "removeAttachment",
                                        target: "waitingForSelection",
                                    },
                                },
                            },
                        },
                    },
                    postState: {
                        initial: "waiting",
                        states: {
                            waiting: {
                                on: {
                                    SET_POST_STATE: {
                                        actions: assign({
                                            newPostState: (context, event) =>
                                                (context.newPostState =
                                                    event.newPostState),
                                            dirty: (context) =>
                                                (context.dirty = true),
                                        }),
                                    },
                                },
                            },
                        },
                    },
                    adultContent: {
                        initial: "waiting",
                        states: {
                            waiting: {
                                on: {
                                    SET_ADULT_CONTENT: {
                                        actions: assign({
                                            adultContent: (context, event) =>
                                                (context.adultContent =
                                                    event.adultContent),
                                            dirty: (context) =>
                                                (context.dirty = true),
                                        }),
                                    },
                                },
                            },
                        },
                    },
                    tags: {
                        initial: "waiting",
                        states: {
                            waiting: {
                                on: {
                                    TAGS_INPUT: {
                                        actions: assign({
                                            tags: (context, event) =>
                                                (context.tags = event.tags),
                                            dirty: (context) =>
                                                (context.dirty = true),
                                        }),
                                    },
                                },
                            },
                        },
                    },
                    cws: {
                        initial: "waiting",
                        states: {
                            waiting: {
                                on: {
                                    CWS_INPUT: {
                                        actions: assign({
                                            cws: (context, event) =>
                                                (context.cws = event.cws),
                                            dirty: (context) =>
                                                (context.dirty = true),
                                        }),
                                    },
                                },
                            },
                        },
                    },
                    altText: {
                        initial: "typing",
                        states: {
                            typing: {
                                on: {
                                    ALT_TEXT_INPUT: {
                                        actions: assign({
                                            attachments: (context, event) => {
                                                const attachment =
                                                    context.attachments[
                                                        event.index
                                                    ];

                                                if (
                                                    attachment.kind !== "image"
                                                ) {
                                                    console.error(
                                                        "editing alt text on non-image attachment?"
                                                    );
                                                    return context.attachments;
                                                }

                                                return [
                                                    ...context.attachments.slice(
                                                        0,
                                                        event.index
                                                    ),
                                                    {
                                                        ...attachment,
                                                        metadata: {
                                                            ...attachment.metadata,
                                                            altText:
                                                                event.input,
                                                        },
                                                    },
                                                    ...context.attachments.slice(
                                                        event.index + 1
                                                    ),
                                                ];
                                            },
                                            dirty: (context) =>
                                                (context.dirty = true),
                                        }),
                                    },
                                },
                            },
                        },
                    },
                    audioMetadata: {
                        initial: "typing",
                        states: {
                            typing: {
                                on: {
                                    AUDIO_METADATA_INPUT: {
                                        actions: assign({
                                            attachments: (context, event) => {
                                                const attachment =
                                                    context.attachments[
                                                        event.index
                                                    ];

                                                if (
                                                    attachment.kind !== "audio"
                                                ) {
                                                    console.error(
                                                        "editing metadata on non-audio attachment?"
                                                    );
                                                    return context.attachments;
                                                }

                                                attachment.metadata = {
                                                    title: event.title,
                                                    artist: event.artist,
                                                };

                                                return [
                                                    ...context.attachments.slice(
                                                        0,
                                                        event.index
                                                    ),
                                                    attachment,
                                                    ...context.attachments.slice(
                                                        event.index + 1
                                                    ),
                                                ];
                                            },
                                        }),
                                    },
                                },
                            },
                        },
                    },
                },
                on: {
                    SUBMIT_POST: {
                        target: "validating",
                    },
                    CHANGE_PROJECT: {
                        actions: assign({
                            projectHandle: (context, event) =>
                                (context.projectHandle = event.projectHandle),
                        }),
                    },
                    TOGGLE_CWS_INPUT: {
                        actions: assign({
                            editingCws: (context) => {
                                // if there's already text input then you can't disable CWs
                                if (context.cws.length > 0) return true;
                                return !context.editingCws;
                            },
                        }),
                    },
                },
            },
            validating: {
                invoke: {
                    src: "validatePost",
                    onDone: [
                        {
                            target: "posting",
                            actions: assign({
                                dirty: (context) => (context.dirty = false),
                            }),
                        },
                    ],
                    onError: [
                        {
                            actions: assign<
                                PostEditorContext,
                                DoneInvokeEvent<string>
                            >({
                                validationErrors: (context, event) =>
                                    (context.validationErrors =
                                        context.validationErrors.set(
                                            "app",
                                            event.data
                                        )),
                            }),
                            target: "editing",
                        },
                    ],
                },
            },
            posting: {
                initial: "startingUpload",
                states: {
                    startingUpload: {
                        always: [
                            {
                                cond: "hasPostId",
                                target: "maybeUploadingAttachments",
                            },
                            {
                                target: "creatingPost",
                            },
                        ],
                    },
                    creatingPost: {
                        invoke: {
                            src: "createPost",
                            onDone: [
                                {
                                    actions: assign<
                                        PostEditorContext,
                                        DoneInvokeEvent<PostId>
                                    >({
                                        postId: (context, event) =>
                                            (context.postId = event.data),
                                    }),
                                    target: "maybeUploadingAttachments",
                                },
                            ],
                        },
                    },
                    maybeUploadingAttachments: {
                        always: [
                            {
                                cond: "hasPendingAttachments",
                                target: "uploadingAttachments",
                            },
                            {
                                cond: "isNewPost",
                                target: "#editor.posted",
                            },
                            {
                                target: "updatingPost",
                            },
                        ],
                    },
                    uploadingAttachments: {
                        initial: "startingAttachments",
                        states: {
                            startingAttachments: {
                                invoke: {
                                    src: "createAttachments",
                                    onDone: [
                                        {
                                            actions:
                                                "assignAttachmentUploadData",
                                            target: "uploadingFiles",
                                        },
                                    ],
                                },
                            },
                            uploadingFiles: {
                                invoke: {
                                    src: "uploadFiles",
                                    onDone: [
                                        {
                                            target: "finishingAttachments",
                                        },
                                    ],
                                },
                            },
                            finishingAttachments: {
                                invoke: {
                                    src: "finishAttachments",
                                    onDone: [
                                        {
                                            actions: assign<
                                                PostEditorContext,
                                                DoneInvokeEvent<
                                                    PostsV1Types.FinishAttachmentResp[]
                                                >
                                            >({
                                                attachments: (context, event) =>
                                                    (context.attachments =
                                                        context.attachments.map<Attachment>(
                                                            (
                                                                attachment,
                                                                i
                                                            ) => ({
                                                                ...attachment,
                                                                state: AttachmentState.Finished,
                                                                src: event.data[
                                                                    i
                                                                ].url,
                                                            })
                                                        )),
                                            }),
                                            target: "#editor.posting.updatingPost",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    updatingPost: {
                        invoke: {
                            src: "updatePost",
                            onDone: [
                                {
                                    target: "#editor.posted",
                                },
                            ],
                            onError: [
                                {
                                    target: "#editor.postingFailed",
                                },
                            ],
                        },
                    },
                },
            },
            posted: {},
            postingFailed: {},
            unrecoverable: {
                type: "final",
            },
        },
    },
    {
        guards: {
            hasPostId: (context) => !!context.postId,
            hasPendingAttachments: ({ attachments }) =>
                attachments.some(
                    (attachment) => attachment.state == AttachmentState.Pending
                ),
            maximumFilesSelected: ({
                attachments,
                maximumAllowedAttachments,
            }) => attachments.length >= maximumAllowedAttachments,
            shouldUpdatePostState: ({ currentPostState, newPostState }) =>
                currentPostState !== newPostState,
            isNewPost: ({ currentPostState }) => currentPostState === undefined,
        },
        services: {
            /**
             * Check to make sure our initial boot context is correct.
             * `projectHandle` is mandatory for the editor to function
             * but is dependent on the runtime context and thus can't be set
             * by default.
             * @param context
             * @returns
             */
            verifyInitialContext: (context) => {
                const errors: string[] = [];

                if (!context.projectHandle) {
                    errors.push("MISSING PROJECT HANDLE");
                }

                if (errors.length > 0) {
                    return Promise.reject({
                        errors,
                    });
                }

                // generated context
                return Promise.resolve({
                    // display the CW edit field by default iff
                    // the initial context has one or more content warnings
                    // set
                    editingCws: context.cws.length > 0,
                });
            },
            /**
             * Check to see if any validation errors are currently set,
             * if so reject to block upload.
             * @param param0
             * @returns
             */
            validatePost: (context) => {
                // filter out the markdown blocks without any content
                const contentfulBlocks = context.markdownBlocks.filter(
                    (block) => block.markdown.content.trim().length > 0
                );

                const anyContent =
                    !isEmpty(context.headline) ||
                    contentfulBlocks.length > 0 ||
                    context.attachments.length > 0 ||
                    context.shareOfPostId;
                const anyBrokenAttachments = !!context.attachments.find(
                    (at) =>
                        // allow for NIL uuid for non-uploaded attachments to avoid zod parsing issues
                        at.state !== AttachmentState.Pending &&
                        at.attachmentId === uuid.NIL
                );

                if (anyBrokenAttachments) {
                    // t("client:post-editor.broken-attachment", "at least one of the attachments on this post failed to upload.  please remove it and try attaching it again.")
                    return Promise.reject(
                        "client:post-editor.broken-attachment"
                    );
                }

                if (!anyContent) {
                    // t("client:post-editor.must-contain-content", "must contain a headline, any body content, or any attachment")
                    return Promise.reject(
                        "client:post-editor.must-contain-content"
                    );
                }
                return Promise.resolve();
            },
            validateAttachments: async (context, event) => {
                if (event.type !== "SELECT_FILE") {
                    return Promise.reject({
                        error: `Tried to validate attachments with invalid event ${event.type}`,
                    });
                }

                const effectiveLimit = context.hasCohostPlus
                    ? context.sizeLimits.cohostPlus
                    : context.sizeLimits.normal;

                const file = event.file;

                const validityResult = isValidAttachmentContentType(
                    defaultConfig,
                    file.type
                );

                if (!validityResult.valid) {
                    // t("client:post-editor.attachment-must-be-image", "one or more attachments is not of a supported file type!")
                    return Promise.reject({
                        error: "client:post-editor.attachment-must-be-image",
                    });
                }

                if (file.size > effectiveLimit) {
                    // TODO: figure out how to get the interpolation to work
                    // here since we're just passing the key.
                    // t("client:post-editor.attachment-too-large", "attachments must be less than 5mb!")
                    // t("client:post-editor.attachment-too-large-cohost-plus", "attachments must be less than 10mb!")
                    const key = context.hasCohostPlus
                        ? "client:post-editor.attachment-too-large-cohost-plus"
                        : "client:post-editor.attachment-too-large";
                    return Promise.reject({
                        error: key,
                    });
                }

                switch (validityResult.kind) {
                    case "image": {
                        let dimensions = { width: 0, height: 0 };

                        try {
                            dimensions = await getImageDimensions(
                                URL.createObjectURL(file)
                            );
                        } catch (e) {
                            // nothing to do here
                        }

                        return Promise.resolve({
                            file,
                            kind: "image",
                            metadata: {
                                altText: "",
                                ...dimensions,
                            },
                        });
                    }
                    case "audio": {
                        return Promise.resolve({
                            file,
                            kind: "audio",
                            metadata: {
                                artist: "",
                                title: "",
                            },
                        });
                    }
                }
            },
            createPost: async (context) => {
                let effectiveState = PostState.Unpublished;

                // if we don't have any attachments to upload we can go straight to the True State
                if (
                    !context.attachments.some(
                        (attachment) =>
                            attachment.state === AttachmentState.Pending
                    )
                ) {
                    effectiveState = context.newPostState;
                }

                const blocks: StorageBlock[] = [];
                // FIXME: between here and post upload completing successfully,
                // the post contains a broken attachment block with no attachment
                // ID; we should figure out a more elegant way to do this
                blocks.push(
                    ...context.attachments.map<AttachmentStorageBlock>(
                        (attachment) => ({
                            type: "attachment",
                            attachment: {
                                attachmentId:
                                    attachment.attachmentId ??
                                    (uuid.NIL as AttachmentId),
                                altText:
                                    attachment.kind === "image"
                                        ? attachment.metadata.altText
                                        : undefined,
                            },
                        })
                    )
                );
                blocks.push(
                    ...context.markdownBlocks
                        .map<MarkdownStorageBlock>((block) => ({
                            ...block,
                            markdown: {
                                content: block.markdown.content,
                            },
                        }))
                        .filter((block) => !!block.markdown.content)
                );
                const body: PostsV1Types.CreatePostReq = {
                    postState: effectiveState,
                    headline: context.headline,
                    adultContent: context.adultContent,
                    blocks,
                    cws: context.cws
                        .filter((cw) => cw.length > 0)
                        .map((cw) => cw.trim()),
                    tags: context.tags
                        .filter((tag) => tag.length > 0)
                        .map((tag) => tag.trim()),
                    shareOfPostId:
                        context.shareOfPostId && !isNaN(context.shareOfPostId)
                            ? context.shareOfPostId
                            : undefined,
                    responseToAskId: context.responseToAskId
                        ? context.responseToAskId
                        : undefined,
                };

                const trpcClient = getVanillaClient();
                const { postId } = await trpcClient.posts.create.mutate({
                    projectHandle: context.projectHandle,
                    content: body,
                });

                return postId;
            },
            createAttachments: ({ attachments, postId, projectHandle }) => {
                return Promise.all(
                    attachments.map(async (attachment) => {
                        if (attachment.state !== AttachmentState.Pending)
                            return attachment;

                        const { file } = attachment;
                        if (!file) {
                            throw "tried to create an attachment without a file!";
                        }

                        if (!postId)
                            throw new Error(
                                "Tried to upload attachment without post ID"
                            );

                        const trpcClient = getVanillaClient();

                        switch (attachment.kind) {
                            case "image":
                                return trpcClient.posts.attachment.start.mutate(
                                    {
                                        projectHandle,
                                        postId,
                                        filename: file.name,
                                        contentType: file.type,
                                        contentLength: file.size,
                                        width: attachment.metadata.width,
                                        height: attachment.metadata.height,
                                    }
                                );
                            case "audio":
                                return trpcClient.posts.attachment.start.mutate(
                                    {
                                        projectHandle,
                                        postId,
                                        filename: file.name,
                                        contentType: file.type,
                                        contentLength: file.size,
                                        metadata: attachment.metadata,
                                    }
                                );
                        }
                    })
                );
            },
            uploadFiles: ({ attachments }) => {
                return Promise.all(
                    attachments
                        .filter(
                            (attachment) =>
                                attachment.state === AttachmentState.Pending
                        )
                        .map(async (attachment, index, array) => {
                            if (!attachment.file || !attachment.uploadUrl) {
                                console.error(
                                    index,
                                    array.length,
                                    attachment.file,
                                    attachment.uploadUrl
                                );
                                throw new Error(
                                    "Missing file or upload URL for pending attachment!"
                                );
                            }

                            const formData = new FormData();
                            for (const name in attachment.requiredFields) {
                                formData.append(
                                    name,
                                    attachment.requiredFields[name]
                                );
                            }
                            formData.append("file", attachment.file);
                            formData.append(
                                "Content-Type",
                                attachment.file.type
                            );
                            await axios.post(attachment.uploadUrl, formData, {
                                withCredentials: false,
                            });
                            return null;
                        })
                );
            },
            finishAttachments: ({ attachments, projectHandle, postId }) => {
                const trpcClient = getVanillaClient();

                return Promise.all(
                    attachments.map(async (attachment) => {
                        if (attachment.state !== AttachmentState.Pending) {
                            return {
                                attachmentId: attachment.attachmentId,
                                url: attachment.src,
                            } as PostsV1Types.FinishAttachmentResp;
                        }

                        const { attachmentId } = attachment;
                        if (!postId || !attachmentId) throw new Error();

                        return trpcClient.posts.attachment.finish.mutate({
                            projectHandle,
                            postId,
                            attachmentId,
                        });
                    })
                );
            },
            updatePost: async (context) => {
                if (!context.postId) throw new Error();
                const blocks: StorageBlock[] = [];
                blocks.push(
                    ...context.attachments
                        .filter((attachment) => !!attachment.attachmentId)
                        .map<AttachmentStorageBlock>((attachment) => ({
                            type: "attachment",
                            attachment: {
                                attachmentId: attachment.attachmentId!,
                                altText:
                                    attachment.kind === "image"
                                        ? attachment.metadata.altText
                                        : undefined,
                            },
                        }))
                );
                blocks.push(
                    ...context.markdownBlocks
                        .map<MarkdownStorageBlock>((block) => ({
                            ...block,
                            markdown: {
                                content: block.markdown.content,
                            },
                        }))
                        .filter((block) => !!block.markdown.content)
                );
                const body: PostsV1Types.UpdatePostReq = {
                    postState: context.newPostState,
                    headline: context.headline,
                    adultContent: context.adultContent,
                    blocks,
                    cws: context.cws
                        .filter((cw) => cw.length > 0)
                        .map((cw) => cw.trim()),
                    tags: context.tags
                        .filter((tag) => tag.length > 0)
                        .map((tag) => tag.trim()),
                    shareOfPostId:
                        context.shareOfPostId && !isNaN(context.shareOfPostId)
                            ? context.shareOfPostId
                            : undefined,
                };

                const trpcClient = getVanillaClient();

                await trpcClient.posts.update.mutate({
                    projectHandle: context.projectHandle,
                    postId: context.postId,
                    content: body,
                });
            },
        },
        /**
         * You're going to see a lot of explicit-any here with the rule
         * disabled. Unfortunately, this is a limitation of typescript and this
         * is the preferred solution in the Xstate docs.
         * see: https://xstate.js.org/docs/guides/typescript.html#ondone-onerror-events-in-machine-options
         */
        actions: {
            /**
             * I realize this is currently unused, I'm reworking how validation
             * works right now.
             */
            assignValidationErrorToContext: assign({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                validationErrors: (context, event: any) => {
                    const { fieldName, error } = (
                        event as DoneInvokeEvent<ValidationError>
                    ).data;
                    return (context.validationErrors = {
                        ...context.validationErrors,
                        [fieldName]: error,
                    });
                },
            }),
            assignHeadline: assign({
                headline: (context, event) => {
                    if (event.type !== "HEADLINE_INPUT")
                        return context.headline;

                    return (context.headline = event.headline
                        .replace("\n", " ")
                        .slice(0, 140));
                },
                dirty: (context) => (context.dirty = true),
            }),
            assignAttachmentUploadData: assign({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attachments: (context, _event: any) => {
                    const event = _event as DoneInvokeEvent<
                        PostsV1Types.StartAttachmentResp[]
                    >;
                    return (context.attachments =
                        context.attachments.map<Attachment>((attachment, i) => {
                            if (event.data[i]) {
                                return {
                                    ...attachment,
                                    attachmentId: event.data[i].attachmentId,
                                    uploadUrl: event.data[i].url,
                                    requiredFields:
                                        event.data[i].requiredFields,
                                };
                            } else {
                                return attachment;
                            }
                        }));
                },
            }),
            removeAttachment: assign({
                attachments: (context, event) => {
                    if (event.type !== "REMOVE_ATTACHMENT")
                        return context.attachments;
                    const attachments = [...context.attachments];
                    attachments.splice(event.index, 1);
                    return (context.attachments = attachments);
                },
                dirty: (context) => (context.dirty = true),
            }),
        },
    }
);
