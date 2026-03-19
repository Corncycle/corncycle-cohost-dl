import { Favicons } from "@/client/preact/components/favicons";
import { TopNav } from "@/client/preact/components/partials/topnav";
import React, { FunctionComponent, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Footer } from "../preact/components/footer";
import { LightboxHost } from "../preact/components/lightbox";
import { EmailVerifyCanceledHeader } from "../preact/components/partials/headers/email-verify-canceled-header";
import { Flashes } from "../preact/components/partials/flashes";
import { ReadOnlyHeader } from "../preact/components/partials/headers/readonly-header";
import { ThemeCSSVars } from "../preact/components/partials/theme-css-vars";
import { UnactivatedHeader } from "../preact/components/partials/headers/unactivated-header";
import { ReportingUIHost } from "../reporting/ui-host";
import { type LayoutProps } from "./layout-map";
import { CohostToaster } from "../preact/components/toaster";
import { ModalPostComposer } from "../preact/components/modal-post-composer";
import { QueuedForDeleteHeader } from "../preact/components/partials/headers/project-queued-for-delete-header";

export const MainNoFooterLayout: FunctionComponent<LayoutProps> = ({
    children,
}) => {
    return (
        <ModalPostComposer>
            <div className="flex flex-col">
                <CohostToaster />
                <Favicons />
                <ThemeCSSVars />
                <Helmet defaultTitle="cohost!" titleTemplate="cohost! - %s" />
                <TopNav />
                <Flashes className="cohost-shadow-light absolute left-0 right-0 top-20 z-10 mx-auto max-w-prose" />
                <div className="flex flex-grow flex-col">
                    <EmailVerifyCanceledHeader />
                    <UnactivatedHeader />
                    <ReadOnlyHeader />
                    <QueuedForDeleteHeader />
                    <LightboxHost>
                        <ReportingUIHost>
                            <Suspense>{children}</Suspense>
                        </ReportingUIHost>
                    </LightboxHost>
                </div>
            </div>
        </ModalPostComposer>
    );
};
