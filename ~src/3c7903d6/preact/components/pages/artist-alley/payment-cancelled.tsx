import { trpc } from "@/client/lib/trpc";
import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ArtistAlleyListing } from "../../artist-alley/artist-alley-listing";
import { useRequiresLogin } from "@/client/preact/providers/user-info-provider";
import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";
import { Helmet } from "react-helmet-async";

export const ArtistAlleyPaymentCancelledPage: React.FC = () => {
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
            <Helmet title="payment cancelled - artist alley" />
            <div className="co-prose prose">
                <h1>Payment Cancelled</h1>
                <p>
                    you backed out of the payment page! if you didn't mean to do
                    that, you hit your browser's back button.
                </p>
                <p>
                    as of this exact moment, there's nothing you can do from
                    here. we'll be adding a page where you can manage listings
                    (including ones you haven't paid for) soon.
                </p>
            </div>
        </div>
    );
};

export default ArtistAlleyPaymentCancelledPage;
