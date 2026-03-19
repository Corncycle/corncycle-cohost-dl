import z from "zod";

export enum AttachmentState {
    Pending = 0,
    Finished,
}

export const AttachmentKind = z.enum(["audio", "image"]);
export type AttachmentKind = z.infer<typeof AttachmentKind>;

export const WireAudioAttachmentMetadata = z.object({
    title: z.string().optional(),
    artist: z.string().optional(),
});
export type WireAudioAttachmentMetadata = z.infer<
    typeof WireAudioAttachmentMetadata
>;

export const WireImageAttachmentMetadata = z.object({});
export type WireImageAttachmentMetadata = z.infer<
    typeof WireImageAttachmentMetadata
>;

export const WireAnyAttachmentMetadata = z.union([
    WireAudioAttachmentMetadata,
    WireImageAttachmentMetadata,
]);
export type WireAnyAttachmentMetadata = z.infer<
    typeof WireAnyAttachmentMetadata
>;
