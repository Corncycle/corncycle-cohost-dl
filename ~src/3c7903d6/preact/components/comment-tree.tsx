import { renderMarkdownReactNoHTML } from "@/client/lib/markdown/other-rendering";
import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import { selectStateMatches } from "@/client/lib/xstate-helpers";
import { ReportingUIContext } from "@/client/reporting/machine";
import { AccessResult } from "@/shared/types/access-result";
import { Menu } from "@headlessui/react";
import {
    EyeIcon as EyeIconOutline,
    EyeSlashIcon as EyeSlashIconOutline,
    ShareIcon,
    ShieldExclamationIcon as ShieldExclamationIconOutline,
    TrashIcon as TrashIconOutline,
} from "@heroicons/react/24/outline";
import {
    ArrowUturnLeftIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import { useSelector } from "@xstate/react";
import { DateTime } from "luxon";
import React, {
    FunctionComponent,
    Suspense,
    useContext,
    useMemo,
    useState,
} from "react";
import { State } from "xstate";
import sitemap from "../../../shared/sitemap";
import { WireCommentViewModel } from "../../../shared/types/wire-models";
import { CommentModuleContext } from "../../lib/comment-module-machine";
import { useSSR } from "../hooks/is-server";
import { useDisplayPrefs } from "../hooks/use-display-prefs";
import { useUserInfo } from "../providers/user-info-provider";
import { CommentComposer } from "./comment-composer";
import { InfoBox } from "./elements/info-box";
import { MeatballMenuItem } from "./elements/meatball-menu-item";
import { FriendlyTimestamp } from "./friendly-timestamp";
import { ProjectAvatar } from "./partials/project-avatar";
import { ProjectReference } from "./project-reference";

export interface CommentTreeProps {
    rootComment: WireCommentViewModel;
    nestingLevel: number;
}

const selectIsEditing = selectStateMatches("editing");
const selectAllowEditsOf = (state: State<CommentModuleContext>) =>
    state.context.allowEditsOf;
const selectBlockRepliesTo = (state: State<CommentModuleContext>) =>
    state.context.blockRepliesTo;
const selectPositionAtCommentId = (state: State<CommentModuleContext>) =>
    state.context.positionAtCommentId;

const CommentMeatballMenu: FunctionComponent<CommentTreeProps> = ({
    rootComment,
}) => {
    const commentModuleContext = useContext(CommentModuleContext);
    const allowEditsOf = useSelector(commentModuleContext, selectAllowEditsOf);

    const reportingUIContext = useContext(ReportingUIContext);

    const setHiddenMutation = trpc.comments.setHidden.useMutation({
        onSettled: () => location.reload(),
    });

    const { loggedIn } = useUserInfo();
    const { isBrowser } = useSSR();

    const commentAnchor = `comment-${rootComment.comment.commentId}`;
    const canShare =
        isBrowser &&
        !!navigator.canShare && // the share API is not currently in firefox
        navigator.canShare({ url: `#${commentAnchor}` });

    return (
        // explicit height is required to vertically align the
        // meatballs with the rest of the action buttons
        <Menu as="div" className="relative h-6">
            <Menu.Button className="co-link-button cursor-pointer text-sm font-bold hover:underline">
                <EllipsisHorizontalIcon className="h-6 w-6 transition-transform ui-open:rotate-90" />
            </Menu.Button>

            <Menu.Items className="cohost-shadow-dark absolute right-0 top-8 z-30 flex min-w-max flex-col divide-y rounded-lg bg-notWhite p-3 text-notBlack focus:!outline-none">
                {canShare ? (
                    <div className="flex flex-col gap-3 pb-1.5">
                        <Menu.Item>
                            <MeatballMenuItem
                                ItemIcon={ShareIcon}
                                text="share"
                                onClick={() =>
                                    navigator.share({
                                        url: `#${commentAnchor}`,
                                    })
                                }
                                disabled={false}
                            />
                        </Menu.Item>
                    </div>
                ) : null}
                <div
                    className={`flex flex-col gap-3 ${
                        canShare ? "pt-1.5" : ""
                    }`}
                >
                    {rootComment.canHide === AccessResult.Allowed ? (
                        rootComment.comment.hidden ? (
                            <Menu.Item>
                                <MeatballMenuItem
                                    disabled={false}
                                    onClick={() => {
                                        setHiddenMutation.mutate({
                                            commentId:
                                                rootComment.comment.commentId,
                                            hidden: false,
                                        });
                                    }}
                                    ItemIcon={EyeIconOutline}
                                    text="unhide"
                                />
                            </Menu.Item>
                        ) : (
                            <Menu.Item>
                                <MeatballMenuItem
                                    disabled={false}
                                    onClick={() => {
                                        setHiddenMutation.mutate({
                                            commentId:
                                                rootComment.comment.commentId,
                                            hidden: true,
                                        });
                                    }}
                                    ItemIcon={EyeSlashIconOutline}
                                    text="hide"
                                />
                            </Menu.Item>
                        )
                    ) : null}

                    {loggedIn ? (
                        <Menu.Item>
                            <MeatballMenuItem
                                disabled={false}
                                onClick={() => {
                                    reportingUIContext.send({
                                        type: "START_REPORT",
                                        commentId:
                                            rootComment.comment.commentId,
                                    });
                                }}
                                ItemIcon={ShieldExclamationIconOutline}
                                text="report"
                            />
                        </Menu.Item>
                    ) : null}

                    {allowEditsOf.has(rootComment.comment.commentId) ? (
                        <Menu.Item>
                            <MeatballMenuItem
                                disabled={false}
                                onClick={() => {
                                    commentModuleContext.send({
                                        type: "DELETE_START",
                                        commentId:
                                            rootComment.comment.commentId,
                                    });
                                }}
                                ItemIcon={TrashIconOutline}
                                text="delete"
                            />
                        </Menu.Item>
                    ) : null}
                </div>
            </Menu.Items>
        </Menu>
    );
};

const CommentContent: FunctionComponent<CommentTreeProps> = (props) => {
    const { rootComment } = props;

    const commentModuleContext = useContext(CommentModuleContext);
    const isEditing = useSelector(commentModuleContext, selectIsEditing);
    const allowEditsOf = useSelector(commentModuleContext, selectAllowEditsOf);
    const blockRepliesTo = useSelector(
        commentModuleContext,
        selectBlockRepliesTo
    );
    const positionAtCommentId = useSelector(
        commentModuleContext,
        selectPositionAtCommentId
    );

    const displayPrefs = useDisplayPrefs();

    const { loggedIn } = useUserInfo();
    const { isBrowser } = useSSR();

    const commentAnchor = `comment-${rootComment.comment.commentId}`;

    const renderedComment = useMemo(
        () =>
            renderMarkdownReactNoHTML(
                rootComment.comment.body,
                DateTime.fromISO(rootComment.comment.postedAtISO).toJSDate(),
                {
                    renderingContext: "comment",
                    hasCohostPlus: rootComment.comment.hasCohostPlus,
                    disableEmbeds: displayPrefs.disableEmbeds,
                    externalLinksInNewTab: displayPrefs.externalLinksInNewTab,
                }
            ),
        [
            rootComment.comment.body,
            rootComment.comment.postedAtISO,
            rootComment.comment.hasCohostPlus,
            displayPrefs.disableEmbeds,
            displayPrefs.externalLinksInNewTab,
        ]
    );

    return (
        <div className="flex flex-row gap-4">
            {rootComment.comment.deleted || !rootComment.poster ? null : (
                <ProjectAvatar
                    project={rootComment.poster}
                    className="cohost-shadow-light dark:cohost-shadow-dark hidden h-12 w-12 lg:block"
                />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-start gap-2">
                {/* TODO: change from flex-wrap to something visually better */}
                <div className="flex flex-row flex-wrap items-center gap-2">
                    {rootComment.comment.deleted || !rootComment.poster ? (
                        <>
                            <span>[deleted]</span>
                            <FriendlyTimestamp
                                dateISO={rootComment.comment.postedAtISO}
                            />
                        </>
                    ) : (
                        <>
                            <ProjectReference project={rootComment.poster} />
                            <FriendlyTimestamp
                                dateISO={rootComment.comment.postedAtISO}
                                link={`#${commentAnchor}`}
                            />
                        </>
                    )}
                </div>
                <div className={tw`co-prose prose overflow-hidden break-words`}>
                    {renderedComment}
                </div>
                <div className="flex flex-row items-center gap-2">
                    {!loggedIn ? (
                        <a
                            className={tw`co-link-button flex cursor-pointer flex-row 
                        items-center gap-1 text-sm font-bold hover:underline`}
                            href={sitemap.public.login().toString()}
                        >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                            login to reply
                        </a>
                    ) : blockRepliesTo.has(rootComment.comment.commentId) ? (
                        <span
                            className={tw`co-link-button-disabled flex cursor-not-allowed 
                                flex-row items-center gap-1 text-sm font-bold text-gray-400`}
                        >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                            replies locked
                        </span>
                    ) : (
                        <button
                            className={tw`co-link-button flex cursor-pointer flex-row 
                                items-center gap-1 text-sm font-bold
                                hover:underline`}
                            onClick={(e) => {
                                e.preventDefault();
                                commentModuleContext.send({
                                    type: "REPLY_START",
                                    commentId: rootComment.comment.commentId,
                                    postId: rootComment.comment.postId,
                                });
                            }}
                        >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                            reply
                        </button>
                    )}
                    {isBrowser &&
                    allowEditsOf.has(rootComment.comment.commentId) ? (
                        <>
                            <button
                                className={tw`co-link-button cursor-pointer text-sm font-bold 
                                    hover:underline`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    commentModuleContext.send({
                                        type: "EDIT_START",
                                        commentId:
                                            rootComment.comment.commentId,
                                        body: rootComment.comment.body,
                                    });
                                }}
                            >
                                edit
                            </button>
                        </>
                    ) : null}
                    <CommentMeatballMenu {...props} />
                </div>
                {positionAtCommentId === rootComment.comment.commentId ? (
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            {isEditing ? (
                                <p className={tw`co-ui-text text-sm font-bold`}>
                                    replying to @{rootComment.poster?.handle}
                                </p>
                            ) : null}
                        </div>
                        <CommentComposer disabled={false} topLevel={false} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export const CommentTree: FunctionComponent<CommentTreeProps> = (props) => {
    const { rootComment, nestingLevel } = props;

    const [expandHidden, setExpandHidden] = useState(false);

    const commentAnchor = `comment-${rootComment.comment.commentId}`;

    return (
        <div className="flex flex-col gap-4">
            <article
                className="relative flex flex-row gap-4"
                data-comment-id={rootComment.comment.commentId}
            >
                <div id={commentAnchor} className="absolute -top-16" />

                <div className="flex min-w-0 flex-1 flex-col">
                    {rootComment.comment.hidden ? (
                        <InfoBox
                            level="post-box-info"
                            className="mb-4 max-w-full"
                        >
                            {expandHidden ? (
                                <>
                                    The below comment was hidden by the page
                                    which made this post.{" "}
                                    <button
                                        className={tw`co-link-button underline`}
                                        onClick={() => setExpandHidden(false)}
                                    >
                                        (hide it again)
                                    </button>
                                </>
                            ) : (
                                <>
                                    A comment has been hidden by the page which
                                    made this post.{" "}
                                    <button
                                        className={tw`co-link-button underline`}
                                        onClick={() => setExpandHidden(true)}
                                    >
                                        (view it anyway)
                                    </button>
                                </>
                            )}
                        </InfoBox>
                    ) : null}

                    {expandHidden || !rootComment.comment.hidden ? (
                        <CommentContent {...props} />
                    ) : null}
                </div>
            </article>

            {(expandHidden || !rootComment.comment.hidden) &&
            rootComment.comment.children.length > 0 ? (
                <div
                    className={tw`co-hairline ml-0 flex flex-col gap-4 border-l pl-6 lg:ml-6 lg:pl-4`}
                >
                    {rootComment.comment.children.map((child) => (
                        <Suspense key={child.comment.commentId}>
                            <CommentTree
                                rootComment={child}
                                nestingLevel={nestingLevel + 1}
                            />
                        </Suspense>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
