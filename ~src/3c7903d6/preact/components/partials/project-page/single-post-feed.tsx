import { trpc } from "@/client/lib/trpc";
import { useDisplayPrefs } from "@/client/preact/hooks/use-display-prefs";
import { PostId, ProjectHandle } from "@/shared/types/ids";
import React, { FunctionComponent, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PostPreview } from "../../posts/post-preview";
import { PostOpenGraph } from "../opengraph";

export const SinglePostFeed: FunctionComponent<{
    handle: ProjectHandle;
    postId: PostId;
    nonce?: string;
}> = ({ handle, postId, nonce }) => {
    const displayPrefs = useDisplayPrefs();

    const fetchedPost = trpc.posts.singlePost.useQuery(
        {
            handle,
            postId,
            nonce,
        },
        {
            suspense: true,
        }
    );

    const pageTitle = useMemo(() => {
        if (fetchedPost.data?.post.headline) {
            return `"${fetchedPost.data.post.headline}"`;
        }

        return `post from @${
            fetchedPost.data?.post.postingProject.handle ?? "unknown"
        }`;
    }, [
        fetchedPost.data?.post.headline,
        fetchedPost.data?.post.postingProject.handle,
    ]);

    if (!fetchedPost.data) {
        return null;
    }

    return (
        <>
            <Helmet title={pageTitle} />
            <div className="mt-4 flex flex-col gap-4">
                <PostOpenGraph viewModel={fetchedPost.data.post} />
                <PostPreview
                    viewModel={fetchedPost.data.post}
                    highlightedTags={[]}
                    condensed={true}
                    skipCollapse={true}
                    showThreadCollapser={false}
                    displayPrefs={displayPrefs}
                    commentThreads={fetchedPost.data.comments}
                />
            </div>
        </>
    );
};
