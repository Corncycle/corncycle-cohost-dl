import { z } from "zod";

export const FeatureFlag = z.enum([
    // tumblr theme
    "chaos-day-2022",
    // Numbers
    "chaos-day-2023",
    "disable-account-signup",
    "notifications-trpc",
    "attachment-composer-v2",

    // artist alley
    "artist-alley-listings",

    // user-facing UI for submitting tag relation requests
    "tag-relation-request-ui",
]);
export type FeatureFlag = z.infer<typeof FeatureFlag>;
