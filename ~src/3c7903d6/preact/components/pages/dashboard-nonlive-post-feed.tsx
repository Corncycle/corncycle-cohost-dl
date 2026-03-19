import sitemap from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { TimelineSwitch } from "../partials/timeline-switch";
import ProjectPostFeed, { ProjectPostFeedProps } from "./project-post-feed";

export const DashboardNonlivePostFeed: FunctionComponent<
    ProjectPostFeedProps
> = (props) => (
    <>
        <Helmet />
        <ProjectPostFeed {...props}>
            <div className="mb-2 flex flex-row items-center">
                {/* avatar spacer on desktop */}
                <span className="hidden w-[5.5em] lg:block" />
                <TimelineSwitch
                    tabs={[
                        {
                            label: "latest posts",
                            href: sitemap.public.dashboard().toString(),
                            active: true,
                        },
                        {
                            label: "bookmarked tags",
                            href: sitemap.public.bookmarkedTagFeed().toString(),
                        },
                    ]}
                />
            </div>
        </ProjectPostFeed>
    </>
);

export default DashboardNonlivePostFeed;
DashboardNonlivePostFeed.displayName = "bookmarked-tag-feed";
