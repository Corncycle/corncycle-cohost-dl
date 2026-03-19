import { trpc } from "@/client/lib/trpc";
import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ArtistAlleyListing } from "../../artist-alley/artist-alley-listing";
import { useRequiresLogin } from "@/client/preact/providers/user-info-provider";
import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";
import { Helmet } from "react-helmet-async";

export const ArtistAlleyPaymentSuccessPage: React.FC = () => {
    useRequiresLogin();
    const { sessionId } = useParams<{ sessionId: string }>();
    const listing = trpc.artistAlley.getByCheckoutSession.useQuery(
        {
            checkoutSessionId: sessionId!,
        },
        {
            suspense: true,
        }
    );

    const theme = useDynamicTheme();

    return (
        <div className="co-themed-box co-static" data-theme={theme.current}>
            <Helmet title="payment success - artist alley" />
            <div className="co-prose prose">
                <h1>Payment Success</h1>
                <p>
                    we got your payment and your listing is now being reviewed!
                    we'll e-mail you if we have any questions about your
                    listing, or to let you know if it's accepted or rejected.
                </p>
                <p>here's a preview for the road:</p>
            </div>
            <div className="max-w-[300px]">
                {listing.data && (
                    <ArtistAlleyListing
                        listing={listing.data.listing}
                        project={listing.data.project}
                    />
                )}
            </div>
        </div>
    );
};

export default ArtistAlleyPaymentSuccessPage;
