import React from "react";
import { FunctionComponent } from "react";
import { type ManagePageProps } from "./manage-page";
import { ArtistAlleyListing } from "../../artist-alley/artist-alley-listing";
import { BasicButton } from "../../elements/basic-button";
import sitemap from "@/shared/sitemap";

export type ActiveArtistAlleyListingProps = Pick<
    ManagePageProps,
    "project" | "listings" | "userLookup"
>;

export const ActiveArtistAlleyListings: FunctionComponent<
    ActiveArtistAlleyListingProps
> = ({ project, listings, userLookup }) => {
    return (
        <>
            <h4 className="h4">artist alley listings</h4>

            <div className="flex flex-row flex-wrap gap-3">
                {listings.map((listing) => (
                    <div
                        className="w-[300px] border border-notBlack p-3"
                        key={listing.id}
                    >
                        <ArtistAlleyListing
                            listing={listing}
                            project={project}
                        />
                        <BasicButton
                            as={"a"}
                            href={sitemap.public.moderation.manageArtistAlleyListing(
                                { adId: listing.id }
                            )}
                            buttonSize="regular"
                            buttonColor="stroke"
                            extraClasses="mt-3"
                        >
                            manage listing
                        </BasicButton>
                    </div>
                ))}
            </div>
        </>
    );
};
