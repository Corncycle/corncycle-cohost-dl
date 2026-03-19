import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import { CommentModuleWrapper } from "@/client/preact/components/comment-module";
import { FriendlyTimestamp } from "@/client/preact/components/friendly-timestamp";
import { ProjectAvatar } from "@/client/preact/components/partials/project-avatar";
import { PostContent } from "@/client/preact/components/posts/post-content";
import { PostFooter } from "@/client/preact/components/posts/post-footer";
import { ProjectReference } from "@/client/preact/components/project-reference";
import { ReportingUIContext } from "@/client/reporting/machine";
import sitemap from "@/shared/sitemap";
import { PostBoxTheme } from "@/shared/types/display-prefs";
import { PostId } from "@/shared/types/ids";
import { PostProps } from "@/shared/types/post-props";
import { PostState } from "@/shared/types/posts";
import { WirePostViewModel } from "@/shared/types/wire-models";
import { autoUpdate, offset, useFloating } from "@floating-ui/react-dom";
import { Menu, Popover } from "@headlessui/react";
import {
    ChatBubbleOvalLeftEllipsisIcon,
    CogIcon,
    EllipsisHorizontalIcon,
    LightBulbIcon,
    LockClosedIcon,
    LockOpenIcon,
    ShareIcon,
    ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import {
    ArrowDownIcon,
    ArrowPathIcon,
    ArrowUpIcon,
} from "@heroicons/react/24/solid";
import React, {
    FunctionComponent,
    ReactNode,
    useContext,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSSR } from "../../hooks/is-server";
import { useUserInfo } from "../../providers/user-info-provider";
import { MeatballMenuItem } from "../elements/meatball-menu-item";
import { PushpinIcon } from "../icons/pushpin";
import { PostTags } from "../partials/post-tags";
import { useDynamicTheme, usePrefersDark } from "../../hooks/dynamic-theme";
import { SilencePostMenuItem } from "./silence-post-menu-item";

const SharedFromHeader: FunctionComponent<{ viewModel: WirePostViewModel }> = ({
    viewModel,
}) => {
    if (!viewModel.shareTree.length) return null;

    const { postingProject } =
        viewModel.shareTree[viewModel.shareTree.length - 1];
    return (
        <>
            <ArrowPathIcon className="co-project-display-name h-5 w-5" />
            <ProjectReference project={postingProject} />
        </>
    );
};

const AskResponsePopover: FunctionComponent = () => {
    const { refs, floatingStyles } = useFloating();
    return (
        <Popover className="leading-none">
            <Popover.Button ref={refs.setReference}>
                <ChatBubbleOvalLeftEllipsisIcon
                    className={tw`co-action-button h-6 w-6`}
                />
            </Popover.Button>
            <Popover.Panel
                ref={refs.setFloating}
                style={floatingStyles}
                className="cohost-shadow-light prose z-20 w-max max-w-full rounded-lg bg-notWhite p-3 text-center text-sm font-normal text-notBlack"
            >
                <p>This post is a response to an ask.</p>
            </Popover.Panel>
        </Popover>
    );
};

const PostContentHeader: FunctionComponent<Pick<PostProps, "viewModel">> = ({
    viewModel,
}) => {
    return (
        /* TODO: change from flex-wrap to something visually better */
        <div className="co-post-header flex flex-row flex-wrap items-center gap-2 px-3 py-2">
            <ProjectReference
                project={viewModel.postingProject}
                inline={true}
            />

            {viewModel.publishedAt ? (
                <FriendlyTimestamp
                    dateISO={new Date(viewModel.publishedAt).toISOString()}
                    link={viewModel.singlePostPageUrl}
                />
            ) : null}

            {viewModel.responseToAskId && <AskResponsePopover />}
        </div>
    );
};

const PostMeatballMenu: FunctionComponent<{
    viewModel: WirePostViewModel;
    dynamicTheme: ReturnType<typeof useDynamicTheme>;
}> = ({ viewModel, dynamicTheme }) => {
    const { isBrowser } = useSSR();
    const reportingService = useContext(ReportingUIContext);
    const userInfo = useUserInfo();
    const { mutate: setPostPinned } = trpc.posts.setPostPinned.useMutation({
        onSuccess: () => location.reload(),
    });
    const { mutate: setPostCommentsLocked } =
        trpc.posts.setCommentsLocked.useMutation({
            onSuccess: () => location.reload(),
        });
    const { mutate: setPostSharesLocked } =
        trpc.posts.setSharesLocked.useMutation({
            onSuccess: () => location.reload(),
        });

    const { floatingStyles, refs } = useFloating({
        placement: "bottom-end",
        whileElementsMounted: autoUpdate,
        middleware: [offset(8)],
    });

    const prefersDark = usePrefersDark();
    let invertToTheme: PostBoxTheme;

    switch (dynamicTheme.current) {
        case "dark":
            invertToTheme = "light";
            break;
        case "light":
            invertToTheme = "dark";
            break;
        case "both":
            invertToTheme = prefersDark ? "light" : "dark";
            break;
    }

    let shareSheetMenuItem = null;
    if (
        isBrowser &&
        !!navigator.canShare && // the share API is not currently in firefox
        navigator.canShare({ url: viewModel.singlePostPageUrl })
    ) {
        shareSheetMenuItem = (
            <MeatballMenuItem
                ItemIcon={ShareIcon}
                text="share post"
                onClick={() =>
                    navigator.share({ url: viewModel.singlePostPageUrl })
                }
                disabled={false}
            />
        );
    }

    // a post is pinnable if it was posted by the viewing project, it's
    // published, and it isn't a transparent share
    const canPin =
        userInfo.projectId === viewModel.postingProject.projectId &&
        viewModel.state === PostState.Published &&
        !viewModel.transparentShareOfPostId;
    let changePinnedMenuItem = null;

    if (canPin && viewModel.pinned) {
        // unpin item
        changePinnedMenuItem = (
            <button
                className="flex flex-row gap-2 hover:underline"
                onClick={() =>
                    setPostPinned({ postId: viewModel.postId, pinned: false })
                }
            >
                <PushpinIcon className="h-6" />
                unpin this post
            </button>
        );
    } else if (canPin) {
        // pin item
        changePinnedMenuItem = (
            <button
                className="flex flex-row gap-2 hover:underline"
                onClick={() =>
                    setPostPinned({ postId: viewModel.postId, pinned: true })
                }
            >
                <PushpinIcon className="h-6" />
                pin this post
            </button>
        );
    } // otherwise, don't offer a pin or unpin item

    // you can lock and unlock comments on any post you own, as long as it's not
    // a transparent share.
    const canLockComments =
        userInfo.projectId === viewModel.postingProject.projectId &&
        !viewModel.transparentShareOfPostId;
    let lockCommentsMenuItem = null;

    if (canLockComments && viewModel.commentsLocked) {
        // display unlock comments menu item
        lockCommentsMenuItem = (
            <MeatballMenuItem
                ItemIcon={LockOpenIcon}
                text="unlock comments"
                onClick={() =>
                    setPostCommentsLocked({
                        postId: viewModel.postId,
                        commentsLocked: false,
                    })
                }
                disabled={false}
            />
        );
    } else if (canLockComments) {
        // display lock comments menu item
        lockCommentsMenuItem = (
            <MeatballMenuItem
                ItemIcon={LockClosedIcon}
                text="lock comments"
                onClick={() =>
                    setPostCommentsLocked({
                        postId: viewModel.postId,
                        commentsLocked: true,
                    })
                }
                disabled={false}
            />
        );
    } // otherwise display neither

    // you can lock and unlock shares on any post you own, as long as it's not a
    // transparent share
    const canLockShares =
        userInfo.projectId === viewModel.postingProject.projectId &&
        !viewModel.transparentShareOfPostId;
    let lockSharesMenuItem = null;

    if (canLockShares) {
        if (viewModel.sharesLocked) {
            // display unlock menu item
            lockSharesMenuItem = (
                <MeatballMenuItem
                    ItemIcon={LockOpenIcon}
                    text="unlock shares"
                    disabled={false}
                    onClick={() =>
                        setPostSharesLocked({
                            postId: viewModel.postId,
                            sharesLocked: false,
                        })
                    }
                />
            );
        } else {
            // display unlock menu item
            lockSharesMenuItem = (
                <MeatballMenuItem
                    ItemIcon={LockClosedIcon}
                    text="lock shares"
                    disabled={false}
                    onClick={() =>
                        setPostSharesLocked({
                            postId: viewModel.postId,
                            sharesLocked: true,
                        })
                    }
                />
            );
        }
    }

    return (
        <Menu>
            <Menu.Button ref={refs.setReference}>
                <EllipsisHorizontalIcon
                    className={tw`co-action-button h-6 w-6 transition-transform ui-open:rotate-90`}
                />
            </Menu.Button>

            <Menu.Items
                ref={refs.setFloating}
                style={floatingStyles}
                className="cohost-shadow-dark z-30 flex min-w-max flex-col gap-3 rounded-lg bg-notWhite p-3 text-notBlack focus:!outline-none"
            >
                {shareSheetMenuItem ? (
                    <Menu.Item>{shareSheetMenuItem}</Menu.Item>
                ) : null}

                <Menu.Item>
                    <MeatballMenuItem
                        ItemIcon={LightBulbIcon}
                        text="invert colors"
                        disabled={false}
                        onClick={() => dynamicTheme.forceTheme(invertToTheme)}
                    />
                </Menu.Item>

                {changePinnedMenuItem ? (
                    <Menu.Item>{changePinnedMenuItem}</Menu.Item>
                ) : null}

                {lockCommentsMenuItem ? (
                    <Menu.Item>{lockCommentsMenuItem}</Menu.Item>
                ) : null}

                {lockSharesMenuItem ? (
                    <Menu.Item>{lockSharesMenuItem}</Menu.Item>
                ) : null}

                {viewModel.state === PostState.Published ? (
                    <Menu.Item>
                        <SilencePostMenuItem
                            postId={
                                viewModel.transparentShareOfPostId ??
                                viewModel.postId
                            }
                        />
                    </Menu.Item>
                ) : null}

                <Menu.Item>
                    <MeatballMenuItem
                        onClick={() =>
                            reportingService.send({
                                type: "START_REPORT",
                                postId:
                                    viewModel.transparentShareOfPostId ??
                                    viewModel.postId ??
                                    (-99999 as PostId),
                            })
                        }
                        disabled={
                            !viewModel.transparentShareOfPostId &&
                            !viewModel.postId
                        }
                        ItemIcon={ShieldExclamationIcon}
                        text="report this post"
                    />
                </Menu.Item>
                {userInfo.modMode ? (
                    <>
                        <Menu.Item>
                            <a
                                className="flex flex-row gap-2 hover:underline"
                                href={sitemap.public.moderation
                                    .managePost({
                                        postId:
                                            viewModel.transparentShareOfPostId ??
                                            viewModel.postId,
                                    })
                                    .toString()}
                            >
                                <CogIcon className="h-6" />
                                manage post
                            </a>
                        </Menu.Item>
                        {viewModel.responseToAskId ? (
                            <Menu.Item>
                                <a
                                    className="flex flex-row gap-2 hover:underline"
                                    href={sitemap.public.moderation
                                        .manageAsk({
                                            askId: viewModel.responseToAskId,
                                        })
                                        .toString()}
                                >
                                    <CogIcon className="h-6" />
                                    manage ask
                                </a>
                            </Menu.Item>
                        ) : null}
                    </>
                ) : null}
            </Menu.Items>
        </Menu>
    );
};

type PostContentModuleProps = PostProps & {
    showHeader: boolean;
    showHairline: boolean;
};

const PostContentModule: FunctionComponent<PostContentModuleProps> = ({
    viewModel,
    highlightedTags,
    showHeader,
    skipCollapse,
    showHairline,
}) => {
    return (
        <div>
            <div
                id={`post-${viewModel.postId ?? -99999}`}
                data-testid={`post-body-${viewModel.postId ?? -99999}`}
                className="relative -top-20"
            />

            {showHeader ? <PostContentHeader viewModel={viewModel} /> : null}

            <PostContent
                viewModel={viewModel}
                skipCollapse={skipCollapse}
                highlightedTags={highlightedTags}
            />

            {showHairline ? <hr className="co-hairline" /> : null}
        </div>
    );
};
export const PostPreview: FunctionComponent<PostProps> = ({
    viewModel,
    highlightedTags,
    displayPrefs,
    condensed = false,
    showFooter = true,
    showLastPost = true,
    showMeatballMenu = true,
    showThreadCollapser = true,
    skipCollapse = false,
    commentThreads,
}) => {
    const { t } = useTranslation();
    const [collapseThread, setCollapseThread] = useState(
        displayPrefs.collapseLongThreads
    );

    const dynamicTheme = useDynamicTheme();

    const postContentsToDisplay = [
        ...viewModel.shareTree.filter(
            (childViewModel) =>
                (childViewModel.limitedVisibilityReason !== "none" ||
                    childViewModel.blocks.length ||
                    childViewModel.headline.length) &&
                // skip over deleted transparent shares in rendering; deleted
                // opaque shares should still be rendered to give readers some idea
                // that some content was deleted
                !(
                    childViewModel.state === PostState.Deleted &&
                    childViewModel.transparentShareOfPostId
                )
        ),
    ];

    if (!viewModel.transparentShareOfPostId && showLastPost) {
        postContentsToDisplay.push(viewModel);
    }

    let postContents: ReactNode;

    const handleCollapserClick = () => {
        setCollapseThread(!collapseThread);
    };

    const sharedWithTagsElement =
        viewModel.transparentShareOfPostId && viewModel.tags.length ? (
            <div className="flex w-full max-w-full flex-col">
                <hr className="co-hairline mb-3" />
                <div className={tw`co-ui-text px-3`}>
                    <span className="min-w-0 truncate">
                        <a
                            href={sitemap.public.project
                                .mainAppProfile({
                                    projectHandle:
                                        viewModel.postingProject.handle,
                                })
                                .toString()}
                            className="font-bold hover:underline"
                        >
                            @{viewModel.postingProject.handle}
                        </a>{" "}
                        <span>shared with:</span>
                    </span>
                </div>
                <PostTags
                    tags={viewModel.tags}
                    highlightedTags={highlightedTags}
                />
            </div>
        ) : null;

    if (showThreadCollapser && postContentsToDisplay.length > 3) {
        // the collapser should be shown, and the thread is long enough to
        // justify it; figure out where it should be, even if we end up
        // displaying all of the posts.
        const postAboveTheFold = postContentsToDisplay[0],
            postsBelowTheFold = collapseThread
                ? postContentsToDisplay.slice(-2)
                : postContentsToDisplay.slice(1),
            nCollapsiblePosts = postContentsToDisplay.length - 3;

        postContents = (
            <>
                {postAboveTheFold ? (
                    <>
                        <PostContentModule
                            key={postAboveTheFold.postId}
                            viewModel={postAboveTheFold}
                            highlightedTags={highlightedTags}
                            displayPrefs={displayPrefs}
                            showHeader={true}
                            showHairline={true}
                        />

                        {collapseThread ? (
                            <>
                                <button
                                    className={tw`co-link-button w-full cursor-pointer text-center font-bold`}
                                    onClick={handleCollapserClick}
                                    type="button"
                                >
                                    <ArrowDownIcon className="mr-1 inline-block w-4" />

                                    {t(
                                        "client:post-preview.thread-collapser-show",
                                        {
                                            count: nCollapsiblePosts,
                                            defaultValue:
                                                "show {{count}} posts",
                                        }
                                    )}
                                </button>

                                <hr className="co-hairline" />
                                <hr className="co-hairline my-1" />
                                <hr className="co-hairline" />
                            </>
                        ) : (
                            <>
                                <button
                                    className={tw`co-link-button w-full cursor-pointer text-center font-bold`}
                                    onClick={handleCollapserClick}
                                    type="button"
                                >
                                    <ArrowUpIcon className="mr-1 inline-block w-4" />

                                    {t(
                                        "client:post-preview.thread-collapser-hide",
                                        {
                                            count: nCollapsiblePosts,
                                            defaultValue:
                                                "hide {{count}} posts",
                                        }
                                    )}
                                </button>

                                <hr className="co-hairline" />
                            </>
                        )}
                    </>
                ) : null}

                {postsBelowTheFold.map((embeddedViewModel, i) => {
                    const last = i === postsBelowTheFold.length - 1;

                    return (
                        <PostContentModule
                            key={embeddedViewModel.postId}
                            viewModel={embeddedViewModel}
                            highlightedTags={highlightedTags}
                            displayPrefs={displayPrefs}
                            skipCollapse={last ? skipCollapse : undefined}
                            showHeader={true}
                            showHairline={!last}
                        />
                    );
                })}
                {sharedWithTagsElement}
            </>
        );
    } else {
        // either the collapser is disabled or the thread is too short to
        // collapse; don't bother calculating it.
        postContents = (
            <>
                {postContentsToDisplay.map((embeddedViewModel, i) => {
                    const last = i === postContentsToDisplay.length - 1;

                    return (
                        <PostContentModule
                            key={embeddedViewModel.postId}
                            viewModel={embeddedViewModel}
                            highlightedTags={highlightedTags}
                            displayPrefs={displayPrefs}
                            skipCollapse={last ? skipCollapse : undefined}
                            showHeader={
                                postContentsToDisplay.length > 1 ||
                                !!viewModel.transparentShareOfPostId
                            }
                            showHairline={!last}
                        />
                    );
                })}
                {sharedWithTagsElement}
            </>
        );
    }

    return (
        <div
            data-view="post-preview"
            data-testid={`post-${viewModel.postId}`}
            data-postid={viewModel.postId}
            key={viewModel.postId}
            className={`grid ${
                condensed ? "" : "lg:grid-cols-[4rem_1fr]"
            } w-full gap-x-6 gap-y-2`}
        >
            {condensed ? null : (
                <ProjectAvatar project={viewModel.postingProject} />
            )}
            <article
                data-theme={dynamicTheme.current}
                className="co-themed-box co-post-box"
            >
                <header className="co-thread-header">
                    <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-2 leading-none">
                        {viewModel.pinned ? (
                            <PushpinIcon className="co-project-display-name h-6" />
                        ) : null}

                        <ProjectReference project={viewModel.postingProject} />

                        {viewModel.responseToAskId &&
                            // we only want to show the ask response icon if we
                            // aren't in a shared post context. when we are, it
                            // appears in the share attribution line.
                            viewModel.shareTree.length === 0 && (
                                <AskResponsePopover />
                            )}

                        {viewModel.publishedAt ? (
                            <FriendlyTimestamp
                                dateISO={new Date(
                                    viewModel.publishedAt
                                ).toISOString()}
                                link={viewModel.singlePostPageUrl}
                            />
                        ) : null}

                        {/* FIXME: the share clause here is displayed
                            incorrectly for shares of deleted posts, pending a
                            further rewrite of the post history code */}
                        {viewModel.shareTree.length > 0 ? (
                            <SharedFromHeader viewModel={viewModel} />
                        ) : null}
                    </div>

                    {showMeatballMenu ? (
                        <PostMeatballMenu
                            viewModel={viewModel}
                            dynamicTheme={dynamicTheme}
                        />
                    ) : null}
                </header>

                {/* hairline between post header and the first post */}
                <hr className="co-hairline" />

                {postContents}

                {showFooter ? (
                    <PostFooter
                        post={viewModel}
                        singlePostPageUrl={viewModel.singlePostPageUrl}
                    />
                ) : null}
            </article>
            {commentThreads ? (
                <CommentModuleWrapper
                    post={viewModel}
                    commentThreads={commentThreads}
                />
            ) : null}
        </div>
    );
};

export default PostPreview;
