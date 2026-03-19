import { trpc } from "@/client/lib/trpc";
import { LookupKey } from "@/shared/api-types/subscriptions";
import sitemap from "@/shared/sitemap";
import React, { FunctionComponent, Suspense } from "react";
import { AuthnButton } from "../../partials/authn-button";
import { UnfriendlyTimestamp } from "../../unfriendly-timestamp";
import cohostPlusFlyer from "@/client/images/cohost-plus-promo.png";

export const SubscriptionForm: FunctionComponent = () => {
    return (
        <div
            className={`cohost-shadow-light dark:cohost-shadow-dark relative mx-auto
                    flex max-h-min w-full flex-col items-center gap-4 rounded-lg
                    bg-longan-200 text-center text-cherry`}
        >
            <div id="cohost-plus" className="absolute -top-20 block h-0 w-0" />
            <img
                src={sitemap.public.static
                    .staticAsset({
                        path: cohostPlusFlyer,
                    })
                    .toString()}
                className="rounded-t-lg"
                alt="Flyer for cohost plus"
            />
            <div className="sr-only">
                <p>
                    Cohost Plus is our subscription service that helps support
                    our development and gets you access to some extra features.
                    Currently, your upload limit is increased to 10 megabytes,
                    with more features coming soon. Only $4.99 per month or
                    $49.99 per year.
                </p>
            </div>
            <Suspense fallback={<div>loading subscriptions details...</div>}>
                <SubscriptionFormInner />
            </Suspense>
        </div>
    );
};

const SubscriptionFormInner: FunctionComponent = () => {
    const { data: subscriptions } =
        trpc.subscriptions.userSubscriptions.useQuery(undefined, {
            suspense: true,
            select: (data) => data.filter((sub) => sub.status === "active"),
        });

    return (
        <div className="flex flex-col items-center gap-4 p-3">
            {subscriptions && subscriptions.length > 0 ? (
                <>
                    <p>
                        Your cohost Plus! subscription will expire on{" "}
                        <UnfriendlyTimestamp
                            dateISO={subscriptions[0].expirationDate}
                            className="font-bold"
                        />
                        .
                    </p>
                    {subscriptions.length > 1 ? (
                        <div className="prose rounded-lg border-2 border-red-700 bg-red-200 p-3 prose-p:my-1">
                            <p>
                                <strong>Heads up!</strong> It looks like you've
                                got more than one active subscription! This
                                shouldn't be possible, but it looks like we
                                goofed up and made it happen anyway.
                            </p>
                            <p>
                                Please contact us right away at{" "}
                                <a
                                    href="mailto:support@cohost.org"
                                    className="font-bold"
                                >
                                    support@cohost.org
                                </a>{" "}
                                so we can figure out what's happening and fix
                                it.
                            </p>
                        </div>
                    ) : null}
                    <form
                        action={sitemap.public.subscriptions
                            .createPortalSession()
                            .toString()}
                        method="post"
                    >
                        <AuthnButton type="submit">
                            manage your subscription
                        </AuthnButton>
                    </form>
                </>
            ) : (
                <>
                    <div className="prose">
                        <p>
                            You don't currently have a <i>cohost Plus!</i>{" "}
                            subscription! If you just subscribed and you're
                            still seeing this, wait a bit; this can be slow to
                            update. If it's been more than a couple hours and
                            you're still seeing this, please e-mail us at{" "}
                            <a
                                href="mailto:support@cohost.org"
                                className="font-bold"
                            >
                                support@cohost.org
                            </a>
                            .
                        </p>
                    </div>
                    <form
                        action={sitemap.public.subscriptions
                            .createCheckoutSession()
                            .toString()}
                        method="post"
                    >
                        <input
                            type="hidden"
                            value={LookupKey.Enum.cohost_plus_monthly}
                            name="priceLookupKey"
                        />
                        <AuthnButton type="submit">
                            <span>
                                subscribe to <i>cohost Plus!</i>
                            </span>
                        </AuthnButton>
                    </form>
                </>
            )}
        </div>
    );
};
