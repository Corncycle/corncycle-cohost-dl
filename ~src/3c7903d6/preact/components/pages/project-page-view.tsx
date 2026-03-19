import ProfileView from "@/client/preact/components/partials/profile-view";
import sitemap from "@/shared/sitemap";
import { AccessFlags } from "@/shared/types/access-result";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryState } from "../../hooks/use-query-state";
import { ProjectOpenGraph } from "../partials/opengraph";
import ProfileViewFilterControls from "../partials/profile-view-filter-controls";
import { PaginatedProfilePostFeed } from "../partials/project-page/paginated-profile-post-feed";

type ProjectPageViewProps = {
    project: WireProjectModel;
    canAccessPermissions: AccessFlags;
    startingPageNumber: number;
};

const ProjectPageView: FunctionComponent<ProjectPageViewProps> = (props) => {
    const [hideRepliesString, setHideReplies] = useQueryState(
        "hideReplies",
        false.toString()
    );
    const hideReplies = hideRepliesString === "true";
    const [hideSharesString, setHideShares] = useQueryState(
        "hideShares",
        false.toString()
    );
    const hideShares = hideSharesString === "true";
    const [hideAsksString, setHideAsks] = useQueryState(
        "hideAsks",
        false.toString()
    );
    const hideAsks = hideAsksString === "true";

    return (
        <>
            <Helmet title={`@${props.project.handle}`}>
                <link
                    rel="alternate"
                    title={`@${props.project.handle} on cohost`}
                    type="application/feed+json"
                    href={sitemap.public.project.rss
                        .publicJson({
                            projectHandle: props.project.handle,
                        })
                        .toString()}
                />
                <link
                    rel="alternate"
                    title={`@${props.project.handle} on cohost`}
                    type="application/atom+xml"
                    href={sitemap.public.project.rss
                        .publicAtom({
                            projectHandle: props.project.handle,
                        })
                        .toString()}
                />
            </Helmet>
            <div className="container mx-auto flex flex-grow flex-col">
                <ProfileView {...props}>
                    <ProjectOpenGraph project={props.project} />
                    <ProfileViewFilterControls
                        hideReplies={hideReplies}
                        hideShares={hideShares}
                        hideAsks={hideAsks}
                        setHideReplies={(value) =>
                            setHideReplies(value.toString())
                        }
                        setHideShares={(value) =>
                            setHideShares(value.toString())
                        }
                        setHideAsks={(value) => setHideAsks(value.toString())}
                    />
                    <PaginatedProfilePostFeed
                        handle={props.project.handle}
                        viewingOnProjectPage={true}
                        pinnedPostsAtTop={true}
                        hideReplies={hideReplies}
                        hideShares={hideShares}
                        hideAsks={hideAsks}
                        startingPageNumber={props.startingPageNumber}
                    />
                </ProfileView>
            </div>
        </>
    );
};

export default ProjectPageView;
ProjectPageView.displayName = "project-page-view";
