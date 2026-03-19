export type RenderingContext =
    | "activitypub"
    | "ask"
    | "comment"
    | "email"
    | "post"
    | "profile"
    | "rss"
    | "artistAlley"
    | null;

export type RenderingOptions = {
    /** the context in which this content is being rendered */
    renderingContext: RenderingContext;
    /**
     * whether or not the posting user has cohost plus (currently determines
     * emoji rendering behavior)
     */
    hasCohostPlus: boolean;
    /** disable rendering iframely embeds */
    disableEmbeds: boolean;
    externalLinksInNewTab: boolean;
};

export const MAX_GFM_LINES = 256;
