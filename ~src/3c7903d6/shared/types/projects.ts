import { z } from "zod";
import { ISODateString, ProjectHandle, ProjectId } from "./ids";

export enum ProjectPrivacy {
    Public = "public",
    Private = "private",
}
export const ProjectPrivacyEnum = z.nativeEnum(ProjectPrivacy);
export type ProjectPrivacyEnum = z.infer<typeof ProjectPrivacyEnum>;

// shout out https://stackoverflow.com/a/61129291
export const ProjectFlag = z.enum([
    "staff",
    "staffMember",
    "friendOfTheSite",
    "noTransparentAvatar",
    "suspended",
    "automated", // used for the bot badge
    "parody", // used for the "un-verified" badge
]);
export type ProjectFlag = z.infer<typeof ProjectFlag>;

// TODO: the DB also supports "all-ages", but this setting doesn't currently
// work because of an NYI access checker upgrade.
export const LoggedOutPostVisibility = z.enum(["public", "none"]);
export type LoggedOutPostVisibility = z.infer<typeof LoggedOutPostVisibility>;

export function isProjectFlag(
    maybeProjectFlag: unknown
): maybeProjectFlag is ProjectFlag {
    return ProjectFlag.safeParse(maybeProjectFlag).success;
}

export const AvatarShape = z.enum([
    "circle",
    "roundrect",
    "squircle",
    "capsule-big",
    "capsule-small",
    "egg",
]);
export type AvatarShape = z.infer<typeof AvatarShape>;

export const ContactCardVisibility = z.enum([
    "public",
    "logged-in",
    "follows",
    "following-you",
]);
export type ContactCardVisibility = z.infer<typeof ContactCardVisibility>;

export const ContactCardRow = z.object({
    service: z.string(),
    value: z.string(),
    visibility: ContactCardVisibility,
});
export type ContactCardRow = z.infer<typeof ContactCardRow>;

export const WireProjectModel = z.object({
    projectId: ProjectId,
    handle: ProjectHandle,
    displayName: z.string(),
    dek: z.string(),
    description: z.string(),
    avatarURL: z.string().url(),
    avatarPreviewURL: z.string().url(),
    headerURL: z.string().url().nullable(),
    headerPreviewURL: z.string().url().nullable(),
    privacy: ProjectPrivacyEnum,
    url: z.string().nullable(),
    pronouns: z.string().nullable(),
    flags: ProjectFlag.array(),
    avatarShape: AvatarShape,
    loggedOutPostVisibility: LoggedOutPostVisibility,
    frequentlyUsedTags: z.string().array(),
    askSettings: z.object({
        enabled: z.boolean(),
        allowAnon: z.boolean(),
        requireLoggedInAnon: z.boolean(),
    }),
    contactCard: ContactCardRow.array(),
    deleteAfter: ISODateString.nullable(),
    isSelfProject: z.boolean().nullable(),
});
export type WireProjectModel = z.infer<typeof WireProjectModel>;

export const WireProjectModelModeratorExtensions = WireProjectModel.extend({
    lastActivityTime: ISODateString.nullable(),
    handleSuspicionResult: z
        .object({
            match: z.string(),
            score: z.number(),
        })
        .nullable(),
});
export type WireProjectModelModeratorExtensions = z.infer<
    typeof WireProjectModelModeratorExtensions
>;

export const ProjectSettings = z
    .object({
        asks: z
            .object({
                enabled: z.boolean().default(false),
                allowAnon: z.boolean().default(false),
                requireLoggedInAnon: z.boolean().default(true),
            })
            .default({}),
    })
    .default({});
export type ProjectSettings = z.infer<typeof ProjectSettings>;
