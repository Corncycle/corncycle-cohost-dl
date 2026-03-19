import { ModWireArtistAlley } from "@/shared/types/artist-alley";
import { WireProjectModelModeratorExtensions } from "@/shared/types/projects";
import { WireUserModel } from "@/shared/types/wire-models";
import React, { useCallback, useEffect, useState } from "react";
import { ArtistAlleyListing } from "../../../artist-alley/artist-alley-listing";
import sitemap from "@/shared/sitemap";
import { Button, ButtonColor } from "../../../elements/button";
import { trpc } from "@/client/lib/trpc";
import { ArtistAlleyAdId } from "@/shared/types/ids";
import { BasicButton } from "../../../elements/basic-button";
import { SimpleNativeModalDialog } from "../../../elements/simple-modal-dialog";

const ApproveButton: React.FC<{ listingId: ArtistAlleyAdId }> = ({
    listingId,
}) => {
    const approve = trpc.artistAlley.moderator.approveListing.useMutation();
    const utils = trpc.useContext();

    const [isOpen, setIsOpen] = useState(false);

    const handleApprove = useCallback(async () => {
        await approve.mutateAsync({ id: listingId });
        await utils.artistAlley.moderator.getPendingListings.invalidate();
        setIsOpen(false);
    }, [approve, listingId, utils.artistAlley.moderator.getPendingListings]);

    const handleClick = useCallback(() => {
        setIsOpen(true);
    }, []);

    return (
        <>
            <SimpleNativeModalDialog
                isOpen={isOpen}
                title="Approve Listing"
                body="Are you sure you want to approve this listing?"
                confirm={{ label: "Approve", color: "green" }}
                cancel={{ label: "Cancel", color: "stroke" }}
                onConfirm={handleApprove}
                onCancel={() => setIsOpen(false)}
            />

            <BasicButton
                onClick={handleClick}
                buttonSize="regular"
                buttonColor="green"
            >
                Approve
            </BasicButton>
        </>
    );
};

const RejectButton: React.FC<{ listingId: ArtistAlleyAdId }> = ({
    listingId,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const reject = trpc.artistAlley.moderator.rejectListing.useMutation();
    const utils = trpc.useContext();

    const handleReject = useCallback(async () => {
        await reject.mutateAsync({ id: listingId, rejectReason });
        await utils.artistAlley.moderator.getPendingListings.invalidate();
        setIsOpen(false);
    }, [
        reject,
        listingId,
        rejectReason,
        utils.artistAlley.moderator.getPendingListings,
    ]);

    const handleClick = useCallback(() => {
        setIsOpen(true);
    }, []);

    return (
        <>
            <SimpleNativeModalDialog
                isOpen={isOpen}
                title="Reject Listing"
                body="Are you sure you want to reject this listing?"
                confirm={{ label: "Reject", color: "destructive" }}
                cancel={{ label: "Cancel", color: "stroke" }}
                onConfirm={handleReject}
                onCancel={() => setIsOpen(false)}
            >
                <div>
                    <label>
                        Reject reason:{" "}
                        <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) =>
                                setRejectReason(e.currentTarget.value)
                            }
                        />
                    </label>
                </div>
            </SimpleNativeModalDialog>

            <BasicButton
                onClick={handleClick}
                buttonSize="regular"
                buttonColor="destructive"
            >
                Reject
            </BasicButton>
        </>
    );
};

export const ArtistAlleyModListing: React.FC<{
    listing: ModWireArtistAlley;
    project: WireProjectModelModeratorExtensions;
    user: WireUserModel;
}> = ({ listing, project, user }) => {
    return (
        <div className="flex w-full min-w-0 flex-row justify-between gap-4 rounded-lg border border-notBlack p-3">
            <div className="w-full max-w-[300px]">
                <ArtistAlleyListing listing={listing} project={project} />
            </div>
            <div className="prose flex-shrink">
                <ul>
                    <li>
                        user: {user.email} (
                        <a
                            href={sitemap.public.moderation
                                .manageUser({
                                    userId: user.userId,
                                })
                                .toString()}
                        >
                            manage
                        </a>
                        )
                    </li>
                    <li>
                        project: {project.handle} (
                        <a
                            href={sitemap.public.moderation
                                .manageProject({
                                    projectHandle: project.handle,
                                })
                                .toString()}
                        >
                            manage
                        </a>
                        )
                    </li>
                    <li>listing: {listing.id}</li>
                    <li>created at: {listing.createdAt}</li>
                    <li>num weeks: {listing.numWeeks}</li>
                    <li>status: {listing.status}</li>
                    <li>
                        payment status:{" "}
                        <a
                            href={`https://dashboard.stripe.com/payments/${listing.stripePaymentIntentId}`}
                        >
                            {listing.paymentStatus}
                        </a>
                    </li>
                    <li>
                        notes:
                        <br />
                        <blockquote>{listing.notes}</blockquote>
                    </li>
                </ul>
                <div className="flex flex-row gap-2">
                    <ApproveButton listingId={listing.id} />
                    <RejectButton listingId={listing.id} />
                </div>
            </div>
        </div>
    );
};
