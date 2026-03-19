import z from "zod";

export const HomeView = z.enum(["dashboard", "following"]);
export type HomeView = z.infer<typeof HomeView>;

export const PostBoxTheme = z.enum(["light", "dark"]);
export type PostBoxTheme = z.infer<typeof PostBoxTheme>;

export const PostBoxThemeSetting = PostBoxTheme.or(
    z.enum(["prefers-color-scheme"])
);
export type PostBoxThemeSetting = z.infer<typeof PostBoxThemeSetting>;

export const DisplayPrefs = z.object({
    isAdult: z.boolean().default(false),
    explicitlyCollapseAdultContent: z.boolean().default(false),
    collapseLongThreads: z.boolean().default(false),
    gifsStartPaused: z.boolean().default(true),
    pauseProfileGifs: z.boolean().default(false),
    disableEmbeds: z.boolean().default(false),
    externalLinksInNewTab: z.boolean().default(true),
    enableNotificationCount: z.boolean().default(false),
    autoexpandCWs: z.array(z.string()).default([]),
    collapsedTags: z.array(z.string()).default([]),
    suggestedFollowsDismissed: z.boolean().default(false),
    enableMobileQuickShare: z.boolean().default(true),
    beatsTimestamps: z.boolean().default(false),
    autoExpandAllCws: z.boolean().default(false),
    disableModalPostComposer: z.boolean().default(false),
    homeView: HomeView.default("dashboard"),
    defaultShow18PlusPostsInSearches: z.boolean().default(true),
    defaultPostBoxTheme: PostBoxThemeSetting.default("prefers-color-scheme"),
    previewFeatures_lexicalPostEditor: z.boolean().default(true),
    // chaos day 2023 specific
    chaosDay2023_showNumbers: z.boolean().default(true),
});

export type DisplayPrefs = z.infer<typeof DisplayPrefs>;
