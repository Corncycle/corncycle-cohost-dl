import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";
import { PostComposer as PostComposerV1 } from "./v1/post-composer";
import { PostComposer as PostComposerV2 } from "./v2/post-composer";
import { PostComposerProps } from "./api";
import { trpc } from "@/client/lib/trpc";
import { PostId, ProjectHandle, AskId } from "@/shared/types/ids";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import PostPreview from "../posts/post-preview";
import AskInboxPreview from "../partials/ask-inbox-preview";
import { useFlag } from "@unleash/proxy-client-react";
import { store } from "./v2/store";

export const PostComposerContainer: FunctionComponent<PostComposerProps> = (
    props
) => {
    const sharedPost = trpc.posts.singlePost.useQuery(
        {
            // these overrides exist to appease typescript; they shouldn't ever
            // be used in practice since the query is enabled based on if
            // `shareOf` is defined to begin with.
            handle: props.shareOf?.handle ?? ("" as ProjectHandle),
            postId: props.shareOf?.postId ?? (-99999 as PostId),
            skipComments: true,
        },
        {
            suspense: true,
            enabled: !!props.shareOf,
        }
    );

    const ask = trpc.asks.byAskId.useQuery(
        props.responseToAskId ?? ("" as AskId),
        {
            suspense: true,
            enabled: !!props.responseToAskId,
        }
    );

    const displayPrefs = useDisplayPrefs();

    const postComposerV2FeatureFlag = useFlag("attachment-composer-v2");

    const usePostComposerV2 =
        postComposerV2FeatureFlag &&
        displayPrefs.previewFeatures_lexicalPostEditor;

    return (
        <>
            {props.initialPost && props.initialPost.shareOfPostId ? (
                <div className="w-full" data-testid="composer-context">
                    <h1 className="mb-3 text-xl text-bgText">
                        You're editing a reply to this thread:
                    </h1>
                    <PostPreview
                        viewModel={props.initialPost}
                        highlightedTags={[]}
                        showFooter={false}
                        showLastPost={false}
                        showMeatballMenu={false}
                        displayPrefs={displayPrefs}
                    />
                </div>
            ) : null}

            {sharedPost.data ? (
                <div className="w-full" data-testid="composer-context">
                    <h1 className="mb-3 text-xl text-bgText">
                        You're sharing the following post:
                    </h1>
                    <PostPreview
                        viewModel={sharedPost.data.post}
                        highlightedTags={[]}
                        showFooter={false}
                        showLastPost={true}
                        showMeatballMenu={false}
                        displayPrefs={displayPrefs}
                    />
                </div>
            ) : null}

            {ask.data ? (
                <div className="w-full" data-testid="composer-context">
                    <h1 className="mb-3 text-xl text-bgText">
                        You're responding to the following ask:
                    </h1>
                    <AskInboxPreview ask={ask.data} />
                </div>
            ) : null}

            {usePostComposerV2 ? (
                // this <Provider> should bubble outward as more of the app
                // gets reduxified.
                <Provider store={store}>
                    <PostComposerV2 {...props} />
                </Provider>
            ) : (
                <PostComposerV1 {...props} />
            )}
        </>
    );
};
