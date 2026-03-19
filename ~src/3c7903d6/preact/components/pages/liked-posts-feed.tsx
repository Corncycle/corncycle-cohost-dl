import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import ProjectPostFeed, { ProjectPostFeedProps } from "./project-post-feed";

export const LikedPostsFeed: FunctionComponent<ProjectPostFeedProps> = (
    props
) => (
    <>
        <Helmet title="posts you've liked" />
        <ProjectPostFeed {...props}></ProjectPostFeed>
    </>
);

export default LikedPostsFeed;
LikedPostsFeed.displayName = "liked-posts-feed";
