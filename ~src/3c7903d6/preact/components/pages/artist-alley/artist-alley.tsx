import { trpc } from "@/client/lib/trpc";
import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";
import { useDisplayPrefs } from "@/client/preact/hooks/use-display-prefs";
import { useTransitionState } from "@/client/preact/hooks/use-transition-state";
import { useSiteConfig } from "@/client/preact/providers/site-config-provider";
import { CategoryMatch, SortOrder } from "@/shared/api-types/artist-alley-v1";
import { sitemap } from "@/shared/sitemap";
import {
    ArtistAlleyAdultDisplayMode,
    WireArtistAlley,
} from "@/shared/types/artist-alley";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { ArtistAlleyAdId, ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import { isDefined } from "@/shared/util/filter-null-undefined";
import { useSet } from "@uidotdev/usehooks";
import { useFlag } from "@unleash/proxy-client-react";
import React, {
    Suspense,
    startTransition,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import Masonry, { MasonryProps } from "react-masonry-css";
import { z } from "zod";
import {
    ArtistAlleyFilterProvider,
    useArtistAlleyFilters,
} from "../../artist-alley/artist-alley-filter-provider";
import { ArtistAlleyFilters } from "../../artist-alley/artist-alley-filters";
import { ArtistAlleyListing } from "../../artist-alley/artist-alley-listing";
import { SidebarMenu } from "../../sidebar-menu";

function generateMasonryBreakpoints(
    maxCols: number
): MasonryProps["breakpointCols"] {
    const breakpoints: MasonryProps["breakpointCols"] = {
        default: 1,
    };

    // breakpoints are based on a max-width, so we need to set the breakpoint
    // based on the maximum number of columns below that width. columns are max
    // 300px, so 2 columns requires a min-width of 600px, meaning 1 column has a
    // max-width of 600px. i swear this makes sense. - jkap, 4/23/24
    for (let i = 1; i <= maxCols; i++) {
        breakpoints[300 * (i + 1)] = i;
    }

    // since it's based on max-width, we set a fallback breakpoint that's
    // impossible to hit so that we don't snap back to 1 column on larger
    // screens.
    breakpoints[Number.MAX_SAFE_INTEGER] = maxCols + 1;
    return breakpoints;
}

export const ArtistAlleyPage = () => {
    const { isAdult, explicitlyCollapseAdultContent } = useDisplayPrefs();

    const [adultState, setAdultFilterMode] =
        useTransitionState<ArtistAlleyAdultDisplayMode>(
            // if the user is an adult, use their display setting. otherwise,
            // default to hiding adult content
            isAdult
                ? explicitlyCollapseAdultContent
                    ? "hide"
                    : "include"
                : "hide"
        );
    const [categoryMatch, setCategoryMatch] =
        useTransitionState<CategoryMatch>("any");
    const categories = useSet<string>();

    const artistAlleyLive = useFlag(FeatureFlag.Enum["artist-alley-listings"]);

    const [sortOrder, setSortOrder] = useTransitionState<SortOrder>("random");

    return (
        <ArtistAlleyFilterProvider.Provider
            value={{
                adultFilterMode: adultState,
                isAdult,
                categories,
                setAdultFilterMode,
                categoryMatch,
                setCategoryMatch,
                sortOrder,
                setSortOrder,
            }}
        >
            <div className="styled-scrollbars-light dark:styled-scrollbars-dark styled-scrollbars-light dark:styled-scrollbars-dark container mx-auto flex w-full max-w-full flex-row [height:calc(100vh-4rem)]">
                <Helmet title="artist alley" />
                <SidebarMenu narrowMode={true} />
                {artistAlleyLive ? (
                    <Suspense fallback={<div>aaaaaaa</div>}>
                        <ArtistAlleyInner />
                    </Suspense>
                ) : (
                    <ArtistAlleyClosed />
                )}
            </div>
        </ArtistAlleyFilterProvider.Provider>
    );
};

const ArtistAlleyClosed: React.FC = () => {
    const theme = useDynamicTheme();
    return (
        <div className="mt-12">
            <div data-theme={theme.current} className="co-themed-box co-static">
                <div className="co-prose prose">
                    <h1>artist alley is currently closed</h1>

                    <p>
                        we're still working on getting everything set up! if
                        you're interested in buying a listing, you can do so on
                        the{" "}
                        <a
                            href={sitemap.public.artistAlley
                                .create()
                                .toString()}
                        >
                            sign up page!
                        </a>
                    </p>
                    <p>
                        artist alley should be live soon. check out{" "}
                        <a href="https://cohost.org/staff">@staff</a> for the
                        most recent info!
                    </p>
                </div>
            </div>
        </div>
    );
};

// doing this with zod because i was having trouble getting typescript to handle
// the discriminated union correctly otherwise
const MasonicListing = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("LISTING"),
        id: ArtistAlleyAdId,
        listing: WireArtistAlley,
        project: WireProjectModel,
    }),
    z.object({ type: z.literal("FILTER"), id: z.literal("FILTER") }),
]);
type MasonicListing = z.infer<typeof MasonicListing>;

const ArtistAlleyInner: React.FC = () => {
    const toastId = useRef<string | undefined>(undefined);

    const { operatingPrime } = useSiteConfig();

    const { adultFilterMode, categories, categoryMatch, sortOrder } =
        useArtistAlleyFilters();

    const [{ pages }, { fetchNextPage, fetchStatus }] =
        trpc.artistAlley.getListingsForDisplay.useSuspenseInfiniteQuery(
            {
                adultDisplayMode: adultFilterMode,
                categories: Array.from(categories),
                sortModulus: operatingPrime,
                categoryMatch,
                sortOrder,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                keepPreviousData: true,
                // never refetch, each page load should be fully deterministic
                refetchInterval: Infinity,
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                refetchIntervalInBackground: false,

                // toast management
                onError: (err) => {
                    toast.error(err.message, {
                        id: toastId.current,
                    });
                },
                onSuccess: () => {
                    toast.dismiss(toastId.current);
                },
            }
        );

    useEffect(() => {
        if (fetchStatus === "fetching") {
            toastId.current = toast.loading("loading listings...", {
                id: toastId.current,
            });
        }
    }, [fetchStatus]);

    const flattenedListings = useMemo(() => {
        return pages.flatMap((page) => page.listings) ?? [];
    }, [pages]);

    const flattenedProjects = useMemo<Map<ProjectId, WireProjectModel>>(() => {
        const projects = new Map<ProjectId, WireProjectModel>();
        pages.forEach((page) => {
            Object.values(page.relevantProjects).forEach((project) => {
                projects.set(project.projectId, project);
            });
        });
        return projects;
    }, [pages]);

    const masonicListings = useMemo<Array<MasonicListing>>(() => {
        const val = flattenedListings
            .map<MasonicListing | undefined>((listing) => {
                const project = flattenedProjects.get(listing.projectId);
                if (!project) return undefined;
                return {
                    type: "LISTING",
                    id: listing.id,
                    listing,
                    project,
                };
            })
            .filter(isDefined);

        // inject the filter sentinel item at the beginning so it's rendered in the right place
        val.unshift({ type: "FILTER", id: "FILTER" });

        return val;
    }, [flattenedListings, flattenedProjects]);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            startTransition(() => {
                void fetchNextPage();
            });
        }
    }, [inView, fetchNextPage]);

    const masonryBreakpoints = useMemo(() => {
        return generateMasonryBreakpoints(20);
    }, []);

    return (
        <div className="flex w-full flex-col gap-4">
            <Masonry
                breakpointCols={masonryBreakpoints}
                className="artist-alley-grid w-full"
                columnClassName="artist-alley-grid_column"
            >
                {masonicListings.map((listing) => (
                    <ListingMasonryWrapper key={listing.id} data={listing} />
                ))}
            </Masonry>
            {/* marker so we can load the next page */}
            <div className="h-[1px] w-[1px] flex-shrink-0" ref={ref}></div>
        </div>
    );
};

export default ArtistAlleyPage;

const ListingMasonryWrapper: React.FC<{
    data: MasonicListing;
}> = ({ data }) => {
    if (data.type === "LISTING")
        return (
            <div
                key={data.listing.id}
                className="mt-4 inline-block w-full max-w-[300px]"
            >
                <ArtistAlleyListing
                    listing={data.listing}
                    project={data.project}
                />
            </div>
        );

    return (
        <div key={data.id} className="mt-4 inline-block w-full max-w-[300px]">
            <ArtistAlleyFilters />
        </div>
    );
};
