import { createContext } from "react";
import {
    createMachine,
    assign,
    InterpreterFrom,
    DoneInvokeEvent,
} from "xstate";
import sitemap from "../../shared/sitemap";
import { CommentId, PostId } from "../../shared/types/ids";
import * as PostsV1Types from "../../shared/api-types/posts-v1";
import { AccessResult } from "@/shared/types/access-result";
import { getVanillaClient } from "./trpc-vanilla";

export interface CommentModuleContext {
    // rendering state
    positionAtCommentId?: CommentId;
    error?: Error;
    clean: boolean;
    blockRepliesTo: Set<CommentId>;
    allowEditsOf: Set<CommentId>;
    permissionsPrefilled: boolean;
    // the post ID that we're actively looking at
    hostPostId: PostId;

    // data submission state
    inReplyToPostId?: PostId;
    inReplyToCommentId?: CommentId;
    body: string;
    submitAction?: string;
    submitMethod: string;
}

export type CommentModuleEvent =
    | { type: "REPLY_START"; commentId: CommentId; postId: PostId }
    | { type: "EDIT_START"; commentId: CommentId; body: string }
    | { type: "DELETE_START"; commentId: CommentId }
    | { type: "COMMENT_INPUT"; body: string }
    | { type: "CANCEL" }
    | { type: "SUBMIT" }
    | { type: "ACKNOWLEDGE" };

export const commentModuleMachine = createMachine<
    CommentModuleContext,
    CommentModuleEvent
>(
    {
        initial: "launching",
        strict: true,
        context: {
            positionAtCommentId: undefined,
            error: undefined,
            clean: true,
            blockRepliesTo: new Set(),
            allowEditsOf: new Set(),
            permissionsPrefilled: false,
            hostPostId: -99999 as PostId,
            inReplyToCommentId: undefined,
            body: "",
            submitAction: undefined,
            submitMethod: "POST",
        },
        states: {
            launching: {
                invoke: {
                    src: "verifyInitialContext",
                    onDone: [
                        {
                            target: "editing",
                            cond: (context) =>
                                context.permissionsPrefilled === true,
                        },
                        {
                            target: "fetchingCommentPermissions",
                        },
                    ],
                    onError: {
                        target: "unrecoverable",
                        actions: assign(
                            (_context, result: DoneInvokeEvent<string>) => {
                                return {
                                    error: new Error(result.data),
                                };
                            }
                        ),
                    },
                },
            },
            unrecoverable: {
                type: "final",
            },
            fetchingCommentPermissions: {
                invoke: {
                    src: "fetchCommentPermissions",
                    onDone: {
                        target: "editing",
                        actions: assign(
                            (
                                _context,
                                result: DoneInvokeEvent<{
                                    blockRepliesTo: Set<CommentId>;
                                    allowEditsOf: Set<CommentId>;
                                }>
                            ) => {
                                return {
                                    blockRepliesTo: result.data.blockRepliesTo,
                                    allowEditsOf: result.data.allowEditsOf,
                                };
                            }
                        ),
                    },
                    onError: {
                        // default context should be fine if we can't fetch
                        // actual permissions data, with the drawback that it's
                        // possible that replies to some comments will fail
                        target: "editing",
                    },
                },
            },
            editing: {
                on: {
                    REPLY_START: {
                        target: "editing",
                        actions: assign((_context, event) => {
                            return {
                                positionAtCommentId: event.commentId,
                                inReplyToCommentId: event.commentId,
                                inReplyToPostId: event.postId,
                                submitMethod: "POST",
                                clean: true,
                            };
                        }),
                    },
                    EDIT_START: {
                        target: "editing",
                        actions: assign((_context, event) => {
                            return {
                                body: event.body,
                                positionAtCommentId: event.commentId,
                                submitAction: sitemap.public.apiV1
                                    .editDeleteComment({
                                        commentId: event.commentId,
                                    })
                                    .toString(),
                                submitMethod: "PUT",
                                clean: true,
                            };
                        }),
                    },
                    DELETE_START: {
                        target: "confirmingDelete",
                        actions: assign((_context, event) => {
                            return {
                                positionAtCommentId: event.commentId,
                                submitAction: sitemap.public.apiV1
                                    .editDeleteComment({
                                        commentId: event.commentId,
                                    })
                                    .toString(),
                                submitMethod: "DELETE",
                            };
                        }),
                    },
                    COMMENT_INPUT: {
                        target: "editing",
                        actions: assign((_context, event) => {
                            return {
                                body: event.body,
                                clean: false,
                            };
                        }),
                    },
                    CANCEL: {
                        target: "editing",
                        actions: assign((_context, _event) => {
                            return {
                                positionAtCommentId: undefined,
                                inReplyToCommentId: undefined,
                                inReplyToPostId: undefined,
                                body: "",
                                submitAction: undefined,
                                clean: true,
                            };
                        }),
                    },
                    SUBMIT: "submitting",
                },
            },
            confirmingDelete: {
                on: {
                    SUBMIT: "submitting",
                    CANCEL: {
                        target: "editing",
                        actions: assign((_context, _event) => {
                            return {
                                positionAtCommentId: undefined,
                                submitAction: undefined,
                                submitMethod: undefined,
                            };
                        }),
                    },
                },
            },
            submitting: {
                invoke: {
                    src: "submit",
                    onDone: {
                        target: "done",
                    },
                    onError: {
                        target: "displayingError",
                        actions: assign((_context, event) => {
                            return {
                                error: event.data as Error,
                            };
                        }),
                    },
                },
            },
            done: {
                type: "final",
                entry: ["reload"],
            },
            displayingError: {
                on: {
                    ACKNOWLEDGE: {
                        target: "editing",
                        actions: assign({
                            error: (_context, _event) => undefined,
                        }),
                    },
                },
            },
        },
    },
    {
        services: {
            verifyInitialContext: (context) => {
                if (context.hostPostId < 0) {
                    return Promise.reject("missing post ID");
                }

                return Promise.resolve();
            },
            fetchCommentPermissions: async (context) => {
                const trpc = getVanillaClient();
                const res = await trpc.comments.byPost.query({
                    postId: context.hostPostId,
                });

                const blockRepliesTo: Set<CommentId> = new Set();
                const allowEditsOf: Set<CommentId> = new Set();

                for (const commentId in res.comments) {
                    if (
                        res.comments[commentId as CommentId]!.canEdit ===
                        AccessResult.Allowed
                    ) {
                        allowEditsOf.add(commentId as CommentId);
                    }

                    if (
                        res.comments[commentId as CommentId]!.canInteract !==
                        AccessResult.Allowed
                    ) {
                        blockRepliesTo.add(commentId as CommentId);
                    }
                }

                return { blockRepliesTo, allowEditsOf };
            },
            submit: async (context) => {
                const payload = {
                    // if we're replying to a comment, make sure we're attaching
                    // it to the correct post ID
                    postId: context.inReplyToCommentId
                        ? context.inReplyToPostId
                        : context.hostPostId,
                    body: context.body,
                    inReplyToCommentId: context.inReplyToCommentId,
                };

                // if no special submit action is set, use the default
                // (new comment)
                const submitAction =
                    context.submitAction ??
                    sitemap.public.apiV1.createComment().toString();

                const res = await fetch(submitAction.toString(), {
                    credentials: "include",
                    method: context.submitMethod,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    throw new Error(res.statusText);
                }
            },
        },
        actions: {
            reload: (_context) => {
                if (typeof location !== "undefined") {
                    // so this doesn't throw an exception in tests
                    location.reload();
                }
            },
        },
    }
);

export const CommentModuleContext = createContext(
    {} as InterpreterFrom<typeof commentModuleMachine>
);
