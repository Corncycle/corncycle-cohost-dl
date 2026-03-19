import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import ProjectPostFeed, { ProjectPostFeedProps } from "./project-post-feed";

export const SilencedPostFeed: FunctionComponent<ProjectPostFeedProps> = (
    props
) => (
    <>
        <Helmet title={`silenced posts`} />
        <ProjectPostFeed {...props}>
            <h1 className="mb-6 text-3xl font-bold text-bgText">
                silenced posts
            </h1>
        </ProjectPostFeed>
    </>
);

export default SilencedPostFeed;
SilencedPostFeed.displayName = "silenced-post-feed";
