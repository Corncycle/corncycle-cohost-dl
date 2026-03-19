import appleTouchIcon from "@/client/images/icons/favicons/apple-touch-icon.png";
import favicon16 from "@/client/images/icons/favicons/favicon-16x16.png";
import favicon32 from "@/client/images/icons/favicons/favicon-32x32.png";
import faviconIco from "@/client/images/icons/favicons/favicon.ico";
import { serverPathFromImport } from "@/client/lib/server-path-from-import";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { env } from "@/shared/env";

export const Favicons: FunctionComponent = () => (
    <Helmet>
        <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={serverPathFromImport(appleTouchIcon)}
        />
        <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={serverPathFromImport(favicon32)}
        />
        <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={serverPathFromImport(favicon16)}
        />
        {/* append the app version to the manifest file for cache busting. we use this same trick with locales. */}
        <link rel="manifest" href={`/static/manifest.json?${env.VERSION}`} />
        <link rel="shortcut icon" href={serverPathFromImport(faviconIco)} />
        <meta name="apple-mobile-web-app-title" content="cohost" />
        <meta name="application-name" content="cohost" />
        {/* TODO: make this work correctly with themes */}
        {/* <meta name="theme-color" content="#83254f" /> */}

        {/* re-add this later, currently not a way to refresh with it enabled */}
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
    </Helmet>
);
