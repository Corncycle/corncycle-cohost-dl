import sitemap from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { SwitchButton } from "../elements/switch-button";
import { TimelineSwitch } from "../partials/timeline-switch";
import ProjectPostFeed, { ProjectPostFeedProps } from "./project-post-feed";

export type BookmarkedTagFeedProps = ProjectPostFeedProps & {
    show18PlusPosts: boolean;
};

export const BookmarkedTagFeed: FunctionComponent<BookmarkedTagFeedProps> = (
    props
) => {
    return (
        <>
            <Helmet title="bookmarked tag feed" />
            <ProjectPostFeed
                {...props}
                queryParams={{ show18PlusPosts: props.show18PlusPosts }}
            >
                <div className="mb-2 flex flex-col items-center lg:flex-row">
                    {/* avatar spacer on desktop */}
                    <span className="hidden w-[5.5em] lg:block" />
                    <TimelineSwitch
                        tabs={[
                            {
                                label: "latest posts",
                                href: sitemap.public.dashboard().toString(),
                            },
                            {
                                label: "bookmarked tags",
                                href: sitemap.public
                                    .bookmarkedTagFeed()
                                    .toString(),
                                active: true,
                            },
                        ]}
                    />
                    <div className="flex-1">&nbsp;</div>
                    <SwitchButton
                        label="show 18+ posts"
                        buttonSize="regular"
                        onChange={() =>
                            location.assign(
                                sitemap.public
                                    .bookmarkedTagFeed({
                                        show18PlusPosts: !props.show18PlusPosts,
                                    })
                                    .toString()
                            )
                        }
                        initial={props.show18PlusPosts}
                    />
                </div>
            </ProjectPostFeed>
        </>
    );
};

export default BookmarkedTagFeed;
BookmarkedTagFeed.displayName = "bookmarked-tag-feed";
