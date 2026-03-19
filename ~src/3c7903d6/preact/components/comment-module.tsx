import { AccessResult } from "@/shared/types/access-result";
import { CommentId, PostId } from "@/shared/types/ids";
import { PostState } from "@/shared/types/posts";
import { useInterpret, useSelector } from "@xstate/react";
import React, { FunctionComponent, Suspense, useContext } from "react";
import { State } from "xstate";
import {
    WireCommentViewModel,
    WirePostViewModel,
} from "../../../shared/types/wire-models";
import {
    CommentModuleContext,
    commentModuleMachine,
} from "../../lib/comment-module-machine";
import { useUserInfo } from "../providers/user-info-provider";
import { CommentComposer } from "./comment-composer";
import { CommentTree } from "./comment-tree";
import { InfoBox } from "./elements/info-box";
import { ErrorBoundary } from "./error-boundary";
import { useDynamicTheme } from "../hooks/dynamic-theme";

export interface CommentModuleProps {
    post: WirePostViewModel;
    commentThreads: { [postId: PostId]: WireCommentViewModel[] };
}

function permissionsFromComments(comments: WireCommentViewModel[]): {
    allowEditsOf: CommentId[];
    blockRepliesTo: CommentId[];
} {
    let allowEditsOf: CommentId[] = [];
    let blockRepliesTo: CommentId[] = [];
    for (const comment of comments) {
        if (comment.canEdit === AccessResult.Allowed) {
            allowEditsOf.push(comment.comment.commentId);
        }

        if (comment.canInteract !== AccessResult.Allowed) {
            blockRepliesTo.push(comment.comment.commentId);
        }

        const nested = permissionsFromComments(comment.comment.children);
        allowEditsOf = allowEditsOf.concat(nested.allowEditsOf);
        blockRepliesTo = blockRepliesTo.concat(nested.blockRepliesTo);
    }

    return {
        allowEditsOf,
        blockRepliesTo,
    };
}

const CommentTreeForPost: FunctionComponent<{
    post: WirePostViewModel;
    rootComments: WireCommentViewModel[];
}> = ({ post, rootComments }) => {
    const dynamicTheme = useDynamicTheme();

    const commentNodes = rootComments.map((comment) => (
        <div
            key={comment.comment.commentId}
            data-theme={dynamicTheme.current}
            className="co-themed-box co-comment-box cohost-shadow-light dark:cohost-shadow-dark flex w-full min-w-0 max-w-full flex-col gap-4 rounded-lg p-3 lg:max-w-prose"
        >
            <Suspense>
                <CommentTree rootComment={comment} nestingLevel={0} />
            </Suspense>
        </div>
    ));

    return (
        <div className="my-3 flex min-w-0 flex-col gap-2">
            <h4 className="px-3 text-bgText lg:px-0">
                in reply to{" "}
                <a
                    href={`#post-${post.postId ?? -99999}`}
                    className="font-bold text-secondary hover:underline"
                >
                    @{post.postingProject.handle}'s post:
                </a>
            </h4>
            {commentNodes}
        </div>
    );
};

export const CommentModuleWrapper: FunctionComponent<CommentModuleProps> = (
    props
) => {
    const rootComments = Object.values(props.commentThreads).flat();
    const permissions = permissionsFromComments(rootComments);
    const commentModuleService = useInterpret(commentModuleMachine, {
        context: {
            permissionsPrefilled:
                !!permissions.allowEditsOf || !!permissions.blockRepliesTo,
            allowEditsOf: new Set(permissions.allowEditsOf),
            blockRepliesTo: new Set(permissions.blockRepliesTo),
            hostPostId:
                props.post.transparentShareOfPostId ?? props.post.postId,
        },
    });

    return (
        <ErrorBoundary>
            <CommentModuleContext.Provider value={commentModuleService}>
                <CommentModule {...props} />
            </CommentModuleContext.Provider>
        </ErrorBoundary>
    );
};

const selectPositionAtCommentId = (state: State<CommentModuleContext>) =>
    state.context.positionAtCommentId;

const CommentModule: FunctionComponent<CommentModuleProps> = ({
    post,
    commentThreads,
}) => {
    const userInfo = useUserInfo();
    const moduleContext = useContext(CommentModuleContext);
    const positionAtCommentId = useSelector(
        moduleContext,
        selectPositionAtCommentId
    );
    const dynamicTheme = useDynamicTheme();

    let commentComposerBlockedMessage: string | undefined;

    if (post.commentsLocked) {
        commentComposerBlockedMessage = "Comments on this post are locked.";
    } else if (!userInfo.loggedIn) {
        commentComposerBlockedMessage = "You must log in to comment.";
    } else if (!userInfo.activated) {
        commentComposerBlockedMessage =
            "Your account isn't activated to post yet.";
    } else if (post.state !== PostState.Published) {
        commentComposerBlockedMessage = "You can't comment on this post.";
    }

    return (
        <>
            <div id="comments" className="relative -top-16" />
            <div
                data-theme={dynamicTheme.current}
                className="co-themed-box co-comment-box cohost-shadow-light dark:cohost-shadow-dark w-full max-w-full rounded-lg p-3 lg:max-w-prose"
            >
                {commentComposerBlockedMessage ? (
                    <InfoBox level="post-box-info">
                        {commentComposerBlockedMessage}
                    </InfoBox>
                ) : (
                    <CommentComposer
                        disabled={positionAtCommentId !== undefined}
                        topLevel={true}
                    />
                )}
            </div>
            {post.shareTree.map((vm) =>
                commentThreads[vm.postId]?.length ? (
                    <CommentTreeForPost
                        key={vm.postId}
                        post={vm}
                        rootComments={commentThreads[vm.postId]}
                    />
                ) : null
            )}
            {commentThreads[post.postId]?.length ? (
                <CommentTreeForPost
                    key={post.postId}
                    post={post}
                    rootComments={commentThreads[post.postId]}
                />
            ) : null}
        </>
    );
};
