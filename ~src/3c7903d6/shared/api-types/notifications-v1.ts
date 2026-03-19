import { z } from "zod";
import { CommentId, PostId, ProjectId } from "../types/ids";
import {
    WireNotification,
    WireNotificationCommentViewModel,
    WirePostViewModel,
} from "../types/wire-models";
import { WireProjectModel } from "../types/projects";

export const CountResp = z.object({
    count: z.number().int(),
});
export type CountResp = z.infer<typeof CountResp>;

// no zod for this one yet b/c not all the wire types have been converted
export type ListResp = {
    projects: { [projectId: ProjectId]: WireProjectModel };
    posts: { [postId: PostId]: WirePostViewModel };
    comments: {
        [commentId: CommentId]: WireNotificationCommentViewModel;
    };
    notifications: WireNotification[];
    nextBefore: string;
};

export const NotificationFilters = z.object({
    includeShares: z.boolean().default(true),
    includeReplies: z.boolean().default(true),
    includeComments: z.boolean().default(true),
    includeLikes: z.boolean().default(true),
    includeFollows: z.boolean().default(true),
});

export type NotificationFilters = z.infer<typeof NotificationFilters>;

export const NotificationsListRespReady = z.object({
    ready: z.literal(true),
    projects: z.record(z.string(), WireProjectModel),
    posts: z.record(z.string(), WirePostViewModel),
    comments: z.record(CommentId, WireNotificationCommentViewModel),
    notifications: z.array(WireNotification),
    nextCursor: z.string(),
});
export type NotificationsListRespReady = z.infer<
    typeof NotificationsListRespReady
>;

export function isNotificationsListRespReady(
    resp: NotificationsListRespReady | { ready: false }
): resp is NotificationsListRespReady {
    return resp.ready === true;
}
