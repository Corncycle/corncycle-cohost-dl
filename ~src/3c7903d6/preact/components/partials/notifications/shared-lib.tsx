import { renderSummaryNoHTML } from "@/client/lib/markdown/other-rendering";
import { renderPostSummary } from "@/client/lib/markdown/post-rendering";
import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import { NotificationFilters } from "@/shared/api-types/notifications-v1";
import sitemap from "@/shared/sitemap";
import { CommentId, PostId, ProjectId } from "@/shared/types/ids";
import {
    AttachmentViewBlock,
    getAttachmentViewBlocks,
    isAttachmentRowViewBlock,
    isAttachmentViewBlock,
} from "@/shared/types/post-blocks";
import { WireProjectModel } from "@/shared/types/projects";
import {
    WireGroupedNotification,
    WireNotification,
    WireNotificationCommentViewModel,
    WirePostViewModel,
    WireUngroupedNotification,
} from "@/shared/types/wire-models";
import { isDefined } from "@/shared/util/filter-null-undefined";
import { TFunction } from "i18next";
import { DateTime } from "luxon";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
    UserInfoType,
    useUserInfo,
} from "../../../providers/user-info-provider";
import {
    NotificationCard,
    NotificationCardProps,
    NotificationCardType,
} from "./notification-card";
import { NotificationGroup } from "./notification-group";

const getFirstAttachment = (post: WirePostViewModel) => {
    const attachmentBlocks = getAttachmentViewBlocks(post.blocks);
    return attachmentBlocks[0] as AttachmentViewBlock | undefined;
};

const prepareUngroupedNotificationView = (
    notification: WireUngroupedNotification,
    projects: { [projectId: ProjectId]: WireProjectModel },
    posts: { [postId: PostId]: WirePostViewModel },
    comments: { [commentId: CommentId]: WireNotificationCommentViewModel },
    t: TFunction,
    userInfo: UserInfoType
): NotificationCardProps | null => {
    const project = projects[notification.fromProjectId];

    // if for whatever reason we don't have a project
    // associated, skip rendering.
    if (!project || !project.projectId) return null;

    // currently the only non-post notification type,
    // fortunately very uncomplicated to render
    if (notification.type === "follow") {
        return {
            actionText: "followed-you",
            key: `follow-${project.projectId}`,
            projects: [project],
            type: "follow",
            summaryUrl: sitemap.public.project
                .mainAppProfile({
                    projectHandle: project.handle,
                })
                .toString(),
        };
    }

    const post = posts[notification.toPostId];

    // if for whatever reason we don't have a post
    // associated, skip rendering.
    // this happens if a post is removed from the pool due to
    // the post sharer having blocked OP.
    if (!post) return null;

    const myPost = post.postingProject.projectId == userInfo.projectId;

    const firstAttachment = getFirstAttachment(post);

    // we only grab the first 60 characters b/c our max view width is `60ch`
    // this just helps keep the DOM a little bit smaller
    let summary =
        renderPostSummary(post, { myPost }) ||
        t("client:notifications.empty-post-summary", "[no text]");
    if (summary.length > 60) {
        summary = summary.slice(0, 60) + "…";
    }

    switch (notification.type) {
        case "like": {
            const actionText =
                post.postingProject.projectId === userInfo.projectId
                    ? "liked-your-post"
                    : "liked-share-of-post";

            return {
                key: notification.relationshipId,
                type: "like",
                actionText,
                projects: [project],
                summary,
                summaryUrl: post.singlePostPageUrl.toString(),
                firstAttachment,
            };
        }
        case "comment": {
            const comment = comments[notification.commentId];

            // comment is a reply and the original comment is by current project
            let isReply = !!comment.comment.inReplyTo;
            const repliedComment =
                isReply && comment.comment.inReplyTo
                    ? comments[comment.comment.inReplyTo]
                    : null;
            isReply = !!(
                isReply &&
                repliedComment &&
                repliedComment.poster?.projectId === userInfo.projectId
            );

            const actionText = isReply
                ? "replied-to-comment"
                : "commented-on-post";

            const notifSummary =
                isReply && repliedComment
                    ? renderSummaryNoHTML(
                          repliedComment.comment.body,
                          DateTime.fromISO(
                              repliedComment.comment.postedAtISO
                          ).toJSDate(),
                          {
                              renderingContext: "comment",
                              disableEmbeds: true,
                              externalLinksInNewTab: true,
                              hasCohostPlus: false,
                          }
                      )
                    : summary;

            return {
                key: notification.commentId,
                type: "comment",
                actionText,
                projects: [project],
                summary: notifSummary,
                summaryUrl: sitemap.public.project.singlePost
                    .published({
                        projectHandle: post.postingProject.handle,
                        filename: post.filename,
                        commentId: comment.comment.commentId,
                    })
                    .toString(),
                body: renderSummaryNoHTML(
                    comment.comment.body,
                    DateTime.fromISO(comment.comment.postedAtISO).toJSDate(),
                    {
                        renderingContext: "comment",
                        disableEmbeds: true,
                        externalLinksInNewTab: true,
                        hasCohostPlus: false,
                    }
                ),
                // only show the attachment for comments on posts, not replies
                firstAttachment: !isReply ? firstAttachment : undefined,
            };
        }
        case "share": {
            const sharePost = posts[notification.sharePostId];
            if (!sharePost) return null;

            let shareSummary =
                renderPostSummary(sharePost, { myPost }) ||
                t("client:notifications.empty-post-summary", "[no text]");
            if (shareSummary.length > 60) {
                shareSummary = shareSummary.slice(0, 60) + "…";
            }

            let actionText: NotificationCardType =
                sharePost.transparentShareOfPostId
                    ? "shared-your-post"
                    : "shared-and-added";

            if (post.postingProject.projectId !== userInfo.projectId) {
                actionText = sharePost.transparentShareOfPostId
                    ? "shared-a-share"
                    : "shared-a-share-and-added";
            }

            return {
                key: notification.sharePostId,
                type: "share",
                actionText,
                projects: [project],
                summary,
                summaryUrl: sharePost.singlePostPageUrl.toString(),
                // only show body for contentful shares
                body: sharePost.transparentShareOfPostId
                    ? undefined
                    : shareSummary,
                firstAttachment,
            };
        }
    }
};

const prepareGroupedNotificationView = (
    notification: WireGroupedNotification,
    projects: { [projectId: ProjectId]: WireProjectModel },
    posts: { [postId: PostId]: WirePostViewModel },
    comments: { [commentId: CommentId]: WireNotificationCommentViewModel },
    t: TFunction,
    userInfo: UserInfoType
): NotificationCardProps | null => {
    // if a project has been purged, some of the projects this notification is
    // from can be undefined.  filter those out before preparing the notification
    // view.
    const notifProjects = notification.fromProjectIds
        .map((projectId) => projects[projectId])
        .filter(isDefined);

    // all the projects are undefined; suppress the notification entirely.
    if (notifProjects.length === 0) {
        return null;
    }

    // if there's only one project left, generate an ungrouped notification.
    if (notifProjects.length === 1) {
        let ungroupedNotification: WireUngroupedNotification;
        switch (notification.type) {
            case "groupedLike":
                ungroupedNotification = {
                    type: "like",
                    createdAt: notification.createdAt,
                    fromProjectId: notifProjects[0].projectId, // notification.fromProjectIds[0],
                    relationshipId: notification.relationshipIds[0],
                    toPostId: notification.toPostId,
                };
                break;
            case "groupedFollow":
                ungroupedNotification = {
                    type: "follow",
                    createdAt: notification.createdAt,
                    fromProjectId: notifProjects[0].projectId,
                };
                break;
            case "groupedShare":
                ungroupedNotification = {
                    type: "share",
                    createdAt: notification.createdAt,
                    fromProjectId: notifProjects[0].projectId,
                    sharePostId: notification.sharePostIds[0],
                    transparentShare: notification.transparentShare,
                    toPostId: notification.toPostId,
                };
                break;
        }
        return prepareUngroupedNotificationView(
            ungroupedNotification,
            projects,
            posts,
            comments,
            t,
            userInfo
        );
    }

    switch (notification.type) {
        case "groupedLike": {
            const post = posts[notification.toPostId];
            if (!post) return null;
            const myPost = post.postingProject.projectId === userInfo.projectId;

            const firstAttachment = getFirstAttachment(post);
            // we only grab the first 60 characters b/c our max view width is `60ch`
            // this just helps keep the DOM a little bit smaller
            let summary =
                renderPostSummary(post, { myPost }) ||
                t("client:notifications.empty-post-summary", "[no text]");
            if (summary.length > 60) {
                summary = summary.slice(0, 60) + "…";
            }

            return {
                key: JSON.stringify(notification.relationshipIds),
                actionText: myPost
                    ? "group-liked-your-post"
                    : "group-liked-share-of-post",
                projects: notifProjects,
                type: "groupedLike",
                summaryUrl: post.singlePostPageUrl,
                firstAttachment,
                summary,
            };
        }
        case "groupedFollow": {
            return {
                key: `follow-${JSON.stringify(notification.fromProjectIds)}`,
                actionText: "group-followed-you",
                projects: notifProjects,
                type: "groupedFollow",
                // this is not actually rendered but is a required field
                summaryUrl: sitemap.public.project
                    .mainAppProfile({
                        projectHandle: notifProjects[0].handle,
                    })
                    .toString(),
            };
        }
        case "groupedShare": {
            const post = posts[notification.toPostId];
            if (!post) return null;
            const myPost = post.postingProject.projectId === userInfo.projectId;

            const firstAttachment = getFirstAttachment(post);

            // we only grab the first 60 characters b/c our max view width is `60ch`
            // this just helps keep the DOM a little bit smaller
            let summary =
                renderPostSummary(post, { myPost }) ||
                t("client:notifications.empty-post-summary", "[no text]");
            if (summary.length > 60) {
                summary = summary.slice(0, 60) + "…";
            }

            const expandedUrls = new Map<ProjectId, string>();
            Object.values(posts).forEach((post) => {
                expandedUrls.set(
                    post.postingProject.projectId,
                    post.singlePostPageUrl
                );
            });

            return {
                key: `share-${notification.toPostId}-${JSON.stringify(
                    notification.fromProjectIds
                )}`,
                actionText: myPost
                    ? "group-shared-your-post"
                    : "group-shared-a-share",
                projects: notifProjects,
                type: "groupedShare",
                summaryUrl: post.singlePostPageUrl,
                expandedUrls: expandedUrls,
                summary,
                firstAttachment,
            };
        }
        default:
            return null;
    }
};

export const NotificationViews: FunctionComponent<{
    groupedNotifications: { [dateString: string]: WireNotification[] };
    projects: { [projectId: ProjectId]: WireProjectModel };
    posts: { [postId: PostId]: WirePostViewModel };
    comments: { [commentId: CommentId]: WireNotificationCommentViewModel };
}> = ({ groupedNotifications, posts, projects, comments }) => {
    const { t } = useTranslation();
    const userInfo = useUserInfo();

    return (
        <>
            {Object.keys(groupedNotifications).map((dateString) => {
                const notifs = groupedNotifications[dateString];
                const date = DateTime.fromISO(dateString);

                const notifications = notifs
                    .map<NotificationCardProps | null>((notification) => {
                        if (
                            WireGroupedNotification.safeParse(notification)
                                .success
                        ) {
                            return prepareGroupedNotificationView(
                                notification as WireGroupedNotification,
                                projects,
                                posts,
                                comments,
                                t,
                                userInfo
                            );
                        } else if (
                            WireUngroupedNotification.safeParse(notification)
                                .success
                        ) {
                            return prepareUngroupedNotificationView(
                                notification as WireUngroupedNotification,
                                projects,
                                posts,
                                comments,
                                t,
                                userInfo
                            );
                        } else {
                            return null;
                        }
                    })
                    .filter(isDefined);

                // If we don't have any notifications to show because they were
                // all filtered, skip rendering this group.
                // Otherwise, we get an empty notification group with just a
                // header, which looks Suspicious and/or broken.
                if (!notifications.filter((view) => !!view).length) return null;

                return (
                    <NotificationGroup
                        notifications={notifications}
                        date={date.toJSDate()}
                        key={date.toISO()}
                    />
                );
            })}
        </>
    );
};

type InvalidateNotificationsFunction = () => Promise<void>;

export const NotificationFilterFormInner: FunctionComponent<{
    invalidateNotifications: InvalidateNotificationsFunction;
}> = ({ invalidateNotifications }) => {
    const utils = trpc.useContext();
    const { data } = trpc.notifications.notificationFilters.get.useQuery(
        undefined,
        {
            suspense: true,
        }
    );
    const setNotificationFilters =
        trpc.notifications.notificationFilters.set.useMutation<{
            previousState: NotificationFilters;
        }>({
            onMutate: async (values) => {
                // cancel any pending requests so they don't overwrite our
                // optimistic update
                await utils.notifications.notificationFilters.get.cancel();

                // snapshot the previous value
                const previousState =
                    utils.notifications.notificationFilters.get.getData() ??
                    NotificationFilters.parse({});

                // optimistic update
                utils.notifications.notificationFilters.get.setData(
                    undefined,
                    NotificationFilters.parse(values)
                );

                return { previousState };
            },
            onError: (err, params, context) => {
                // mutation failed, reset back to the previous state
                utils.notifications.notificationFilters.get.setData(
                    undefined,
                    NotificationFilters.parse(context?.previousState)
                );
            },
            onSettled: async () => {
                // refetch so we know we're For Sure accurate
                await utils.notifications.notificationFilters.get.invalidate();

                await invalidateNotifications();
            },
        });

    const filterSettings = data ?? NotificationFilters.parse({});

    return (
        <>
            <li>
                <label className="flex items-center justify-between gap-3 px-3 py-2 font-bold">
                    likes
                    <input
                        type="checkbox"
                        className="rounded-checkbox"
                        checked={filterSettings.includeLikes}
                        onChange={(e) => {
                            setNotificationFilters.mutate({
                                ...filterSettings,
                                includeLikes: e.target.checked,
                            });
                        }}
                        disabled={setNotificationFilters.isLoading}
                    />
                </label>
            </li>
            <li>
                <label className="flex items-center justify-between gap-3 px-3 py-2 font-bold">
                    shares
                    <input
                        type="checkbox"
                        className="rounded-checkbox"
                        checked={filterSettings.includeShares}
                        onChange={(e) => {
                            setNotificationFilters.mutate({
                                ...filterSettings,
                                includeShares: e.target.checked,
                            });
                        }}
                        disabled={setNotificationFilters.isLoading}
                    />
                </label>
            </li>
            <li>
                <label className="flex items-center justify-between gap-3 px-3 py-2 font-bold">
                    replies
                    <input
                        type="checkbox"
                        className="rounded-checkbox"
                        checked={filterSettings.includeReplies}
                        onChange={(e) => {
                            setNotificationFilters.mutate({
                                ...filterSettings,
                                includeReplies: e.target.checked,
                            });
                        }}
                        disabled={setNotificationFilters.isLoading}
                    />
                </label>
            </li>
            <li>
                <label className="flex items-center justify-between gap-3 px-3 py-2 font-bold">
                    comments
                    <input
                        type="checkbox"
                        className="rounded-checkbox"
                        checked={filterSettings.includeComments}
                        onChange={(e) => {
                            setNotificationFilters.mutate({
                                ...filterSettings,
                                includeComments: e.target.checked,
                            });
                        }}
                        disabled={setNotificationFilters.isLoading}
                    />
                </label>
            </li>
            <li>
                <label className="flex items-center justify-between gap-3 px-3 py-2 font-bold">
                    follows
                    <input
                        type="checkbox"
                        className="rounded-checkbox"
                        checked={filterSettings.includeFollows}
                        onChange={(e) => {
                            setNotificationFilters.mutate({
                                ...filterSettings,
                                includeFollows: e.target.checked,
                            });
                        }}
                        disabled={setNotificationFilters.isLoading}
                    />
                </label>
            </li>
        </>
    );
};
