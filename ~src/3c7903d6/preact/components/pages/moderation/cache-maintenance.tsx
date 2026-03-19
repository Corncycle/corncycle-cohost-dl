import sitemap from "@/shared/sitemap";
import {
    ChevronLeftIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { RebuildProjectFeed } from "../../moderation/maintenance/notifications/rebuild-project-feed";
import { FillDashboardGaps } from "../../moderation/maintenance/fill-dashboard-gaps";
import { RebuildEagerPosts } from "../../moderation/maintenance/rebuild-eager-posts";
import { RebuildDashboardForm } from "../../moderation/maintenance/rebuild-dashboard-form";

const CacheMaintenancePage: FunctionComponent = () => {
    return (
        <>
            <Helmet title="cache maintenance" />
            <div className="flex flex-col gap-4 py-4 prose-headings:m-0">
                <h1>cache maintenance</h1>
                <a href={sitemap.public.moderation.home().toString()}>
                    <ChevronLeftIcon className="inline h-6 w-6" />
                    back to moderation home
                </a>
                <div
                    className={`mb-2 flex flex-row items-start gap-4
                    rounded-lg border-2 border-red-700 bg-red-200 p-4
                    text-notBlack prose-p:my-2`}
                >
                    <p className="flex-shrink-0">
                        <ExclamationTriangleIcon className="inline h-6 w-6 text-red-700" />
                    </p>
                    <div>
                        <p>
                            WARNING! This page contains potentially destructive
                            actions! Please refrain from Fucking Around And
                            Finding Out!
                        </p>
                    </div>
                </div>
                <hr />
                <h2>rebuild timeline for individual project</h2>
                <RebuildDashboardForm />
                <hr />
                <h2>rebuild notification feed for individual project</h2>
                <RebuildProjectFeed />
                <hr />
                <h2>fill in gaps in cached dashboards</h2>
                <FillDashboardGaps />
                <hr />
                <h2>
                    rebuild eager posts (tag search, number of comments, etc.)
                </h2>
                <RebuildEagerPosts />
            </div>
        </>
    );
};

export default CacheMaintenancePage;
