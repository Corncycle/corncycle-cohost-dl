import eggBeast from "@/client/images/eggbeast.png";
import errorBug from "@/client/images/errorbug.png";
import tuesdayAgain from "@/client/images/tuesday-again@3x.png";
import { patterns, sitemap } from "@/shared/sitemap";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

type ErrorPageProps = {
    message: string;
    errorCode: string;
};

export const ErrorPage: FunctionComponent<ErrorPageProps> = ({
    message,
    errorCode,
}) => {
    const chaosDay22 = useFlag(FeatureFlag.Enum["chaos-day-2022"]);
    const imagePath = useMemo(() => {
        // prioritize eggbeasts
        if (chaosDay22) {
            return eggBeast;
        }

        if (errorCode === "404") {
            return tuesdayAgain;
        }
        return errorBug;
    }, [chaosDay22, errorCode]);

    return (
        <>
            <Helmet title="whoops!" />
            <div className="container mx-auto mt-6 flex flex-row flex-wrap justify-center gap-6 bg-background text-bgText lg:flex-nowrap">
                <img
                    className="h-60 max-w-md flex-shrink object-contain sm:h-full"
                    src={sitemap.public.static
                        .staticAsset({ path: imagePath })
                        .toString()}
                    alt="error bug"
                />
                <div className="flex max-w-prose flex-col items-start gap-3 px-3 sm:justify-center sm:px-0">
                    <h1 className="self-center font-league text-3xl font-bold text-bgText sm:self-auto sm:text-6xl">
                        {errorCode === "404" ? "404!" : "Uh oh!"}
                    </h1>
                    <div className="prose text-bgText prose-p:my-4">
                        <p>{message}</p>
                        <p>
                            If you think you saw this page when you shouldn't
                            have, please let us know by emailing{" "}
                            <a href="mailto:support@cohost.org">
                                support@cohost.org
                            </a>
                            .
                        </p>
                        <p>
                            Logging out and back in might help get the site
                            working for you again.
                            <form
                                method="post"
                                action={sitemap.public.logout().toString()}
                            >
                                <input
                                    className="block max-w-max self-center rounded-lg bg-foreground py-2 pl-6 pr-6 leading-none text-text hover:bg-foreground-600 sm:self-auto"
                                    type="submit"
                                    value="log out"
                                />
                            </form>
                        </p>
                    </div>
                    <a
                        className="block max-w-max self-center rounded-lg bg-foreground py-2 pl-6 pr-6 leading-none text-text hover:bg-foreground-600 sm:self-auto"
                        href={sitemap.public.home().toString()}
                    >
                        go home
                    </a>
                </div>
            </div>
        </>
    );
};

ErrorPage.displayName = "error";
export default ErrorPage;
