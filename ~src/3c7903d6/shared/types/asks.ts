import { z } from "zod";
import { AskId, ISODateString, ProjectHandle, ProjectId } from "./ids";
import { AvatarShape, ProjectFlag, ProjectPrivacyEnum } from "./projects";

export const AskState = z.enum(["pending", "responded", "deleted"]);
export type AskState = z.infer<typeof AskState>;

const FilteredProject = z.object({
    projectId: ProjectId,
    handle: ProjectHandle,
    avatarURL: z.string().url(),
    avatarPreviewURL: z.string().url(),
    privacy: ProjectPrivacyEnum,
    flags: ProjectFlag.array(),
    avatarShape: AvatarShape,
    displayName: z.string(),
});

export const WireAskModel = z.discriminatedUnion("anon", [
    z.object({
        anon: z.literal(true),
        loggedIn: z.boolean(),
        askingProject: z.undefined(),
        askId: AskId,
        content: z.string(),
        sentAt: ISODateString,
    }),
    z.object({
        anon: z.literal(false),
        loggedIn: z.literal(true),
        askingProject: FilteredProject,
        askId: AskId,
        content: z.string(),
        sentAt: ISODateString,
    }),
]);
export type WireAskModel = z.infer<typeof WireAskModel>;

export const WireAskModelModExtensions = WireAskModel.and(
    z.object({
        state: AskState,
    })
);
export type WireAskModelModExtensions = z.infer<
    typeof WireAskModelModExtensions
>;
