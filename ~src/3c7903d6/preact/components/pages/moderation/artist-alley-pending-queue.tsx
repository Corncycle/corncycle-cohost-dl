import { trpc } from "@/client/lib/trpc";
import { ProjectId, UserId } from "@/shared/types/ids";
import { WireProjectModelModeratorExtensions } from "@/shared/types/projects";
import { WireUserModel } from "@/shared/types/wire-models";
import React, { useMemo } from "react";
import { ArtistAlleyModListing } from "../../moderation/maintenance/artist-alley/artist-alley-mod-listing";
import { BasicButton } from "../../elements/basic-button";

export function ArtistAlleyPendingQueuePage() {
    const { data, hasNextPage, isLoading, fetchNextPage } =
        trpc.artistAlley.moderator.getPendingListings.useInfiniteQuery(
            {},
            {
                suspense: true,
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );

    const flattenedListings = useMemo(() => {
        return data?.pages.flatMap((page) => page.listings) ?? [];
    }, [data?.pages]);

    const flattenedProjects = useMemo<
        Map<ProjectId, WireProjectModelModeratorExtensions>
    >(() => {
        const projects = new Map<
            ProjectId,
            WireProjectModelModeratorExtensions
        >();
        data?.pages.forEach((page) => {
            Object.values(page.relevantProjects).forEach((project) => {
                projects.set(project.projectId, project);
            });
        });
        return projects;
    }, [data?.pages]);

    const flattenedUsers = useMemo<Map<UserId, WireUserModel>>(() => {
        const users = new Map<UserId, WireUserModel>();
        data?.pages.forEach((page) => {
            Object.values(page.relevantUsers).forEach((user) => {
                users.set(user.userId, user);
            });
        });
        return users;
    }, [data?.pages]);

    return (
        <div className="bg-notWhite p-3 text-notBlack">
            <h1 className="mb-4 text-4xl font-bold">pending listings</h1>
            <div className="flex flex-col gap-4">
                {flattenedListings.map((listing) => (
                    <ArtistAlleyModListing
                        listing={listing}
                        key={listing.id}
                        project={flattenedProjects.get(listing.projectId)!}
                        user={flattenedUsers.get(listing.userId)!}
                    />
                ))}
                <BasicButton
                    onClick={async () => {
                        await fetchNextPage();
                    }}
                    disabled={!hasNextPage || isLoading}
                    buttonSize="regular"
                    buttonColor="cherry"
                >
                    load more
                </BasicButton>
            </div>
        </div>
    );
}

export default ArtistAlleyPendingQueuePage;
