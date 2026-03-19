import { CohostLogo } from "@/client/preact/components/elements/icon";
import { ProjectSwitcher } from "@/client/preact/components/project-switcher";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import { sitemap } from "@/shared/sitemap";
import { FeatureFlag } from "@/shared/types/feature-flags";
import {
    ArrowLeftOnRectangleIcon,
    PencilIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useCurrentProject } from "../../hooks/data-loaders";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { CohostEgg } from "../icons/cohost-egg";
import { CohostEggBookman } from "../icons/cohost-egg-bookman";
import { CohostLogoBookman } from "../icons/cohost-logo-bookman";
import { useModalPostComposer } from "../modal-post-composer-context";
import { NavBarMenu } from "../sidebar-menu";
import { BeatClock } from "./beat-clock";
import { Bounce } from "./bounce";
import { RectButton } from "./rect-button";

const LoginStateButtons: FunctionComponent = () => {
    const userInfo = useUserInfo();
    const currentProject = useCurrentProject();
    const { beatsTimestamps } = useDisplayPrefs();
    const modalPostComposer = useModalPostComposer();
    const displayPrefs = useDisplayPrefs();

    const onClickPost = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
        (e) => {
            if (displayPrefs.disableModalPostComposer) {
                // user wants this to be a link
                return;
            }

            if (e.ctrlKey || e.metaKey || e.button === 3) {
                // ctrl/cmd/middle click: user wants this to open in a new
                // tab, treat it as a link.
                return;
            }
            if (modalPostComposer.hasBeenSetup) {
                // don't process as a link, check if we can pop a modal and if
                // so Do It.
                e.preventDefault();
                modalPostComposer.activate({});
            }
        },
        [displayPrefs.disableModalPostComposer, modalPostComposer]
    );

    return (
        <nav className={`flex flex-row items-center justify-end gap-4`}>
            {beatsTimestamps ? <BeatClock /> : null}
            {userInfo.loggedIn && currentProject?.handle ? (
                <>
                    {userInfo.modMode ? (
                        <Bounce>
                            <a
                                href={`${sitemap.public
                                    .userSettings()
                                    .toString()}#staff-only`}
                            >
                                mod mode active
                            </a>
                        </Bounce>
                    ) : null}
                    <ProjectSwitcher />
                    <div className="hidden flex-row items-center gap-4 lg:flex">
                        <RectButton
                            as="a"
                            className="active:text-foreground-900 gap-1 bg-notWhite text-notBlack hover:bg-foreground-100 hover:text-foreground-800 active:bg-foreground-200"
                            href={sitemap.public.project
                                .composePost({
                                    projectHandle: currentProject.handle,
                                })
                                .toString()}
                            onClick={onClickPost}
                        >
                            <PencilIcon className="h-5 w-5" />
                            <span className="leading-none">post</span>
                        </RectButton>
                    </div>
                </>
            ) : (
                <div className="hidden flex-row items-center gap-4 lg:flex">
                    <RectButton
                        as="a"
                        className="active:text-foreground-900 gap-1 bg-notWhite text-notBlack hover:bg-foreground-100 hover:text-foreground-800 active:bg-foreground-200"
                        href={sitemap.public.login().toString()}
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        <span className="leading-none">log in</span>
                    </RectButton>
                    <RectButton
                        as="a"
                        className="active:text-foreground-900 gap-1 bg-notWhite text-notBlack hover:bg-foreground-100 hover:text-foreground-800 active:bg-foreground-200"
                        href={sitemap.public.signup().toString()}
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        <span className="leading-none">sign up</span>
                    </RectButton>
                </div>
            )}
        </nav>
    );
};

export const TopNav: FunctionComponent = () => {
    const chaosDay22 = useFlag(FeatureFlag.Enum["chaos-day-2022"]);

    const { t } = useTranslation();
    return (
        <>
            <Helmet>
                <style>
                    {`body {
                        margin-top: 4rem;
                    }`}
                </style>
            </Helmet>
            <header className="fixed left-0 right-0 top-0 z-10 h-16 bg-foreground text-text">
                <div className="container mx-auto grid h-full grid-cols-3 grid-rows-1 items-center justify-between px-2 lg:grid-cols-2 lg:p-0">
                    <NavBarMenu />
                    <div>
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
                                        className="mx-auto block h-8 lg:hidden"
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
                                        className="mx-auto block h-8 lg:hidden"
                                        role="img"
                                        aria-label={t("common:brand-name")}
                                    />
                                </>
                            )}
                        </a>
                    </div>
                    <LoginStateButtons />
                </div>
            </header>
        </>
    );
};
