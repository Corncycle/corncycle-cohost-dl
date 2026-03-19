import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import React, { FunctionComponent, Suspense } from "react";
import { CohostEgg } from "../icons/cohost-egg";
import { UnfriendlyTimestamp } from "../unfriendly-timestamp";
import { CohostCornerContent } from "./cohost-corner-content";

const useCohostCorner = () =>
    trpc.posts.getPostsTagged.useQuery(
        {
            projectHandle: "staff" as ProjectHandle,
            tagSlug: "cohost corner",
        },
        {
            suspense: true,
            // never refetch this shit
            refetchInterval: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );

const CohostCornerInner: FunctionComponent = () => {
    const cohostCorner = useCohostCorner();
    const cohostCornerPost = cohostCorner.data?.items[0];
    return cohostCornerPost ? (
        <>
            <p>Latest staff post:</p>

            <div className="mb-4 flex flex-col">
                {cohostCornerPost.headline ? (
                    <h1 className="font-atkinson text-lg font-bold text-sidebarText">
                        <a
                            href={cohostCornerPost.singlePostPageUrl}
                            className="hover:underline"
                        >
                            {cohostCornerPost.headline}
                        </a>
                    </h1>
                ) : null}
                {cohostCornerPost.publishedAt ? (
                    <a
                        href={cohostCornerPost.singlePostPageUrl}
                        className="block flex-none text-sm text-sidebarAccent hover:underline"
                    >
                        <UnfriendlyTimestamp
                            className="text-sidebarAccent" // actually needs to be included here as well
                            dateISO={cohostCornerPost.publishedAt}
                        />
                    </a>
                ) : null}
            </div>
            <CohostCornerContent
                readMoreUrl={cohostCornerPost.singlePostPageUrl.toString()}
                postAst={cohostCornerPost.astMap}
            />
        </>
    ) : (
        <p>
            We weren't able to load the cohost corner at this time. You can
            check out the latest from us at{" "}
            <a
                href={sitemap.public.project
                    .mainAppProfile({
                        projectHandle: "staff" as ProjectHandle,
                    })
                    .toString()}
                className="font-bold text-sidebarAccent"
            >
                {
                    sitemap.public.project.mainAppProfile({
                        projectHandle: "staff" as ProjectHandle,
                    }).hostname
                }
            </a>
        </p>
    );
};

export const CohostCorner: FunctionComponent = () => {
    return (
        <section
            className={`h-fit rounded-lg border border-sidebarAccent bg-sidebarBg p-3 text-sidebarText`}
        >
            <div className="mb-4 flex flex-row items-center gap-2">
                <CohostEgg className="inline-block h-6 text-sidebarAccent" />
                <h1 className="font-league text-xl font-normal uppercase leading-none">
                    the cohost corner
                </h1>
            </div>

            <p>
                Curious if something is on our roadmap? Wondering if we know of
                any workarounds to a bug? Check{" "}
                <a
                    className="cursor-pointer font-bold text-sidebarAccent hover:underline"
                    href="https://help.antisoftware.club/support/discussions/forums/62000112866/recent"
                >
                    the bug tracker.
                </a>{" "}
                Want a new feature? Upvote an existing suggestion or add your
                own on{" "}
                <a
                    className="cursor-pointer font-bold text-sidebarAccent hover:underline"
                    href="https://help.antisoftware.club/support/discussions/forums/62000112864/popular"
                >
                    the feature request forum.
                </a>
            </p>

            <hr className="my-2 text-sidebarAccent" />

            <Suspense fallback={<p>loading...</p>}>
                <CohostCornerInner />
            </Suspense>
        </section>
    );
};
