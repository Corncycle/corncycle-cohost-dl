import { string, z } from "zod";
import { AccessResult, AccessResultEnum } from "./access-result";
import {
    ArtistAlleyAdId,
    AskId,
    AttachmentId,
    CommentId,
    ISODateString,
    InviteId,
    PostId,
    ProjectId,
    RelationshipId,
    UserId,
} from "./ids";
import { StorageBlock, ViewBlock } from "./post-blocks";
import { PostStateEnum } from "./posts";
import { ProjectFlag, WireProjectModel } from "./projects";

// Type data needed for posts on the client
export const WirePostContentCommon = z.object({
    postId: PostId,
    headline: z.string(),
    publishedAt: z.string().optional(),
    filename: z.string(),
    transparentShareOfPostId: PostId.nullable(),
    shareOfPostId: PostId.nullable(),
    state: PostStateEnum,
    numComments: z.number(),
    cws: z.string().array(),
    tags: z.string().array(),
    hasCohostPlus: z.boolean(),
    pinned: z.boolean(),
    commentsLocked: z.boolean(),
    sharesLocked: z.boolean(),
});
export type WirePostContentCommon = z.infer<typeof WirePostContentCommon>;

export const WirePostModel = WirePostContentCommon.extend({
    adultContent: z.boolean(),
    shareOfPostId: PostId.nullable(),
    updatedAt: z.string(),
    blocks: StorageBlock.array(),
    attachments: z
        .object({ attachmentId: AttachmentId, filename: z.string() })
        .array(),
});
export type WirePostModel = z.infer<typeof WirePostModel>;

export const WirePostModelModeratorExtensions = WirePostModel.extend({
    adultContentOverride: z.boolean(),
    projectId: ProjectId,
});
export type WirePostModelModeratorExtensions = z.infer<
    typeof WirePostModelModeratorExtensions
>;

export const Permission = z.enum([
    // allow the user to grant all permissions to any user
    "grant_all_permissions",

    // allow the user to access the moderator UI + view unpublished posts by
    // projects they don't edit + grant the read-only and suspended permissions
    "moderator",

    // prevent the user from doing most things
    "read_only",

    // prevent the user from logging in
    // the inconsistency here is deliberate to avoid breaking existing suspended users
    "suspended",

    // prevent the user from creating new projects
    // only used in instances of extreme username hording
    "no_new_projects",

    // prevent the user from creating new artist alley listings. used in
    // instances of extreme artist alley spam or repeated content violations
    "no_artist_alley",
]);
export type Permission = z.infer<typeof Permission>;

// double declaration required due to a typescript limitation with recursive types
// see: https://github.com/colinhacks/zod#recursive-types
type WireCommentViewModelInternal = {
    comment: {
        commentId: CommentId;
        postedAtISO: string;
        deleted: boolean;
        body: string;
        children: WireCommentViewModelInternal[];
        postId: PostId;
        inReplyTo: CommentId | null;
        hasCohostPlus: boolean;
        hidden: boolean;
    };
    canInteract: AccessResult;
    canEdit: AccessResult;
    canHide: AccessResult;
    poster?: WireProjectModel;
};

export const WireNotificationCommentViewModel = z.object({
    canInteract: AccessResultEnum,
    canEdit: AccessResultEnum,
    canHide: AccessResultEnum,
    comment: z.object({
        body: z.string(),
        children: z.tuple([]),
        commentId: CommentId,
        deleted: z.boolean(),
        postId: PostId,
        postedAtISO: z.string(),
        inReplyTo: CommentId.nullable(),
        hasCohostPlus: z.boolean(),
        hidden: z.boolean(),
    }),
    poster: z.object({
        projectId: ProjectId,
    }),
});
export type WireNotificationCommentViewModel = z.infer<
    typeof WireNotificationCommentViewModel
>;

export const WireCommentViewModel: z.ZodType<WireCommentViewModelInternal> =
    z.lazy(() =>
        z.object({
            comment: z.object({
                commentId: CommentId,
                postedAtISO: ISODateString,
                deleted: z.boolean(),
                body: z.string(),
                children: WireCommentViewModel.array(),
                postId: PostId,
                inReplyTo: CommentId.nullable(),
                hasCohostPlus: z.boolean(),
                hidden: z.boolean(),
            }),
            canInteract: AccessResultEnum,
            canEdit: AccessResultEnum,
            canHide: AccessResultEnum,
            poster: WireProjectModel.optional(),
        })
    );

export type WireCommentViewModel = z.infer<typeof WireCommentViewModel>;

export const WireRenderedPostContent = z.object({
    initial: z.string(),
    expanded: z.string().optional(),
});

export type WireRenderedPostContent = z.infer<typeof WireRenderedPostContent>;

export const LimitedVisibilityReason = z.enum([
    "none",
    "log-in-first",
    "deleted",
    "unpublished",
    "adult-content",
    "blocked",
]);
export type LimitedVisibilityReason = z.infer<typeof LimitedVisibilityReason>;

// rationale for building the post AST this way: originally, the entire post
// shared one AST; this doesn't suffice when attachments can move around.  the
// natural way to break the AST down then is per-block, but an inline HTML tag
// can span multiple blocks, so we need to build spans of contiguous markdown
// blocks as a unit or else HTML's tag auto-insertion rules kick in.
export const PostASTMap = z.object({
    spans: z.array(
        z.object({
            startIndex: z.number(),
            endIndex: z.number(),
            ast: z.string(),
        })
    ),
    readMoreIndex: z.number().nullable(),
});
export type PostASTMap = z.infer<typeof PostASTMap>;

// double declaration required due to a typescript limitation with recursive types
// see: https://github.com/colinhacks/zod#recursive-types
type WirePostViewModelInternal = WirePostContentCommon & {
    blocks: ViewBlock[];

    plainTextBody: string;

    postingProject: WireProjectModel;
    shareTree: WirePostViewModelInternal[];
    numSharedComments: number;
    relatedProjects: WireProjectModel[];
    singlePostPageUrl: string;
    effectiveAdultContent: boolean;
    isEditor: boolean;
    hasAnyContributorMuted: boolean;
    contributorBlockIncomingOrOutgoing: boolean;
    postEditUrl: string;
    isLiked: boolean;
    canShare: boolean;
    canPublish: boolean;
    limitedVisibilityReason: LimitedVisibilityReason;
    astMap: PostASTMap;

    responseToAskId: AskId | null;
};

export const WirePostViewModel: z.ZodType<WirePostViewModelInternal> = z.lazy(
    () =>
        WirePostContentCommon.extend({
            blocks: ViewBlock.array(),
            plainTextBody: z.string(),
            postingProject: WireProjectModel,
            shareTree: WirePostViewModel.array(),
            numSharedComments: z.number(),
            relatedProjects: WireProjectModel.array(),
            singlePostPageUrl: z.string().url(),
            effectiveAdultContent: z.boolean(),
            isEditor: z.boolean(),
            hasAnyContributorMuted: z.boolean(),
            contributorBlockIncomingOrOutgoing: z.boolean(),
            postEditUrl: z.string().url(),
            isLiked: z.boolean(),
            canShare: z.boolean(),
            canPublish: z.boolean(),
            limitedVisibilityReason: LimitedVisibilityReason,
            astMap: PostASTMap,
            responseToAskId: AskId.nullable(),
        })
);
export type WirePostViewModel = z.infer<typeof WirePostViewModel>;

export type WireInviteModel = {
    inviteId: InviteId;
    userActivationsRemaining: number;
    createdAt: string;
    owningUserId: UserId;
};

export const WireUserModel = z.object({
    userId: UserId,
    email: z.string(),
    emailVerified: z.boolean(),
    collapseAdultContent: z.boolean(),
    isAdult: z.boolean(),
    twoFactorEnabled: z.boolean(),
});

export type WireUserModel = z.infer<typeof WireUserModel>;

//#region Notifications
export const WireNotificationType = z.enum([
    "like",
    "comment",
    "share",
    "follow",
    "groupedLike",
    "groupedFollow",
    "groupedShare",
]);
export type WireNotificationType = z.infer<typeof WireNotificationType>;

const BaseWireNotification = z.object({
    type: WireNotificationType,
    createdAt: z.string(),
    fromProjectId: ProjectId,
});

const BaseWireGroupNotification = z.object({
    type: WireNotificationType,
    createdAt: z.string(),
    fromProjectIds: ProjectId.array(),
    oldestCreatedAt: z.string(),
});

const WirePostNotificationCommon = BaseWireNotification.extend({
    toPostId: PostId,
});

const WireGroupPostNotificationCommon = BaseWireGroupNotification.extend({
    toPostId: PostId,
});

export const WireLikeNotification = WirePostNotificationCommon.extend({
    type: z.literal("like"),
    relationshipId: RelationshipId,
});
export type WireLikeNotification = z.infer<typeof WireLikeNotification>;

export const WireGroupedLikeNotification =
    WireGroupPostNotificationCommon.extend({
        type: z.literal("groupedLike"),
        relationshipIds: RelationshipId.array(),
    });
export type WireGroupedLikeNotification = z.infer<
    typeof WireGroupedLikeNotification
>;

export const WireGroupedFollowNotification = BaseWireGroupNotification.extend({
    type: z.literal("groupedFollow"),
});
export type WireGroupedFollowNotification = z.infer<
    typeof WireGroupedFollowNotification
>;

export const WireGroupedShareNotification =
    WireGroupPostNotificationCommon.extend({
        type: z.literal("groupedShare"),
        transparentShare: z.boolean(),
        sharePostIds: PostId.array(),
    });
export type WireGroupedShareNotification = z.infer<
    typeof WireGroupedShareNotification
>;

export const WireCommentNotification = WirePostNotificationCommon.extend({
    type: z.literal("comment"),
    commentId: CommentId,
    inReplyTo: CommentId.nullable(),
});
export type WireCommentNotification = z.infer<typeof WireCommentNotification>;

export const WireShareNotification = WirePostNotificationCommon.extend({
    type: z.literal("share"),
    sharePostId: PostId,
    transparentShare: z.boolean(),
});
export type WireShareNotification = z.infer<typeof WireShareNotification>;

export const WireFollowNotification = BaseWireNotification.extend({
    type: z.literal("follow"),
});
export type WireFollowNotification = z.infer<typeof WireFollowNotification>;

// we don't cache group notifications, so we need a separate type that excludes
// them for redis operations.
export const WireUngroupedNotification = z.discriminatedUnion("type", [
    WireLikeNotification,
    WireCommentNotification,
    WireShareNotification,
    WireFollowNotification,
]);
export type WireUngroupedNotification = z.infer<
    typeof WireUngroupedNotification
>;

export const WireGroupedNotification = z.union([
    WireGroupedLikeNotification,
    WireGroupedFollowNotification,
    WireGroupedShareNotification,
]);
export type WireGroupedNotification = z.infer<typeof WireGroupedNotification>;

export const WireNotification = z.union([
    WireUngroupedNotification,
    WireGroupedNotification,
]);

export type WireNotification = z.infer<typeof WireNotification>;
//#endregion

//#region audit logs
export const AuditLogType = z.enum([
    "edit_comment",
    "delete_comment",
    "edit_post",
    "edit_project_ugc",
    "edit_project_mod_flags",
    "grant_permission",
    "revoke_permission",
    "add_editor",
    "remove_editor",
    "edit_project_flags",
    "edit_user",
    "2fa_login_failed",
    "2fa_reset",
    "2fa_reset_failed",
    "artist_alley_approved",
    "artist_alley_rejected",
    "artist_alley_mod_edited",
]);
export type AuditLogType = z.infer<typeof AuditLogType>;

const BaseWireAuditLogBody = z.object({
    entryId: z.string(),
    loggedAt: z.string(),
});

const TwoFactorAuditLogBody = BaseWireAuditLogBody.extend({
    userId: UserId,
});

const PermissionWireAuditLogBody = BaseWireAuditLogBody.extend({
    userId: UserId,
    permission: Permission,
    changedBy: UserId,
    reason: z.string(),
});

const EditorshipWireAuditLogBody = BaseWireAuditLogBody.extend({
    projectId: ProjectId,
    userId: UserId,
    changedBy: UserId,
    reason: z.string(),
});

const EditProjectModFlagsAuditLogBody = BaseWireAuditLogBody.extend({
    projectId: ProjectId,
    oldAdultContent: z.boolean(),
    oldAdultContentOverride: z.boolean(),
    newAdultContent: z.boolean(),
    newAdultContentOverride: z.boolean(),
    changedBy: UserId,
    reason: z.string(),
});

const EditProjectFlagsAuditLogBody = BaseWireAuditLogBody.extend({
    projectId: ProjectId,
    changedBy: UserId,
    reason: z.string(),
    oldFlags: ProjectFlag.array(),
    newFlags: ProjectFlag.array(),
});

const EditUserAuditLogBody = BaseWireAuditLogBody.extend({
    userId: UserId,
    oldEmail: z.string(),
    newEmail: z.string(),
    oldPendingEmail: z.string().nullable(),
    newPendingEmail: z.string().nullable(),
    oldUsername: z.string(),
    newUsername: z.string(),
});

const EditPostAuditLogBody = BaseWireAuditLogBody.extend({
    postId: PostId,
    oldHeadline: z.string(),
    newHeadline: z.string(),
    oldBlocks: StorageBlock.array(),
    newBlocks: StorageBlock.array(),
    oldState: PostStateEnum,
    newState: PostStateEnum,
    oldAdultContent: z.boolean().optional(), // types added later, missing from old audit logs
    newAdultContent: z.boolean().optional(),
    oldAdultContentOverride: z.boolean().optional(),
    newAdultContentOverride: z.boolean().optional(),
    oldCws: z.string().array().optional(),
    newCws: z.string().array().optional(),
    oldCommentsLocked: z.boolean().optional(),
    newCommentsLocked: z.boolean().optional(),
});

export const WireAuditLogEntryTypes = {
    edit_comment: BaseWireAuditLogBody.extend({
        logType: z.literal("edit_comment"),
    }),
    delete_comment: BaseWireAuditLogBody.extend({
        logType: z.literal("delete_comment"),
    }),
    grant_permission: PermissionWireAuditLogBody.extend({
        logType: z.literal("grant_permission"),
    }),
    revoke_permission: PermissionWireAuditLogBody.extend({
        logType: z.literal("revoke_permission"),
    }),
    edit_post: EditPostAuditLogBody.extend({
        logType: z.literal("edit_post"),
    }),
    edit_project_ugc: BaseWireAuditLogBody.extend({
        logType: z.literal("edit_project_ugc"),
    }),
    edit_project_mod_flags: EditProjectModFlagsAuditLogBody.extend({
        logType: z.literal("edit_project_mod_flags"),
    }),
    add_editor: EditorshipWireAuditLogBody.extend({
        logType: z.literal("add_editor"),
    }),
    remove_editor: EditorshipWireAuditLogBody.extend({
        logType: z.literal("remove_editor"),
    }),
    edit_project_flags: EditProjectFlagsAuditLogBody.extend({
        logType: z.literal("edit_project_flags"),
    }),
    edit_user: EditUserAuditLogBody.extend({
        logType: z.literal("edit_user"),
    }),
    "2fa_login_failed": TwoFactorAuditLogBody.extend({
        logType: z.literal("2fa_login_failed"),
    }),
    "2fa_reset": TwoFactorAuditLogBody.extend({
        logType: z.literal("2fa_reset"),
    }),
    "2fa_reset_failed": TwoFactorAuditLogBody.extend({
        logType: z.literal("2fa_reset_failed"),
    }),
    artist_alley_approved: BaseWireAuditLogBody.extend({
        logType: z.literal("artist_alley_approved"),
        listingId: ArtistAlleyAdId,
        changedBy: UserId,
    }),
    artist_alley_rejected: BaseWireAuditLogBody.extend({
        logType: z.literal("artist_alley_rejected"),
        listingId: ArtistAlleyAdId,
        changedBy: UserId,
        rejectionReason: z.string(),
    }),
    artist_alley_mod_edited: BaseWireAuditLogBody.extend({
        logType: z.literal("artist_alley_mod_edited"),
        listingId: ArtistAlleyAdId,
        changedBy: UserId,
    }),
} as const;

export type WireAuditLogEntryTypes = {
    [t in keyof typeof AuditLogType.enum]: z.infer<
        (typeof WireAuditLogEntryTypes)[t]
    >;
};

export const WireAuditLogEntry = z.discriminatedUnion("logType", [
    WireAuditLogEntryTypes.edit_comment,
    WireAuditLogEntryTypes.delete_comment,
    WireAuditLogEntryTypes.grant_permission,
    WireAuditLogEntryTypes.revoke_permission,
    WireAuditLogEntryTypes.edit_post,
    WireAuditLogEntryTypes.edit_project_ugc,
    WireAuditLogEntryTypes.add_editor,
    WireAuditLogEntryTypes.remove_editor,
]);

export type WireAuditLogEntry = z.infer<typeof WireAuditLogEntry>;
//#endregion audit logs

export const SubscriptionStatus = z.enum([
    "active",
    "past_due",
    "unpaid",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "trialing",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const WireSubscription = z.object({
    expirationDate: ISODateString,
    status: SubscriptionStatus,
});
export type WireSubscription = z.infer<typeof WireSubscription>;

export const WirePostComposerSettings = z.object({
    defaultAdultContent: z.boolean(),
    editingPost: WirePostViewModel.optional(),
    // everything below this point is currently unsupported but that may change
    defaultCws: z.string().array(),
    defaultTags: z.string().array(),
});

export const FollowedProjectFeed = z.object({
    projects: z.array(
        z.object({
            project: WireProjectModel,
            projectPinned: z.boolean(),
            latestPost: WirePostViewModel.nullable(),
        })
    ),
    nextCursor: z.number().nullable(),
});
export type FollowedProjectFeed = z.infer<typeof FollowedProjectFeed>;

export const FollowedProjectFeedSortOrder = z.enum([
    "recently-posted",
    "followed-asc",
    "followed-desc",
    "alpha-asc",
    "alpha-desc",
]);
export type FollowedProjectFeedSortOrder = z.infer<
    typeof FollowedProjectFeedSortOrder
>;
