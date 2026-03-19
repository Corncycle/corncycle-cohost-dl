import eggBouncer from "@/client/images/eggbouncer.png";
import { sitemap } from "@/shared/sitemap";
import React, { FunctionComponent, useMemo } from "react";
import { Helmet } from "react-helmet-async";

type SuspendedPageProps = {
    reason: string;
};

export const SuspendedPage: FunctionComponent<SuspendedPageProps> = ({
    reason,
}) => {
    return (
        <>
            <Helmet title="account suspended" />
            <div className="container mx-auto mt-6 flex flex-row flex-wrap justify-center gap-6 bg-background text-bgText lg:flex-nowrap">
                <img
                    className="h-60 max-w-[20rem] flex-shrink object-contain sm:h-full"
                    src={sitemap.public.static
                        .staticAsset({ path: eggBouncer })
                        .toString()}
                    alt="error bug"
                />
                <div className="flex max-w-prose flex-col items-start gap-3 px-3 sm:justify-center sm:px-0">
                    <h1 className="self-center font-league text-2xl font-bold text-bgText sm:self-auto sm:text-4xl">
                        Your account has been suspended.
                    </h1>
                    <div className="prose prose-p:my-4">
                        <p>
                            When the staff suspended you, they cited this
                            reason:
                        </p>

                        <p>
                            <blockquote>{reason}</blockquote>
                        </p>

                        <p>
                            If you think we made the wrong decision, you can
                            appeal by e-mailing us at{" "}
                            <a href="mailto:support@cohost.org">
                                support@cohost.org
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

SuspendedPage.displayName = "suspended";
export default SuspendedPage;
