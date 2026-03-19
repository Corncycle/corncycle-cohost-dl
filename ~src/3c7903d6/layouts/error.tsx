import { Favicons } from "@/client/preact/components/favicons";
import sitemap from "@/shared/sitemap";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { CohostEgg, CohostLogo } from "../preact/components/elements/icon";
import { CohostEggBookman } from "../preact/components/icons/cohost-egg-bookman";
import { CohostLogoBookman } from "../preact/components/icons/cohost-logo-bookman";
import { ThemeCSSVars } from "../preact/components/partials/theme-css-vars";
import { type LayoutProps } from "./layout-map";
import { CohostToaster } from "../preact/components/toaster";

export const ErrorLayout: FunctionComponent<LayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    const chaosDay22 = useFlag(FeatureFlag.Enum["chaos-day-2022"]);

    return (
        <div className="flex flex-col">
            <CohostToaster />
            <Favicons />
            <ThemeCSSVars mode={"light_with_themes"} />
            <Helmet>
                <title>cohost!</title>
            </Helmet>
            <header className="cohost-shadow-light dark:cohost-shadow-dark fixed left-0 right-0 top-0 z-50 h-16 bg-foreground text-text">
                <div className="container mx-auto flex h-full flex-row items-center justify-between px-2 lg:p-0">
                    <a
                        href={sitemap.public.home().toString()}
                        className="text-text hover:text-accent"
                    >
                        {chaosDay22 ? (
                            <>
                                <CohostLogoBookman
                                    className="hidden h-8 lg:block"
                                    role="img"
                                    aria-label={t("common:brand-name")}
                                />
                                <CohostEggBookman
                                    className="block h-8 lg:hidden"
                                    role="img"
                                    aria-label={t("common:brand-name")}
                                />
                            </>
                        ) : (
                            <>
                                <CohostLogo
                                    className="hidden h-8 lg:block"
                                    role="img"
                                    aria-label={t("common:brand-name")}
                                />
                                <CohostEgg
                                    className="block h-8 lg:hidden"
                                    role="img"
                                    aria-label={t("common:brand-name")}
                                />
                            </>
                        )}
                    </a>
                </div>
            </header>
            <div className="mt-16 flex flex-grow flex-col">{children}</div>
        </div>
    );
};
