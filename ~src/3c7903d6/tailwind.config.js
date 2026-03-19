/** @type {import('tailwindcss').Config} */

function withOpacityValue(variable) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${variable}))`;
        }
        return `rgb(var(${variable}) / ${opacityValue})`;
    };
}

const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

const atkinsonStack = [
    "Atkinson Hyperlegible",
    ...defaultTheme.fontFamily.sans,
];
const leagueStack = ["League Mono", ...defaultTheme.fontFamily.mono];

module.exports = {
    content: ["./client/**/*.tsx", "./src/**/*.tsx", "./client/**/*.mdx"],
    theme: {
        fontFamily: {
            display: leagueStack,
            body: atkinsonStack,
            league: leagueStack,
            atkinson: atkinsonStack,
            sans: atkinsonStack,
        },
        extend: {
            colors: {
                text: withOpacityValue("--color-text"),
                accent: withOpacityValue("--color-accent"),
                secondary: {
                    100: withOpacityValue("--color-secondary-100"),
                    200: withOpacityValue("--color-secondary-200"),
                    300: withOpacityValue("--color-secondary-300"),
                    400: withOpacityValue("--color-secondary-400"),
                    500: withOpacityValue("--color-secondary-500"),
                    600: withOpacityValue("--color-secondary-600"),
                    700: withOpacityValue("--color-secondary-700"),
                    800: withOpacityValue("--color-secondary-800"),
                    DEFAULT: withOpacityValue("--color-secondary"),
                },
                tertiary: {
                    200: withOpacityValue("--color-tertiary-200"),
                    300: withOpacityValue("--color-tertiary-300"),
                    400: withOpacityValue("--color-tertiary-400"),
                    500: withOpacityValue("--color-tertiary-500"),
                    600: withOpacityValue("--color-tertiary-600"),
                    700: withOpacityValue("--color-tertiary-700"),
                    800: withOpacityValue("--color-tertiary-800"),
                    DEFAULT: withOpacityValue("--color-tertiary"),
                },
                foreground: {
                    100: withOpacityValue("--color-foreground-100"),
                    200: withOpacityValue("--color-foreground-200"),
                    300: withOpacityValue("--color-foreground-300"),
                    400: withOpacityValue("--color-foreground-400"),
                    500: withOpacityValue("--color-foreground-500"),
                    600: withOpacityValue("--color-foreground-600"),
                    700: withOpacityValue("--color-foreground-700"),
                    800: withOpacityValue("--color-foreground-800"),
                    DEFAULT: withOpacityValue("--color-foreground"),
                },
                bgText: withOpacityValue("--color-bg-text"),
                background: withOpacityValue("--color-background"),
                sidebarBg: withOpacityValue("--color-sidebar-bg"),
                sidebarText: withOpacityValue("--color-sidebar-text"),
                sidebarAccent: withOpacityValue("--color-sidebar-accent"),
                composeButton: {
                    DEFAULT: withOpacityValue("--color-compose-button"),
                    500: withOpacityValue("--color-compose-button"),
                    400: withOpacityValue("--color-compose-button-400"),
                    600: withOpacityValue("--color-compose-button-600"),
                },
                longan: {
                    100: "#FFF1DF",
                    200: "#FFE5C4",
                    300: "#FFD8A8",
                    400: "#FFCA7A",
                    500: "#DFA44E",
                    600: "#B7853D",
                    700: "#845E26",
                    800: "#573707",
                    900: "#281800",
                    DEFAULT: "#FFD8A8",
                },
                mango: {
                    100: "#FFE8D4",
                    200: "#FFD0AC",
                    300: "#FFBF83",
                    400: "#FFAB5C",
                    500: "#E58F3E",
                    600: "#BC6D28",
                    700: "#934A15",
                    800: "#673104",
                    900: "#281400",
                    DEFAULT: "#FFAB5C",
                },
                strawberry: {
                    100: "#FAD8D6",
                    200: "#F4BBBB",
                    300: "#EE999B",
                    400: "#E56B6F",
                    500: "#D54A50",
                    600: "#A42A2F",
                    700: "#7B1B1F",
                    800: "#52070A",
                    900: "#310004",
                    DEFAULT: "#E56B6F",
                },
                cherry: {
                    100: "#FDCEE0",
                    200: "#EEADC7",
                    300: "#D3749B",
                    400: "#AE4473",
                    500: "#83254F",
                    600: "#671A3D",
                    700: "#51112E",
                    800: "#3B0920",
                    900: "#220010",
                    DEFAULT: "#83254F",
                },
                gray: {
                    100: "#FFF9F2",
                    200: "#DED9D3",
                    300: "#BFBAB5",
                    400: "#A09C98",
                    500: "#827F7C",
                    600: "#686664",
                    700: "#4A4847",
                    800: "#2E2D2C",
                    900: "#191919",
                    DEFAULT: "#191919",
                },
                notWhite: "#fff9f2",
                notBlack: "#191919",
                green: {
                    DEFAULT: "#319D35",
                    100: "#E2F6D0",
                    200: "#B2DDA6",
                    300: "#82C67B",
                    400: "#4BAC4A",
                    500: "#319D35",
                    600: "#1F7622",
                    700: "#175919",
                    800: "#0E3B10",
                    900: "#061E07",
                },
                red: {
                    DEFAULT: "#FF4949",
                    200: "#FFB3AD",
                    300: "#FF8E8A",
                    400: "#FF6C6A",
                    500: "#FF4949",
                    600: "#CC3A3A",
                    700: "#992C2C",
                    800: "#661D1D",
                    900: "#330F0F",
                },
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme("colors.notBlack"),
                        a: {
                            color: theme("colors.cherry"),
                        },
                        hr: {
                            marginTop: "1em",
                            marginBottom: "1em",
                        },
                    },
                },
                dark: {
                    css: {
                        // text outside any tag doesn't actually seem to get
                        // --tw-prose-body?
                        color: theme("colors.notWhite"),
                        "--tw-prose-body": theme("colors.notWhite"),
                        "--tw-prose-headings": theme("colors.notWhite"),
                        "--tw-prose-lead": theme("colors.notWhite"),
                        "--tw-prose-links": theme("colors.notWhite"),
                        "--tw-prose-bold": theme("colors.notWhite"),
                        "--tw-prose-counters": theme("colors.notWhite"),
                        "--tw-prose-bullets": theme("colors.notWhite"),
                        "--tw-prose-hr": theme("colors.gray[300]"),
                        "--tw-prose-quotes": theme("colors.notWhite"),
                        "--tw-prose-quote-borders": theme("colors.gray[300]"),
                        "--tw-prose-captions": theme("colors.notWhite"),
                        "--tw-prose-code": theme("colors.notWhite"),
                        "--tw-prose-pre-code": theme("colors.notWhite"),
                        "--tw-prose-pre-bg": theme("colors.notBlack"),
                        "--tw-prose-th-borders": theme("colors.gray[300]"),
                        "--tw-prose-td-borders": theme("colors.gray[300]"),
                    },
                },
                sidebar: {
                    css: {
                        "--tw-prose-body": theme("colors.sidebarText"),
                        "--tw-prose-headings": theme("colors.sidebarText"),
                        "--tw-prose-lead": theme("colors.sidebarText"),
                        "--tw-prose-links": theme("colors.sidebarText"),
                        "--tw-prose-bold": theme("colors.sidebarText"),
                        "--tw-prose-counters": theme("colors.sidebarText"),
                        "--tw-prose-bullets": theme("colors.sidebarText"),
                        "--tw-prose-hr": theme("colors.sidebarText"),
                        "--tw-prose-quotes": theme("colors.sidebarText"),
                        "--tw-prose-quote-borders": theme("colors.sidebarText"),
                        "--tw-prose-captions": theme("colors.sidebarText"),
                        "--tw-prose-code": theme("colors.sidebarText"),
                        "--tw-prose-pre-code": theme("colors.pink[100]"),
                        "--tw-prose-pre-bg": theme("colors.sidebarText"),
                        "--tw-prose-th-borders": theme("colors.sidebarText"),
                        "--tw-prose-td-borders": theme("colors.pink[200]"),
                    },
                },
            }),
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms"),
        require("tailwindcss-logical"),
        require("@headlessui/tailwindcss"),
        plugin(function ({ addVariant }) {
            addVariant("no-hover", "@media (hover: none)");
        }),
    ],
};
