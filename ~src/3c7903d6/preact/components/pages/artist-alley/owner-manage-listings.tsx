import { trpc } from "@/client/lib/trpc";
import { useRequiresLogin } from "@/client/preact/providers/user-info-provider";
import React, { useMemo } from "react";
import { SidebarMenu } from "../../sidebar-menu";
import { OwnerWireArtistAlley } from "@/shared/types/artist-alley";
import { ArtistAlleyOwnerListing } from "../../artist-alley/artist-alley-owner-listing";
import { ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import { isDefined } from "@/shared/util/filter-null-undefined";
import { BasicButton } from "../../elements/basic-button";
import sitemap from "@/shared/sitemap";
import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";

export const ArtistAlleyOwnerListingsPage: React.FC = () => {
    useRequiresLogin();

    const [{ pages }, { hasNextPage, fetchNextPage, isFetching }] =
        trpc.artistAlley.getOwnerListings.useSuspenseInfiniteQuery(
            {},
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                refetchOnMount: false,
                refetchOnWindowFocus: false,
            }
        );

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

    const combinedListings = useMemo(() => {
        const val = flattenedListings
            .map<
                | { listing: OwnerWireArtistAlley; project: WireProjectModel }
                | undefined
            >((listing) => {
                const project = flattenedProjects.get(listing.projectId);
                if (!project) return undefined;
                return {
                    listing,
                    project,
                };
            })
            .filter(isDefined);

        return val;
    }, [flattenedListings, flattenedProjects]);

    const theme = useDynamicTheme();

    return (
        <main className="w-full pt-16">
            <div className="container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                <SidebarMenu />
                <section className=" col-span-1 flex flex-col gap-12 lg:col-span-2">
                    <div
                        className="co-themed-box co-settings rounded-lg p-3"
                        data-theme={theme.current}
                    >
                        <h1 className="co-settings-header">
                            manage your listings
                        </h1>
                        <hr className="mt-6" />
                        <div className="my-6 flex flex-col space-y-3">
                            {combinedListings?.map((listing) => (
                                <React.Fragment key={listing.listing.id}>
                                    <ArtistAlleyOwnerListing
                                        listing={listing.listing}
                                        project={listing.project}
                                    />
                                    <hr />
                                </React.Fragment>
                            ))}
                        </div>
                        <BasicButton
                            as="button"
                            buttonColor="theme-sensitive-1"
                            buttonSize="regular"
                            disabled={isFetching || !hasNextPage}
                            onClick={() => fetchNextPage()}
                        >
                            {isFetching
                                ? "loading..."
                                : hasNextPage
                                ? "load more"
                                : "no more listings"}
                        </BasicButton>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ArtistAlleyOwnerListingsPage;
