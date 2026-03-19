import { PostPreview } from "@/client/preact/components/posts/post-preview";
import { ProjectHandle } from "@/shared/types/ids";
import { WirePostViewModel } from "@/shared/types/wire-models";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import loadable from "@loadable/component";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import RenderIfVisible from "react-render-if-visible";
import { useCurrentProject } from "../../hooks/data-loaders";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { useModalPostComposer } from "../modal-post-composer-context";
import { NoPostsPlaceholder } from "../partials/no-posts-placeholder";
import {
    PaginationMode,
    ProjectPostFeedPagination,
} from "../partials/project-post-feed-pagination";
import { SidebarMenu } from "../sidebar-menu";

export type ProjectPostFeedProps<TQueryParams = Record<string, never>> = {
    handle?: ProjectHandle;
    posts: WirePostViewModel[];
    highlightedTags: readonly string[];
    paginationMode: PaginationMode;
    noPostsStringId: string;
    children?: React.ReactNode;
    bare?: boolean;
    condensed?: boolean;
    queryParams?: TQueryParams;
};

export const ProjectPostFeed = Object.assign(
    <TQueryParams,>({
        posts,
        highlightedTags,
        paginationMode,
        noPostsStringId,
        children,
        bare,
        condensed,
        queryParams,
    }: ProjectPostFeedProps<TQueryParams>) => {
        const { t } = useTranslation();
        const currentProject = useCurrentProject();
        const displayPrefs = useDisplayPrefs();

        const inner = (
            <>
                {/* TODO: if we have more than one subcomponent we should 
                            do something fancier than this */}
                {children}

                <div className="flex flex-col gap-12">
                    {posts.length > 0 ? (
                        posts.map((post, index) =>
                            post ? (
                                <RenderIfVisible
                                    key={post.postId}
                                    initialVisible={index < 4}
                                    stayRendered={true}
                                >
                                    <PostPreview
                                        viewModel={post}
                                        highlightedTags={highlightedTags}
                                        displayPrefs={displayPrefs}
                                        condensed={condensed}
                                    />
                                </RenderIfVisible>
                            ) : null
                        )
                    ) : (
                        <NoPostsPlaceholder>
                            <DocumentTextIcon className="h-6 w-6" />
                            {t(noPostsStringId)}
                        </NoPostsPlaceholder>
                    )}

                    <ProjectPostFeedPagination
                        paginationMode={paginationMode}
                        postsLength={posts.length}
                        otherQueryParams={queryParams ?? {}}
                    />
                </div>
            </>
        );

        const modalPostComposer = useModalPostComposer();
        useEffect(() => {
            if (currentProject) {
                modalPostComposer.setup({
                    project: currentProject,
                });
            }
        }, [currentProject, modalPostComposer]);

        return bare ? (
            inner
        ) : (
            <main className="w-full lg:pt-16">
                <div className="container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                    <SidebarMenu />
                    <section className="col-span-1 flex flex-col lg:col-span-2">
                        {inner}
                    </section>
                </div>
            </main>
        );
    },
    {
        displayName: "project-post-feed",
    }
);

export default ProjectPostFeed;
