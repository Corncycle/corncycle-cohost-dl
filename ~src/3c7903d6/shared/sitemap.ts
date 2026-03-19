import { compile } from "path-to-regexp";
import urlParse from "url-parse";
import { env } from "./env";
import {
    ArtistAlleyAdId,
    AskId,
    AttachmentId,
    CommentId,
    InviteId,
    PostId,
    ProjectHandle,
    ProjectId,
    TagId,
    UserId,
} from "./types/ids";

function vhostUrlForProject(projectName: ProjectHandle): URL {
    const baseHost = urlParse(env.HOME_URL).hostname;
    const basePort = urlParse(env.HOME_URL).port;

    if (basePort) {
        return new URL(`https://${projectName}.${baseHost}:${basePort}`);
    } else {
        return new URL(`https://${projectName}.${baseHost}`);
    }
}

export function mainDomain<T extends Record<string, unknown>>(
    path: string,
    args: T
): URL {
    return new URL(compile<T>(path)(args), env.HOME_URL);
}

export function apiV1<T extends Record<string, unknown>>(
    path: string,
    args: T
): URL {
    return new URL(
        `.${compile<T>(path)(args)}`,
        new URL("/api/v1/", env.HOME_URL)
    );
}

export function relationshipAction<T extends Record<string, unknown>>(
    path: string,
    args: T
): URL {
    return new URL(
        `.${compile<T>(path)(args)}`,
        new URL("/rc/relationships/", env.HOME_URL)
    );
}

export function projectSubdomain<T extends { projectHandle: ProjectHandle }>(
    path: string,
    args: T
): URL {
    return new URL(
        compile<T>(path)(args),
        vhostUrlForProject(args.projectHandle)
    );
}

type RefTimestampAndSkipArgs = {
    refTimestamp?: number | undefined;
    skipPosts?: number | undefined;
};

type BeforeAfterLimitArgs = {
    beforeTime?: number | undefined;
    afterTime?: number | undefined;
};

export const patterns = {
    public: {
        home: "/",
        dashboard: "/rc/dashboard",
        welcome: "/rc/welcome",
        login: "/rc/login",
        logout: "/rc/logout",
        signup: "/rc/signup",
        createProject: "/rc/project/create",
        switchProject: "/rc/project/switch",
        settingsMain: "/rc/user/settings",
        silencedPosts: "/rc/user/silenced-posts",
        verifyEmail: "/rc/verify_email",
        cancelVerifyEmail: "/rc/cancel_verify_email",
        resetPassword: "/rc/reset_password",
        staticContent: "/rc/content/:slug",
        search: "/rc/search",
        composePost: "/rc/post/compose",
        redirectToAttachment: "/rc/attachment-redirect/:attachmentId",
        apiV1: {
            createProject: "/project",
            getProject: "/project/:projectHandle",
            updateProject: "/versions",
            getFollowingState: "/project/:projectHandle/following",
            getProjectPosts: "/project/:projectHandle/posts",
            createPost: "/project/:projectHandle/posts",
            updatePost: "/project/:projectHandle/posts/:postId",
            getCommentsForPost: "/project_post/:postId/comments",
            // hit by eggbug.rs
            startAttachment:
                "/project/:projectHandle/posts/:postId/attach/start",
            // hit by eggbug.rs
            finishAttachment:
                "/project/:projectHandle/posts/:postId/attach/finish/:attachmentId",
            redirectToAttachment: "/attachments/:attachmentId",
            changePostState: "/project/:projectHandle/posts/:postId/:operation",
            listEditedProjects: "/projects/edited",
            createComment: "/comments",
            editDeleteComment: "/comments/:commentId",
            register: "/register",
            changePassword: "/change-password",
            requestPasswordReset: "/reset-password",
            /** @deprecated */
            login: "/login",
            /** @deprecated */
            logout: "/logout",
            checkEmail: "/register/check-email",
            projects: {
                followers: "/projects/followers",
            },
            moderation: {
                changeSettings: "/moderation/settings",
                grantOrRevokePermission: "/moderation/permission",
            },
            notifications: {
                list: "/notifications/list",
            },
            reporting: {
                listReasons: "/reporting/reasons",
                reportPost: "/reporting/report-post",
            },
            trpc: "/trpc",
        },
        unleashProxy: "/api/unleash-proxy",
        relationshipAction:
            "/:fromEntityType-:fromEntityId/to-:toEntityType-:toEntityId/:operation",
        tags: "/rc/tagged/:tagSlug",
        bookmarkedTagFeed: "/rc/bookmarks",
        likedPosts: "/rc/liked-posts",
        project: {
            home: "/",
            mainAppProfile: "/:projectHandle",
            profileEdit: "/rc/project/edit",
            followers: "/rc/project/followers",
            following: "/rc/project/following",
            notifications: "/rc/project/notifications",
            followRequests: "/:projectHandle/follow-requests",
            composePost: "/:projectHandle/post/compose",
            editPost: "/:projectHandle/post/:filename/edit",
            singlePost: {
                published: "/:projectHandle/post/:filename",
                unpublished: "/:projectHandle/post/:filename/:draftNonce",
            },
            unpublishedPosts: "/rc/posts/unpublished",
            subdomainTags: "/tagged/:tagSlug",
            tags: "/:projectHandle/tagged/:tagSlug",
            rss: {
                publicRss: "/:projectHandle/rss/public.rss",
                publicAtom: "/:projectHandle/rss/public.atom",
                publicJson: "/:projectHandle/rss/public.json",
            },
            defaultAvatar: "/rc/default-avatar/:projectId.png",
            settings: "/rc/project/settings",
            ask: "/:projectHandle/ask",
            inbox: "/rc/project/inbox",
        },
        invites: {
            manage: "/rc/moderation/invites/manage",
            activate: "/rc/activate",
            create: "/rc/moderation/invites/create",
        },
        moderation: {
            home: "/rc/moderation",
            manageArtistAlleyListing:
                "/rc/moderation/manage-artist-alley-listing",
            manageAsk: "/rc/moderation/manage-ask",
            managePage: "/rc/moderation/manage-project",
            managePost: "/rc/moderation/manage-post",
            manageUser: "/rc/moderation/manage-user",
            cacheMaintenance: "/rc/moderation/cache-maintenance",
            bulkActivate: "/rc/moderation/bulk-activate",
            createOAuthClient: "/rc/moderation/create-oauth-client",
            artistAlleyPendingQueue: "/rc/moderation/artist-alley/pending",
            tagOntology: {
                manageTags: "/rc/moderation/tag-ontology/manage-tags",
                pendingRequests: "/rc/moderation/tag-ontology/pending-requests",
            },
        },
        subscriptions: {
            createCheckoutSession: "/rc/subscriptions/create-checkout-session", // POST
            createPortalSession: "/rc/subscriptions/create-portal-session", // POST,
            success: "/rc/subscriptions/success",
            cancelled: "/rc/subscriptions/cancelled",
        },
        artistAlley: {
            home: "/rc/artist-alley",
            success: "/rc/artist-alley/success/:sessionId",
            cancelled: "/rc/artist-alley/cancelled/:sessionId",
            create: "/rc/artist-alley/create",
            ownerManage: "/rc/artist-alley/manage-listings",
        },
    },
} as const;

export const sitemap = {
    public: {
        home: (args?: {
            refTimestamp: number | undefined;
            skipPosts: number | undefined;
        }) => {
            const url = mainDomain(patterns.public.home, {});

            const params = new URLSearchParams();

            if (args?.refTimestamp !== undefined) {
                params.set("refTimestamp", args.refTimestamp.toString());
            }

            if (args?.skipPosts !== undefined) {
                params.set("skipPosts", args.skipPosts.toString());
            }

            url.search = params.toString();

            return url;
        },
        dashboard: (args?: {
            refTimestamp: number | undefined;
            skipPosts: number | undefined;
        }) => {
            const url = mainDomain(patterns.public.dashboard, {});

            const params = new URLSearchParams();

            if (args?.refTimestamp !== undefined) {
                params.set("refTimestamp", args.refTimestamp.toString());
            }

            if (args?.skipPosts !== undefined) {
                params.set("skipPosts", args.skipPosts.toString());
            }

            url.search = params.toString();

            return url;
        },
        welcome: () => mainDomain(patterns.public.welcome, {}),
        login: (args?: { originalUrl?: string }) => {
            const url = mainDomain(patterns.public.login, {});

            if (args?.originalUrl) {
                const searchParams = new URLSearchParams();
                searchParams.set("originalUrl", args.originalUrl);
                url.search = searchParams.toString();
            }
            return url;
        },
        logout: () => mainDomain(patterns.public.logout, {}),
        signup: () => mainDomain(patterns.public.signup, {}),
        createProject: () => mainDomain(patterns.public.createProject, {}),
        switchProject: () => mainDomain(patterns.public.switchProject, {}),
        userSettings: () => mainDomain(patterns.public.settingsMain, {}),
        silencedPosts: (args: BeforeAfterLimitArgs) => {
            const url = mainDomain(patterns.public.silencedPosts, {});
            const params = new URLSearchParams();

            if (args?.beforeTime !== undefined) {
                params.set("beforeTime", args.beforeTime.toString());
            }

            if (args?.afterTime !== undefined) {
                params.set("afterTime", args.afterTime.toString());
            }

            url.search = params.toString();
            return url;
        },
        verifyEmail: ({ userId, nonce }: { userId: UserId; nonce: string }) => {
            const url = mainDomain(patterns.public.verifyEmail, {});
            url.search = new URLSearchParams({
                userId: userId.toString(),
                nonce,
            }).toString();
            return url;
        },
        cancelVerifyEmail: ({
            userId,
            nonce,
        }: {
            userId: UserId;
            nonce: string;
        }) => {
            const url = mainDomain(patterns.public.cancelVerifyEmail, {});
            url.search = new URLSearchParams({
                userId: userId.toString(),
                nonce,
            }).toString();
            return url;
        },
        redirectToAttachment: (args: { attachmentId: AttachmentId }) =>
            mainDomain(patterns.public.redirectToAttachment, args),
        resetPassword: ({
            email,
            nonce,
        }: {
            email?: string;
            nonce?: string;
        }) => {
            const url = mainDomain(patterns.public.resetPassword, {});
            if (email && nonce) {
                url.search = new URLSearchParams({
                    email,
                    nonce,
                }).toString();
            }
            return url;
        },
        staticContent: (args: { slug: string }) =>
            mainDomain(patterns.public.staticContent, args),
        static: {
            staticAsset: (args: { path: string }) => {
                let path = args.path;
                if (path.startsWith("/srv/release/server/")) {
                    path = path.replace("/srv/release/server/", "/static/");
                }
                return mainDomain(path, {});
            },
        },
        apiV1: {
            createProject: () => apiV1(patterns.public.apiV1.createProject, {}),
            getProject: (args: { projectHandle: ProjectHandle }) =>
                apiV1(patterns.public.apiV1.getProject, args),
            updateProject: () => apiV1(patterns.public.apiV1.updateProject, {}),
            getFollowingState: (args: { projectHandle: ProjectHandle }) =>
                apiV1(patterns.public.apiV1.getFollowingState, args),
            updatePost: (args: {
                projectHandle: ProjectHandle;
                postId: PostId;
            }) => apiV1(patterns.public.apiV1.updatePost, args),
            startAttachment: (args: {
                projectHandle: ProjectHandle;
                postId: PostId;
            }) => apiV1(patterns.public.apiV1.startAttachment, args),
            finishAttachment: (args: {
                projectHandle: ProjectHandle;
                postId: PostId;
                attachmentId: AttachmentId;
            }) => apiV1(patterns.public.apiV1.finishAttachment, args),
            listEditedProjects: () =>
                apiV1(patterns.public.apiV1.listEditedProjects, {}),
            createComment: () => apiV1(patterns.public.apiV1.createComment, {}),
            editDeleteComment: (args: { commentId: CommentId }) =>
                apiV1(patterns.public.apiV1.editDeleteComment, args),
            register: () => apiV1(patterns.public.apiV1.register, {}),
            changePassword: () =>
                apiV1(patterns.public.apiV1.changePassword, {}),
            requestPasswordReset: () =>
                apiV1(patterns.public.apiV1.requestPasswordReset, {}),
            /** @deprecated */
            login: () => apiV1(patterns.public.apiV1.login, {}),
            /** @deprecated */
            logout: () => apiV1(patterns.public.apiV1.logout, {}),
            checkEmail: () => apiV1(patterns.public.apiV1.checkEmail, {}),
            projects: {
                followers: ({
                    offset = 0,
                    limit = 10,
                }: {
                    offset?: number;
                    limit?: number;
                }) => {
                    const url = apiV1(
                        patterns.public.apiV1.projects.followers,
                        {}
                    );
                    url.search = new URLSearchParams({
                        offset: offset.toString(),
                        limit: limit.toString(),
                    }).toString();
                    return url;
                },
            },
            moderation: {
                changeSettings: () =>
                    apiV1(patterns.public.apiV1.moderation.changeSettings, {}),
                grantOrRevokePermission: () =>
                    apiV1(
                        patterns.public.apiV1.moderation
                            .grantOrRevokePermission,
                        {}
                    ),
            },
            reporting: {
                listReasons: () =>
                    apiV1(patterns.public.apiV1.reporting.listReasons, {}),
                reportPost: () =>
                    apiV1(patterns.public.apiV1.reporting.reportPost, {}),
            },
            trpc: () => apiV1(patterns.public.apiV1.trpc, {}),
        },
        unleashProxy: () => mainDomain(patterns.public.unleashProxy, {}),
        relationshipAction: (
            args:
                | {
                      operation: "add-editor" | "remove-editor";
                      fromEntityType: "user";
                      fromEntityId: UserId;
                      toEntityType: "project";
                      toEntityId: ProjectId;
                  }
                | {
                      operation: "like" | "unlike";
                      fromEntityType: "project";
                      fromEntityId: ProjectId;
                      toEntityType: "post";
                      toEntityId: PostId;
                  }
                | {
                      operation:
                          | "follow"
                          | "unfollow"
                          | "create-follow-request"
                          | "accept-follow-request"
                          | "cancel-follow-request"
                          | "mute"
                          | "unmute"
                          | "block"
                          | "unblock";
                      fromEntityType: "project";
                      fromEntityId: ProjectId;
                      toEntityType: "project";
                      toEntityId: ProjectId;
                  }
        ) => relationshipAction(patterns.public.relationshipAction, args),
        tags: (
            args: {
                tagSlug: string;
                show18PlusPosts?: boolean;
            } & RefTimestampAndSkipArgs
        ) => {
            const url = mainDomain(patterns.public.tags, {
                tagSlug: encodeURIComponent(args.tagSlug),
            });

            const params = new URLSearchParams();

            if (args?.show18PlusPosts !== undefined) {
                params.set("show18PlusPosts", args.show18PlusPosts.toString());
            }

            if (args?.refTimestamp !== undefined) {
                params.set("refTimestamp", args.refTimestamp.toString());
            }

            if (args?.skipPosts !== undefined) {
                params.set("skipPosts", args.skipPosts.toString());
            }

            url.search = params.toString();

            return url;
        },
        bookmarkedTagFeed: (
            args?: { show18PlusPosts?: boolean } & BeforeAfterLimitArgs
        ) => {
            const url = mainDomain(patterns.public.bookmarkedTagFeed, {});

            const params = new URLSearchParams();

            if (args?.show18PlusPosts !== undefined) {
                params.set("show18PlusPosts", args.show18PlusPosts.toString());
            }

            if (args?.beforeTime !== undefined) {
                params.set("beforeTime", args.beforeTime.toString());
            }

            if (args?.afterTime !== undefined) {
                params.set("afterTime", args.afterTime.toString());
            }

            url.search = params.toString();

            return url;
        },
        likedPosts: (args: RefTimestampAndSkipArgs) => {
            const url = mainDomain(patterns.public.likedPosts, {});

            const params = new URLSearchParams();

            if (args?.refTimestamp !== undefined) {
                params.set("refTimestamp", args.refTimestamp.toString());
            }

            if (args?.skipPosts !== undefined) {
                params.set("skipPosts", args.skipPosts.toString());
            }

            url.search = params.toString();

            return url;
        },
        composePost: (args: {
            shareOfPostId?: PostId;
            responseToAskId?: AskId;
        }) => {
            const url = mainDomain(patterns.public.composePost, args);

            const params = new URLSearchParams();

            if (args?.shareOfPostId !== undefined) {
                params.set("shareOfPostId", args.shareOfPostId.toString());
            }

            if (args?.responseToAskId !== undefined) {
                params.set("responseToAskId", args.responseToAskId.toString());
            }

            url.search = params.toString();

            return url;
        },
        project: {
            home: (args: { projectHandle: ProjectHandle }) =>
                projectSubdomain(patterns.public.project.home, args),
            mainAppProfile: (args: { projectHandle: ProjectHandle }) =>
                mainDomain(patterns.public.project.mainAppProfile, args),
            profileEdit: () =>
                mainDomain(patterns.public.project.profileEdit, {}),
            followers: () => mainDomain(patterns.public.project.followers, {}),
            following: () => mainDomain(patterns.public.project.following, {}),
            notifications: () =>
                mainDomain(patterns.public.project.notifications, {}),
            followRequests: (args: { projectHandle: ProjectHandle }) =>
                mainDomain(patterns.public.project.followRequests, args),
            composePost: (args: {
                projectHandle: ProjectHandle;
                shareOfPostId?: PostId;
                responseToAskId?: AskId;
            }) => {
                const url = mainDomain(
                    patterns.public.project.composePost,
                    args
                );

                const params = new URLSearchParams();

                if (args?.shareOfPostId !== undefined) {
                    params.set("shareOfPostId", args.shareOfPostId.toString());
                }

                if (args?.responseToAskId !== undefined) {
                    params.set(
                        "responseToAskId",
                        args.responseToAskId.toString()
                    );
                }

                url.search = params.toString();

                return url;
            },
            editPost: (args: {
                projectHandle: ProjectHandle;
                filename: string;
            }) => mainDomain(patterns.public.project.editPost, args),
            singlePost: {
                published: (args: {
                    projectHandle: ProjectHandle;
                    filename: string;
                    commentId?: CommentId;
                }) => {
                    const url = mainDomain(
                        patterns.public.project.singlePost.published,
                        args
                    );
                    if (args.commentId) {
                        url.hash = `comment-${args.commentId}`;
                    }
                    return url;
                },
                unpublished: (args: {
                    projectHandle: ProjectHandle;
                    filename: string;
                    draftNonce: string;
                }) =>
                    mainDomain(
                        patterns.public.project.singlePost.unpublished,
                        args
                    ),
            },
            unpublishedPosts: (args?: RefTimestampAndSkipArgs) => {
                const url = mainDomain(
                    patterns.public.project.unpublishedPosts,
                    {}
                );

                const params = new URLSearchParams();

                if (args?.refTimestamp !== undefined) {
                    params.set("refTimestamp", args.refTimestamp.toString());
                }

                if (args?.skipPosts !== undefined) {
                    params.set("skipPosts", args.skipPosts.toString());
                }

                url.search = params.toString();

                return url;
            },
            ask: (args: { projectHandle: ProjectHandle }) =>
                mainDomain(patterns.public.project.ask, args),
            inbox: () => mainDomain(patterns.public.project.inbox, {}),
            rss: {
                publicRss: (args: {
                    projectHandle: ProjectHandle;
                    page?: number;
                }) => {
                    const url = mainDomain(
                        patterns.public.project.rss.publicRss,
                        args
                    );

                    if (args.page !== undefined) {
                        const params = new URLSearchParams({
                            page: args.page.toString(),
                        });

                        url.search = `?${params.toString()}`;
                    }

                    return url;
                },
                publicAtom: (args: {
                    projectHandle: ProjectHandle;
                    page?: number;
                }) => {
                    const url = mainDomain(
                        patterns.public.project.rss.publicAtom,
                        args
                    );

                    if (args.page !== undefined) {
                        const params = new URLSearchParams({
                            page: args.page.toString(),
                        });

                        url.search = `?${params.toString()}`;
                    }

                    return url;
                },
                publicJson: (args: {
                    projectHandle: ProjectHandle;
                    page?: number;
                }) => {
                    const url = mainDomain(
                        patterns.public.project.rss.publicJson,
                        args
                    );

                    if (args.page !== undefined) {
                        const params = new URLSearchParams({
                            page: args.page.toString(),
                        });

                        url.search = `?${params.toString()}`;
                    }

                    return url;
                },
            },
            tags: (
                args: {
                    projectHandle: ProjectHandle;
                    tagSlug: string;
                } & RefTimestampAndSkipArgs
            ) => {
                const url = mainDomain(patterns.public.project.tags, {
                    tagSlug: encodeURIComponent(args.tagSlug),
                    projectHandle: args.projectHandle,
                });

                const params = new URLSearchParams();

                if (args?.refTimestamp !== undefined) {
                    params.set("refTimestamp", args.refTimestamp.toString());
                }

                if (args?.skipPosts !== undefined) {
                    params.set("skipPosts", args.skipPosts.toString());
                }

                url.search = params.toString();

                return url;
            },
            defaultAvatar: (args: { projectId: ProjectId }) =>
                mainDomain(patterns.public.project.defaultAvatar, args),
            settings: () => mainDomain(patterns.public.project.settings, {}),
        },
        invites: {
            manage: () => mainDomain(patterns.public.invites.manage, {}),
            activate: (args: { inviteId: InviteId }) => {
                const url = mainDomain(patterns.public.invites.activate, args);

                const params = new URLSearchParams({
                    inviteId: args.inviteId,
                });

                url.search = `?${params.toString()}`;

                return url;
            },
            create: () => mainDomain(patterns.public.invites.create, {}),
        },
        moderation: {
            home: () => mainDomain(patterns.public.moderation.home, {}),
            manageUser: (args: { userId?: UserId; email?: string }) => {
                const url = mainDomain(
                    patterns.public.moderation.manageUser,
                    args
                );

                const params = new URLSearchParams();

                if (args.userId) {
                    params.set("userId", args.userId.toString());
                } else if (args.email) {
                    params.set("email", args.email);
                }

                url.search = `?${params.toString()}`;

                return url;
            },
            managePost: (args: { postId: PostId }) => {
                const url = mainDomain(
                    patterns.public.moderation.managePost,
                    args
                );

                const params = new URLSearchParams({
                    postId: args.postId.toString(),
                });

                url.search = `?${params.toString()}`;

                return url;
            },
            manageProject: (args: { projectHandle?: ProjectHandle }) => {
                const url = mainDomain(
                    patterns.public.moderation.managePage,
                    {}
                );

                if (args.projectHandle) {
                    const params = new URLSearchParams({
                        handle: args.projectHandle,
                    });
                    url.search = `?${params.toString()}`;
                }
                return url;
            },
            manageArtistAlleyListing: (args: { adId: ArtistAlleyAdId }) => {
                const url = mainDomain(
                    patterns.public.moderation.manageArtistAlleyListing,
                    {}
                );

                const params = new URLSearchParams({
                    adId: args.adId,
                });
                url.search = `?${params.toString()}`;

                return url;
            },
            cacheMaintenance: () =>
                mainDomain(patterns.public.moderation.cacheMaintenance, {}),
            bulkActivate: () =>
                mainDomain(patterns.public.moderation.bulkActivate, {}),
            createOAuthClient: () =>
                mainDomain(patterns.public.moderation.createOAuthClient, {}),
            manageAsk: (args: { askId?: AskId }) => {
                const url = mainDomain(
                    patterns.public.moderation.manageAsk,
                    {}
                );

                if (args.askId) {
                    const params = new URLSearchParams({
                        askId: args.askId,
                    });
                    url.search = `?${params.toString()}`;
                }
                return url;
            },
            artistAlleyPendingQueue: () =>
                mainDomain(
                    patterns.public.moderation.artistAlleyPendingQueue,
                    {}
                ),
            tagOntology: {
                manageTags: () =>
                    mainDomain(
                        patterns.public.moderation.tagOntology.manageTags,
                        {}
                    ),
                pendingRequests: () =>
                    mainDomain(
                        patterns.public.moderation.tagOntology.pendingRequests,
                        {}
                    ),
            },
        },
        subscriptions: {
            createCheckoutSession: () =>
                mainDomain(
                    patterns.public.subscriptions.createCheckoutSession,
                    {}
                ),
            createPortalSession: () =>
                mainDomain(
                    patterns.public.subscriptions.createPortalSession,
                    {}
                ),
            success: (args: { sessionId: string }) => {
                const url = mainDomain(
                    patterns.public.subscriptions.success,
                    {}
                );

                const params = new URLSearchParams({
                    sessionId: args.sessionId,
                });
                url.search = `?${params.toString()}`;

                return url;
            },
            cancelled: (args: { sessionId: string }) => {
                const url = mainDomain(
                    patterns.public.subscriptions.cancelled,
                    {}
                );

                const params = new URLSearchParams({
                    sessionId: args.sessionId,
                });
                url.search = `?${params.toString()}`;

                return url;
            },
            manage: () => {
                const url = sitemap.public.userSettings();
                url.hash = "cohost-plus";
                return url;
            },
        },
        search: (args: { query?: string } = {}) => {
            const url = mainDomain(patterns.public.search, {});

            if (args.query) {
                const params = new URLSearchParams({
                    q: args.query,
                });
                url.search = `?${params.toString()}`;
            }
            return url;
        },
        artistAlley: {
            home: () => mainDomain(patterns.public.artistAlley.home, {}),
            success: (args: { sessionId: string }) => {
                return mainDomain(patterns.public.artistAlley.success, args);
            },
            cancelled: (args: { sessionId: string }) => {
                return mainDomain(patterns.public.artistAlley.cancelled, args);
            },
            create: () => mainDomain(patterns.public.artistAlley.create, {}),
            ownerManage: () =>
                mainDomain(patterns.public.artistAlley.ownerManage, {}),
        },
    },
} as const;

export default sitemap;
