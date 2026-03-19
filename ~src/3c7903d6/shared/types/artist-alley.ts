import { z } from "zod";
import { ArtistAlleyAdId, ISODateString, ProjectId, UserId } from "./ids";

export const ArtistAlleyApprovalStatus = z.enum([
    "approved",
    "pending",
    "rejected",
]);
export type ArtistAlleyApprovalStatus = z.infer<
    typeof ArtistAlleyApprovalStatus
>;

export const ArtistAlleyPaymentStatus = z.enum(["paid", "unpaid", "refunded"]);
export type ArtistAlleyPaymentStatus = z.infer<typeof ArtistAlleyPaymentStatus>;

export const ArtistAlleyAttachment = z.object({
    altText: z.string(),
    attachmentFilename: z.string(),
    ip: z.string(),
});
export type ArtistAlleyAttachment = z.infer<typeof ArtistAlleyAttachment>;

export const ArtistAlleyWireAttachment = z.object({
    altText: z.string(),
    previewURL: z.string().url(),
    fileURL: z.string().url(),
});
export type ArtistAlleyWireAttachment = z.infer<
    typeof ArtistAlleyWireAttachment
>;

export const ArtistAlleyAdultDisplayMode = z.enum(["hide", "include", "only"]);
export type ArtistAlleyAdultDisplayMode = z.infer<
    typeof ArtistAlleyAdultDisplayMode
>;

export const WireArtistAlley = z.object({
    id: ArtistAlleyAdId,
    projectId: ProjectId,
    expiresAt: ISODateString,
    createdAt: ISODateString,
    body: z.string(),
    cta: z.object({
        link: z.string().url(),
        text: z.string(),
    }),
    attachment: ArtistAlleyWireAttachment.nullable(),
    categories: z.array(z.string()),
    adultContent: z.boolean(),
});
export type WireArtistAlley = z.infer<typeof WireArtistAlley>;

export const ModWireArtistAlley = WireArtistAlley.extend({
    userId: UserId,
    status: ArtistAlleyApprovalStatus,
    paymentStatus: ArtistAlleyPaymentStatus,
    stripeCheckoutSessionId: z.string().nullable(),
    stripePaymentIntentId: z.string().nullable(),
    rejectReason: z.string().nullable(),
    numWeeks: z.number().int(),
    notes: z.string().nullable(),
});
export type ModWireArtistAlley = z.infer<typeof ModWireArtistAlley>;

export const OwnerWireArtistAlley = WireArtistAlley.extend({
    userId: UserId,
    status: ArtistAlleyApprovalStatus,
    paymentStatus: ArtistAlleyPaymentStatus,
    rejectReason: z.string().nullable(),
    numWeeks: z.number().int(),
    notes: z.string().nullable(),
    receiptUrl: z.string().url().nullable(),
});
export type OwnerWireArtistAlley = z.infer<typeof OwnerWireArtistAlley>;
