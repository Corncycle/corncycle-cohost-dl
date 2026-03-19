import { trpc } from "@/client/lib/trpc";
import { useDisplayPrefs } from "@/client/preact/hooks/use-display-prefs";
import { useQueryState } from "@/client/preact/hooks/use-query-state";
import { ProjectHandle } from "@/shared/types/ids";
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useTransition,
} from "react";
import RenderIfVisible from "react-render-if-visible";
import { PostPreview } from "../../posts/post-preview";
import PaginationEggs from "../pagination-eggs";

export const PaginatedProfilePostFeed: FunctionComponent<{
    handle: ProjectHandle;
    viewingOnProjectPage?: boolean;
    keepPreviousData?: boolean;
    pinnedPostsAtTop: boolean;
    hideReplies: boolean;
    hideShares: boolean;
    hideAsks: boolean;
    startingPageNumber?: number;
}> = ({
    handle,
    pinnedPostsAtTop,
    hideReplies,
    hideShares,
    hideAsks,
    viewingOnProjectPage = false,
    keepPreviousData = true,
    startingPageNumber = 0,
}) => {
    const displayPrefs = useDisplayPrefs();
    const [_inTransition, startTransition] = useTransition();
    const [pageString, setPage] = useQueryState(
        "page",
        startingPageNumber.toString()
    );
    const page = parseInt(pageString ?? "0") || 0;

    const fetchedPosts = trpc.posts.profilePosts.useQuery(
        {
            projectHandle: handle,
            page,
            options: {
                pinnedPostsAtTop,
                hideReplies,
                hideShares,
                hideAsks,
                viewingOnProjectPage,
            },
        },
        {
            suspense: true,
            keepPreviousData,
        }
    );

    const hasNextPage = useMemo(() => {
        return (
            fetchedPosts.data?.pagination.nextPage !== null &&
            fetchedPosts.data?.pagination.nextPage !== undefined
        );
    }, [fetchedPosts.data?.pagination.nextPage]);

    const hasPreviousPage = useMemo(() => {
        return (
            fetchedPosts.data?.pagination.previousPage !== null &&
            fetchedPosts.data?.pagination.previousPage !== undefined
        );
    }, [fetchedPosts.data?.pagination.previousPage]);

    const previousPage = useCallback(() => {
        const previousPageNum = fetchedPosts.data?.pagination.previousPage;
        if (previousPageNum !== null && previousPageNum !== undefined) {
            startTransition(() => {
                setPage(previousPageNum.toString());
            });
        }
    }, [fetchedPosts.data?.pagination.previousPage, setPage]);

    const nextPage = useCallback(() => {
        const nextPageNum = fetchedPosts.data?.pagination.nextPage;
        if (nextPageNum !== null && nextPageNum !== undefined) {
            startTransition(() => {
                setPage(nextPageNum.toString());
            });
        }
    }, [fetchedPosts.data?.pagination.nextPage, setPage]);

    const onClickPrevious = useMemo(() => {
        if (hasPreviousPage) return () => previousPage();
    }, [hasPreviousPage, previousPage]);
    const previousHref = useMemo(() => {
        if (hasPreviousPage) return "#";
    }, [hasPreviousPage]);
    const onClickNext = useMemo(() => {
        if (hasNextPage) return () => nextPage();
    }, [hasNextPage, nextPage]);
    const nextHref = useMemo(() => {
        if (hasNextPage) return "#";
    }, [hasNextPage]);

    // for cohost reader: reset to the top of pagination if we switch projects
    useEffect(() => {
        setPage(startingPageNumber.toString());
    }, [handle]);

    return (
        <div className="mt-4 flex w-fit flex-col gap-4">
            {fetchedPosts.data?.posts.map((post, index) => {
                return (
                    <RenderIfVisible
                        key={post.postId}
                        initialVisible={index < 4}
                        stayRendered={true}
                    >
                        <PostPreview
                            viewModel={post}
                            highlightedTags={[]}
                            condensed={true}
                            skipCollapse={false}
                            displayPrefs={displayPrefs}
                            commentThreads={undefined}
                        />
                    </RenderIfVisible>
                );
            })}
            <div className="max-w-prose">
                <PaginationEggs
                    condensed={true}
                    backOnClick={onClickPrevious}
                    backLink={previousHref}
                    forwardLink={nextHref}
                    forwardOnClick={onClickNext}
                />
            </div>
        </div>
    );
};
