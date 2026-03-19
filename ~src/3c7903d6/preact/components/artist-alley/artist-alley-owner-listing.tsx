import {
    ArtistAlleyApprovalStatus,
    OwnerWireArtistAlley,
} from "@/shared/types/artist-alley";
import { WireProjectModel } from "@/shared/types/projects";
import React from "react";
import { ArtistAlleyListing } from "./artist-alley-listing";
import { DateTime } from "luxon";
import {
    CheckCircleIcon,
    XCircleIcon,
    QuestionMarkCircleIcon,
    ClockIcon,
} from "@heroicons/react/20/solid";

type ChipStatus = ArtistAlleyApprovalStatus | "expired";
const ApprovalChip: React.FC<{ status: ChipStatus }> = ({ status }) => {
    const Icon =
        status === "expired"
            ? ClockIcon
            : status === "approved"
            ? CheckCircleIcon
            : status === "rejected"
            ? XCircleIcon
            : QuestionMarkCircleIcon;
    return (
        <span
            className={`block max-w-max rounded-lg px-3 py-2 ${
                status === "expired"
                    ? "bg-gray-300 text-notBlack"
                    : status === "approved"
                    ? "bg-green-600 text-notWhite contrast-more:bg-green-700"
                    : status === "pending"
                    ? "bg-longan text-notBlack"
                    : "bg-red-600 text-notWhite contrast-more:bg-red-700"
            }`}
        >
            <Icon className="mr-2 inline-block h-4 w-4" />
            {status}
        </span>
    );
};

export const ArtistAlleyOwnerListing: React.FC<{
    listing: OwnerWireArtistAlley;
    project: WireProjectModel;
}> = ({ listing, project }) => {
    const hasExpired =
        listing.status === "approved" &&
        new Date(listing.expiresAt) < new Date();
    const effectiveStatus: ChipStatus = hasExpired ? "expired" : listing.status;

    return (
        <div className="flex w-full min-w-0 flex-row flex-wrap justify-between gap-4 ">
            <div className="flex-shrink space-y-3">
                <ApprovalChip status={effectiveStatus} />
                <div>
                    <ul className="space-y-3">
                        <li>
                            <span className="font-bold">purchase date:</span>{" "}
                            {DateTime.fromISO(listing.createdAt).toLocaleString(
                                DateTime.DATETIME_FULL
                            )}
                        </li>
                        <li>
                            <span className="font-bold">weeks purchased:</span>{" "}
                            {listing.numWeeks}
                        </li>
                        {listing.status === "approved" && (
                            <li>
                                <span className="font-bold">end date:</span>{" "}
                                {DateTime.fromISO(
                                    listing.expiresAt
                                ).toLocaleString(DateTime.DATETIME_FULL)}
                            </li>
                        )}
                        {listing.receiptUrl && (
                            <li>
                                <a
                                    href={listing.receiptUrl}
                                    rel="noopener"
                                    target="_blank"
                                    className="font-bold underline"
                                >
                                    view receipt
                                </a>
                            </li>
                        )}
                        {listing.notes && (
                            <li>
                                <span className="font-bold">
                                    submission notes:
                                </span>
                                <br />
                                <div className="co-prose prose mt-2">
                                    <blockquote>{listing.notes}</blockquote>
                                </div>
                            </li>
                        )}
                        {listing.rejectReason && (
                            <li>
                                <span className="font-bold">
                                    rejection reason:
                                </span>
                                <br />
                                <div className="co-prose prose mt-2">
                                    <blockquote>
                                        {listing.rejectReason}
                                    </blockquote>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="w-full max-w-[300px] basis-[300px]">
                <ArtistAlleyListing listing={listing} project={project} />
            </div>
        </div>
    );
};
