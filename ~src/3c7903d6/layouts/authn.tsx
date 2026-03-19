import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { varForTailwindColor } from "../lib/theme-helpers";
import { Favicons } from "../preact/components/favicons";
import { Flashes } from "../preact/components/partials/flashes";
import { type LayoutProps } from "./layout-map";
import { CohostToaster } from "../preact/components/toaster";

const coverUrl = (width: number) => {
    const base = new URL(
        "https://staging.cohostcdn.org/site-assets/login-graphic.png?auto=webp"
    );

    base.searchParams.set("width", width.toString());
    return base.toString();
};

export const AuthnLayout: FunctionComponent<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col">
            <CohostToaster />
            <Favicons />
            <Helmet defaultTitle="cohost!" titleTemplate="cohost! - %s">
                {/* don't use shared themes, this page is always default */}
                <meta name="theme-color" content="rgb(25 25 25)" />
                <style>{`
                    /*
                     * colors specified as bare RGB components so they can get
                     * merged with opacity if needed. see \`tailwind.config.js\`
                     * for more info. */

                    :root {
                        --color-text: 255 249 242;
                        
                        --color-foreground-200: ${varForTailwindColor(
                            "cherry",
                            "200"
                        )};
                        --color-foreground-300: ${varForTailwindColor(
                            "cherry",
                            "300"
                        )};
                        --color-foreground-400: ${varForTailwindColor(
                            "cherry",
                            "400"
                        )};
                        --color-foreground-600: ${varForTailwindColor(
                            "cherry",
                            "600"
                        )};    
                        --color-foreground-700: ${varForTailwindColor(
                            "cherry",
                            "700"
                        )};
                        --color-foreground: ${varForTailwindColor("cherry")};
                        
                        --color-accent: 255 171 92;    
                        --color-background: 25 25 25;
                    }
                `}</style>
            </Helmet>
            <Flashes className="cohost-shadow-light absolute left-0 right-0 top-20 z-10 mx-auto max-w-prose" />
            <div className="grid w-full flex-grow grid-cols-1 lg:grid-cols-2">
                <div className="hidden h-full lg:block">
                    {/*
                        login graphic is only visible at breakpoint lg
                        (1024px and above). it's half width so our lowest real
                        size is 512px. we include a 1px fallback so mobile users
                        don't need to download the whole dang thing.
                    */}
                    <img
                        className="h-full w-full max-w-full origin-center object-cover"
                        sizes="
                            (min-width: 512px) 50vw,
                            1px
                        "
                        srcSet={`
                            ${coverUrl(1)} 1w,
                            ${coverUrl(512)} 512w,
                            ${coverUrl(640)} 640w,
                            ${coverUrl(768)} 768w,
                            ${coverUrl(1024)} 1024w,
                            ${coverUrl(1280)} 1280w,
                            ${coverUrl(1536)} 1536w,
                        `}
                        alt=""
                    />
                </div>
                <div
                    className={`flex w-full flex-col justify-center gap-6
                    bg-notBlack px-12 py-8
                    lg:max-w-lg lg:px-24`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
