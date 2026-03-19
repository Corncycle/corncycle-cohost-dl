import { patterns } from "@/shared/sitemap";
import React, { FunctionComponent, ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import loadable from "@loadable/component";
import { MainLayout } from "../layouts/main";
import { StaticNoWrapperLayout } from "../layouts/static-no-wrapper";
import { MainNoFooterLayout } from "../layouts/main-no-footer";
import { Helmet } from "react-helmet-async";

const SearchPage = loadable(() => import("../preact/components/pages/search"));
const ProjectSettingsPage = loadable(
    () => import("./components/pages/project-settings")
);
const ArtistAlleyPage = loadable(
    () => import("../preact/components/pages/artist-alley/artist-alley")
);
const ArtistAlleyCreatePage = loadable(
    () => import("../preact/components/pages/artist-alley/create")
);
const ArtistAlleyPaymentSuccessPage = loadable(
    () => import("../preact/components/pages/artist-alley/payment-success")
);
const ArtistAlleyPaymentCancelledPage = loadable(
    () => import("../preact/components/pages/artist-alley/payment-cancelled")
);
const ArtistAlleyOwnerListingsPage = loadable(
    () =>
        import("../preact/components/pages/artist-alley/owner-manage-listings")
);

export const CohostRoutes: FunctionComponent<{ children?: ReactNode }> = ({
    children,
}) => {
    return (
        <Routes>
            <Route
                path={patterns.public.search}
                element={
                    <MainLayout>
                        <SearchPage />
                    </MainLayout>
                }
            />
            <Route
                path={patterns.public.project.settings}
                element={
                    <MainLayout>
                        <ProjectSettingsPage />
                    </MainLayout>
                }
            />
            {/* artist alley */}
            <Route
                path={patterns.public.artistAlley.home}
                element={
                    <MainNoFooterLayout>
                        <ArtistAlleyPage />
                    </MainNoFooterLayout>
                }
            />
            <Route
                path={patterns.public.artistAlley.create}
                element={
                    <MainLayout>
                        <ArtistAlleyCreatePage />
                    </MainLayout>
                }
            />
            <Route
                path={patterns.public.artistAlley.success}
                element={
                    <StaticNoWrapperLayout>
                        <ArtistAlleyPaymentSuccessPage />
                    </StaticNoWrapperLayout>
                }
            />
            <Route
                path={patterns.public.artistAlley.cancelled}
                element={
                    <StaticNoWrapperLayout>
                        <ArtistAlleyPaymentCancelledPage />
                    </StaticNoWrapperLayout>
                }
            />
            <Route
                path={patterns.public.artistAlley.ownerManage}
                element={
                    <MainLayout>
                        <ArtistAlleyOwnerListingsPage />
                    </MainLayout>
                }
            />
            {children}
        </Routes>
    );
};
