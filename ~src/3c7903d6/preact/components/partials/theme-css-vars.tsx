import { varForColor, varForTailwindColor } from "@/client/lib/theme-helpers";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useReqMutableStore } from "../../providers/req-mutable-store";

const chaosDay22Theme = `
:root {
    --color-text: 249 254 255; /* white-ish */
    --color-bg-text: 249 254 255; /* same white-ish */
    
    /* used https://uicolors.app/ to generate these */
    --color-foreground-100: ${varForColor("#ebeff3")};
    --color-foreground-200: ${varForColor("#d2dbe5")};
    --color-foreground-300: ${varForColor("#abbdce")};
    --color-foreground-400: ${varForColor("#7e99b2")};
    --color-foreground-500: ${varForColor("#5e7d99")};
    --color-foreground-600: ${varForColor("#4a647f")};
    --color-foreground-700: ${varForColor("#435972")};
    --color-foreground-800: ${varForColor("#354557")};
    --color-foreground: ${varForColor("#435972")}; /* tumblr blue (light) */
    
    --color-accent: 138 174 117; /* green-ish */    
    
    /* a darker blue, poor contrast */
    --color-secondary: ${varForColor("#668093")};
    --color-secondary-100: ${varForColor("#e2e8eb")};
    --color-secondary-200: ${varForColor("#c7d2da")};
    --color-secondary-300: ${varForColor("#a1b3bf")};
    --color-secondary-400: ${varForColor("#668093")};
    --color-secondary-500: ${varForColor("#576f83")};
    --color-secondary-600: ${varForColor("#4b5e6f")};
    --color-secondary-700: ${varForColor("#414f5d")};
    --color-secondary-800: ${varForColor("#3b444f")};

    --color-tertiary: ${varForColor("#2c4763")};
    --color-tertiary-200: ${varForColor("#cddbea")};
    --color-tertiary-300: ${varForColor("#a1bdd8")};
    --color-tertiary-400: ${varForColor("#6f9bc1")};
    --color-tertiary-500: ${varForColor("#4d7eaa")};
    --color-tertiary-600: ${varForColor("#3a648f")};
    --color-tertiary-700: ${varForColor("#305174")};
    --color-tertiary-800: ${varForColor("#2c4763")};
    
    
    --color-background: 44 71 99; /* tumblr blue (dark) */
    --color-sidebar-bg: 219 233 244; /* tumblr placeholder bg */
    --color-sidebar-text: 25 25 25; /* not-black */
    --color-sidebar-accent: ${varForColor("#2c4763")}; /* tumblr blue (light) */
    
    --color-compose-button: ${varForColor("#83B05F")};
    --color-compose-button-400: ${varForColor("#98BD7A")};
    --color-compose-button-600: ${varForColor("#679047")};

    /* default brand colors to avoid breaking shit by accident */
    --color-notWhite: ${varForTailwindColor("notWhite")};
    --color-notBlack: ${varForTailwindColor("notBlack")};
    --color-cherry: var(--color-foreground);
    --color-strawberry: var(--color-secondary);
    --color-mango: var(--color-accent);
    --color-longan: var(--color-tertiary);
}`;

const normalTheme = `
/*
 * colors specified as bare RGB components so they can get
 * merged with opacity if needed. see \`tailwind.config.js\`
 * for more info. */

:root {
    --color-notWhite: ${varForTailwindColor("notWhite")};
    --color-notBlack: ${varForTailwindColor("notBlack")};
    --color-cherry: ${varForTailwindColor("cherry")};
    --color-strawberry: ${varForTailwindColor("strawberry")};
    --color-mango: ${varForTailwindColor("mango")};
    --color-longan: ${varForTailwindColor("longan")};


    --color-text: var(--color-notWhite);
    --color-bg-text: var(--color-notBlack);

    --color-foreground-100: ${varForTailwindColor("cherry", "100")};
    --color-foreground-200: ${varForTailwindColor("cherry", "200")};
    --color-foreground-300: ${varForTailwindColor("cherry", "300")};
    --color-foreground-400: ${varForTailwindColor("cherry", "400")};
    --color-foreground-500: ${varForTailwindColor("cherry", "500")};
    --color-foreground-600: ${varForTailwindColor("cherry", "600")};    
    --color-foreground-700: ${varForTailwindColor("cherry", "700")};
    --color-foreground-800: ${varForTailwindColor("cherry", "800")};
    --color-foreground: var(--color-cherry);

    --color-secondary-200: ${varForTailwindColor("strawberry", "200")};
    --color-secondary-300: ${varForTailwindColor("strawberry", "300")};
    --color-secondary-400: ${varForTailwindColor("strawberry", "400")};
    --color-secondary-600: ${varForTailwindColor("strawberry", "600")};
    --color-secondary-700: ${varForTailwindColor("strawberry", "700")};
    --color-secondary: var(--color-strawberry);

    --color-tertiary: var(--color-longan);
    --color-tertiary-200: ${varForTailwindColor("longan", "200")};
    --color-tertiary-300: ${varForTailwindColor("longan", "300")};
    --color-tertiary-400: ${varForTailwindColor("longan", "400")};
    --color-tertiary-500: ${varForTailwindColor("longan", "600")};
    --color-tertiary-600: ${varForTailwindColor("longan", "600")};
    --color-tertiary-700: ${varForTailwindColor("longan", "700")};

    --color-accent: var(--color-mango);
    --color-background: var(--color-notWhite);
    --color-sidebar-bg: var(--color-notWhite);
    --color-sidebar-text: var(--color-notBlack);
    --color-sidebar-accent: var(--color-cherry);

    --color-compose-button: var(--color-foreground);
    --color-compose-button-400: var(--color-foreground-400);
    --color-compose-button-600: var(--color-foreground-600);
}

@media (max-width: 767px) {
    :root {
        --color-foreground: ${varForTailwindColor("cherry", "600")};
    }
}
`;

const darkTheme = `@media (prefers-color-scheme: dark) {
    :root {
        --color-text: var(--color-notWhite);
        --color-bg-text: var(--color-notWhite);

        --color-foreground-100: ${varForTailwindColor("cherry", "100")};
        --color-foreground-200: ${varForTailwindColor("cherry", "200")};
        --color-foreground-300: ${varForTailwindColor("cherry", "300")};
        --color-foreground-400: ${varForTailwindColor("cherry", "400")};
        --color-foreground-500: ${varForTailwindColor("cherry", "500")};
        --color-foreground-600: ${varForTailwindColor("cherry", "600")};
        --color-foreground-700: ${varForTailwindColor("cherry", "700")};
        --color-foreground-800: ${varForTailwindColor("cherry", "800")};
        --color-foreground: var(--color-cherry);
        
        --color-secondary-200: ${varForTailwindColor("mango", "200")};
        --color-secondary-300: ${varForTailwindColor("mango", "300")};
        --color-secondary-400: ${varForTailwindColor("mango", "400")};
        --color-secondary-600: ${varForTailwindColor("mango", "600")};
        --color-secondary-700: ${varForTailwindColor("mango", "700")};
        --color-secondary: var(--color-mango);

        --color-accent: var(--color-mango);
        --color-background: var(--color-notBlack);
        --color-sidebar-bg: var(--color-notBlack);
        --color-sidebar-text: var(--color-notWhite);    
        --color-sidebar-accent: var(--color-mango);

        --color-compose-button: var(--color-foreground);
        --color-compose-button-400: var(--color-foreground-400);
        --color-compose-button-600: var(--color-foreground-600);
    }

    @media (max-width: 767px) {
        :root {
            --color-foreground: ${varForTailwindColor("cherry", "600")};
        }
    }    
}`;

const combined = normalTheme + "\n" + darkTheme;

export const ThemeCSSVars: FunctionComponent<{
    mode?: "dynamic" | "light" | "light_with_themes";
}> = ({ mode = "dynamic" }) => {
    const chaosDay22 = useFlag(FeatureFlag.Enum["chaos-day-2022"]);
    const reqMutableStore = useReqMutableStore();
    const defaultLightOnly = reqMutableStore.get("lightThemeOnly");

    const selected = useMemo(() => {
        if (defaultLightOnly || mode === "light") {
            return normalTheme;
        }

        if (mode === "light_with_themes" && chaosDay22) {
            return chaosDay22Theme;
        }

        if (chaosDay22) {
            return chaosDay22Theme;
        }

        return combined;
    }, [chaosDay22, defaultLightOnly, mode]);

    const foregroundColor = chaosDay22 ? "#435972" : "#83254f";
    const mobileThemeColor = chaosDay22 ? "#435972" : "#671A3D";

    return (
        <Helmet>
            <style>{selected}</style>
            <style>{`
            :root {
                --emoji-scale: 1.25em;
            }
            `}</style>
            <meta
                name="theme-color"
                content={mobileThemeColor}
                media="(max-width: 1023px)"
            />
            <meta name="theme-color" content={foregroundColor} />
        </Helmet>
    );
};
