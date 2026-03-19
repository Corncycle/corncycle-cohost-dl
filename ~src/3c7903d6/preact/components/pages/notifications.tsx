import { trpc } from "@/client/lib/trpc";
import {
    NotificationsListRespReady,
    isNotificationsListRespReady,
} from "@/shared/api-types/notifications-v1";
import { CommentId, PostId, ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import {
    WireNotification,
    WireNotificationCommentViewModel,
    WirePostViewModel,
} from "@/shared/types/wire-models";
import { DateTime } from "luxon";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSSR } from "../../hooks/is-server";
import { AuthnButton } from "../partials/authn-button";
import {
    NotificationFilterFormInner,
    NotificationViews,
} from "../partials/notifications/shared-lib";
import { SidebarMenu } from "../sidebar-menu";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { InfoBox } from "../elements/info-box";

import eggbox from "@/client/images/eggbox.png";
import sitemap from "@/shared/sitemap";
import { ResponsiveFormlet } from "../elements/responsive-formlet";

const PAGE_SIZE = 40;

const NotificationsPage: FunctionComponent = () => {
    const { data, hasNextPage, fetchNextPage, isLoading } =
        trpc.notifications.list.useInfiniteQuery(
            {
                limit: PAGE_SIZE,
            },
            {
                suspense: true,
                staleTime: Infinity,
                keepPreviousData: true,
                refetchInterval: (query) => {
                    const isReady =
                        query?.pages.some(isNotificationsListRespReady) ??
                        false;
                    return isReady ? Infinity : 5 * 1000;
                },
                getNextPageParam: (lastPage) => {
                    return lastPage.ready ? lastPage.nextCursor : null;
                },
            }
        );
    const utils = trpc.useContext();

    const { isServer } = useSSR();

    const readyPages = useMemo(
        () => (data ? data.pages : []).filter(isNotificationsListRespReady),
        [data]
    );

    const notifications = useMemo(
        () =>
            readyPages.reduce(
                (collector, curr) => [...collector, ...curr.notifications],
                [] as WireNotification[]
            ),
        [readyPages]
    );

    const comments = useMemo(
        () =>
            readyPages.reduce(
                (collector, curr) => ({ ...collector, ...curr.comments }),
                {} as {
                    [commentId: CommentId]: WireNotificationCommentViewModel;
                }
            ),
        [readyPages]
    );

    const projects = useMemo(
        () =>
            readyPages.reduce(
                (collector, curr) => ({ ...collector, ...curr.projects }),
                {} as { [projectId: ProjectId]: WireProjectModel }
            ),
        [readyPages]
    );

    const posts = useMemo(
        () =>
            readyPages.reduce(
                (collector, curr) => ({ ...collector, ...curr.posts }),
                {} as { [postId: PostId]: WirePostViewModel }
            ),
        [readyPages]
    );

    const groupedNotifications = useMemo(
        () =>
            notifications.reduce<{ [dateString: string]: WireNotification[] }>(
                (collector, notif) => {
                    let notifs: WireNotification[] = [];
                    const date = DateTime.fromISO(notif.createdAt, {
                        zone: isServer ? "UTC" : "local",
                    }).toISODate();
                    if (collector[date]) {
                        notifs = collector[date];
                    }

                    notifs.push(notif);
                    return {
                        ...collector,
                        [date]: notifs,
                    };
                },
                {}
            ),
        [isServer, notifications]
    );

    const isReady = readyPages.length > 0;

    const invalidateNotifications = useCallback(() => {
        return utils.notifications.list.invalidate();
    }, [utils.notifications.list]);

    const postBoxTheme = useDynamicTheme();

    return (
        <>
            <Helmet title="notifications" />
            <main className="w-full pb-20 pt-8 lg:pt-16">
                <div className="container mx-auto grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-4">
                    <SidebarMenu />

                    <div className="lg:order-3">
                        <ResponsiveFormlet title="notification filters">
                            <NotificationFilterFormInner
                                invalidateNotifications={
                                    invalidateNotifications
                                }
                            />
                        </ResponsiveFormlet>
                    </div>

                    <section className="col-span-1 flex flex-col gap-8 lg:col-span-2">
                        {isReady ? (
                            notifications.length > 0 ? (
                                <>
                                    <NotificationViews
                                        comments={comments}
                                        groupedNotifications={
                                            groupedNotifications
                                        }
                                        posts={posts}
                                        projects={projects}
                                    />
                                    <AuthnButton
                                        onClick={fetchNextPage}
                                        disabled={isLoading || !hasNextPage}
                                    >
                                        Load More
                                    </AuthnButton>
                                </>
                            ) : (
                                <div
                                    className="co-post-box co-themed-box"
                                    data-theme={postBoxTheme.current}
                                >
                                    <div className="co-prose prose p-3">
                                        <p>
                                            You don’t have any notifications
                                            matching your filters. Switch 'em
                                            up!
                                        </p>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div
                                className="co-post-box co-themed-box"
                                data-theme={postBoxTheme.current}
                            >
                                <div className="co-prose prose p-3">
                                    <h1>
                                        We’re getting your notifications ready!
                                    </h1>
                                    <img
                                        src={sitemap.public.static
                                            .staticAsset({ path: eggbox })
                                            .toString()}
                                        className="mx-auto max-w-sm"
                                        alt="illustration of eggbug shaped like a mailbox"
                                    />
                                    <p>
                                        No need to refresh the page, it’ll
                                        refresh automatically when they’re done.
                                    </p>
                                    <p>
                                        If you’ve been seeing this for over a
                                        few minutes, please e-mail us at{" "}
                                        <a href="mailto:support@cohost.org">
                                            support@cohost.org
                                        </a>{" "}
                                        and we’ll look into it!
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
};

export default NotificationsPage;
