import sitemap from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { useUserInfo } from "../../providers/user-info-provider";
import ProfileView, { type ProfileViewProps } from "../partials/profile-view";
import type { TaggedPostFeedProps } from "./tagged-post-feed";
import ProjectPostFeed, { ProjectPostFeedProps } from "./project-post-feed";

export const ProjectTaggedPostFeed: FunctionComponent<
    Omit<ProjectPostFeedProps, "highlightedTags" | "synonymsAndRelatedTags"> &
        Pick<TaggedPostFeedProps, "synonymsAndRelatedTags"> &
        ProfileViewProps & { tagName: string }
> = (props) => {
    const userInfo = useUserInfo();
    const synonyms = props.synonymsAndRelatedTags.filter(
        (synrel) => synrel.relationship === "synonym"
    );

    return (
        <>
            {/* <Helmet title={`#${props.tagName}`} /> */}
            <ProfileView
                canAccessPermissions={props.canAccessPermissions}
                project={props.project}
            >
                <ProjectPostFeed
                    bare
                    condensed
                    highlightedTags={synonyms.map((syn) => syn.content)}
                    {...props}
                >
                    <div className="mb-12 mt-4 flex flex-col">
                        <h4 className="h4 flex-1 text-bgText">
                            posts from @{props.project.handle} tagged #
                            {props.tagName}
                        </h4>
                        {synonyms.length > 0 ? (
                            <h6 className="h6 flex-1 text-bgText">
                                also:{" "}
                                {synonyms
                                    .filter(
                                        (syn) =>
                                            syn.content.toLowerCase() !==
                                            props.tagName.toLowerCase()
                                    )
                                    .map((syn) => `#${syn.content}`)
                                    .join(", ")}
                            </h6>
                        ) : null}
                        <div>
                            <a
                                href={sitemap.public
                                    .tags({
                                        tagSlug: props.tagName,
                                    })
                                    .toString()}
                                className="text-bgText underline"
                            >
                                view posts from all pages tagged #
                                {props.tagName}
                            </a>
                        </div>
                    </div>
                </ProjectPostFeed>
            </ProfileView>
        </>
    );
};

export default ProjectTaggedPostFeed;
ProjectTaggedPostFeed.displayName = "project-tagged-post-feed";
