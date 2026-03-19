import { EXTANT_PAGE_LEGAL_REGEX } from "@/shared/username-verifier";
import { DateTime } from "luxon";
import z from "zod";
import { Tagged, refinement } from "./tagged";

const BigIntId = z
    .string()
    .or(z.number().transform((val) => val.toString()))
    .refine((val) => {
        try {
            // BigInt throws on non-integer strings
            const num = BigInt(val);
            return num > BigInt(0);
        } catch (e) {
            return false;
        }
    });

export type AttachmentId = Tagged<string, "AttachmentId">;
export const AttachmentId = z
    .string()
    .uuid()
    .refine(refinement<AttachmentId, string>());

export type PostId = Tagged<number, "PostId">;
export const PostId = z.number().int().refine(refinement<PostId, number>());

export type ProjectId = Tagged<number, "ProjectId">;
export const ProjectId = z
    .number()
    .int()
    .refine(refinement<ProjectId, number>());

export type UserId = Tagged<number, "UserId">;
export const UserId = z.number().int().refine(refinement<UserId, number>());

export type ProjectHandle = Tagged<string, "ProjectHandle">;
export const ProjectHandle = z
    .string()
    // use the old legal regex to prevent tRPC errors with DNS-illegal usernames
    .regex(EXTANT_PAGE_LEGAL_REGEX)
    .refine(refinement<ProjectHandle, string>());

export type CommentId = Tagged<string, "CommentId">;
export const CommentId = z
    .string()
    .uuid()
    .refine(refinement<CommentId, string>());

export type TagId = Tagged<string, "TagId">;
export const TagId = BigIntId.refine(refinement<TagId, string>());

export type InviteId = Tagged<string, "InviteId">;
export const InviteId = z
    .string()
    .uuid()
    .refine(refinement<InviteId, string>());

export type BookmarkId = Tagged<string, "BookmarkId">;
export const BookmarkId = z
    .string()
    .uuid()
    .refine(refinement<BookmarkId, string>());

export type UserNoteId = Tagged<string, "UserNoteId">;
export const InviUserNoteIdteId = z
    .string()
    .uuid()
    .refine(refinement<UserNoteId, string>());

export type OAuthClientId = Tagged<string, "OAuthClientId">;
export const OAuthClientId = z
    .string()
    .uuid()
    .refine(refinement<OAuthClientId, string>());

export const ISODateString = z
    .string()
    .refine((string) => DateTime.fromISO(string).isValid, {
        message: "Not a valid ISO date!",
    });

export type AskId = Tagged<string, "AskId">;
export const AskId = BigIntId.refine(refinement<AskId, string>());

export type RelationshipId = Tagged<string, "RelationshipId">;
export const RelationshipId = BigIntId.refine(
    refinement<RelationshipId, string>()
);

export type OAuthClientSecret = Tagged<string, "OAuthClientSecret">;
export const OAuthClientSecret = z
    .string()
    .refine(refinement<OAuthClientSecret, string>());

export type OAuthAuthorizationCode = Tagged<string, "OAuthAuthorizationCode">;
export const OAuthAuthorizationCode = z
    .string()
    .refine(refinement<OAuthAuthorizationCode, string>());

export type OAuthTokenId = Tagged<string, "OAuthTokenId">;
export const OAuthTokenId = BigIntId.refine(refinement<OAuthTokenId, string>());

export type OAuthAccessToken = Tagged<string, "OAuthAccessToken">;
export const OAuthAccessToken = z
    .string()
    .refine(refinement<OAuthAccessToken, string>());

export type OAuthRefreshToken = Tagged<string, "OAuthRefreshToken">;
export const OAuthRefreshToken = z
    .string()
    .refine(refinement<OAuthRefreshToken, string>());

export type ReaderPinId = Tagged<string, "ReaderPinId">;
export const ReaderPinId = z
    .string()
    .uuid()
    .refine(refinement<ReaderPinId, string>());

export type ArtistAlleyAdId = Tagged<string, "ArtistAlleyAdId">;
export const ArtistAlleyAdId = BigIntId.refine(
    refinement<ArtistAlleyAdId, string>()
);

export type TagRelationId = Tagged<string, "TagRelationId">;
export const TagRelationId = BigIntId.refine(
    refinement<TagRelationRequestId, string>()
);

export type TagRelationRequestId = Tagged<string, "TagRelationRequestId">;
export const TagRelationRequestId = BigIntId.refine(
    refinement<TagRelationRequestId, string>()
);
