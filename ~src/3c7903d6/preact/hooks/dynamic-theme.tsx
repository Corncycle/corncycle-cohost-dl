import { PostBoxTheme } from "@/shared/types/display-prefs";
import { createContext, useState } from "react";
import { useMedia } from "react-use";
import { useDisplayPrefs } from "./use-display-prefs";

export type DynamicThemeState = PostBoxTheme | "both";

export const usePrefersDark = () =>
    useMedia("(prefers-color-scheme: dark)", false);

export function useDefaultThemeState(): DynamicThemeState {
    const defaultPostBoxThemeSetting = useDisplayPrefs().defaultPostBoxTheme;

    switch (defaultPostBoxThemeSetting) {
        case "prefers-color-scheme":
            return "both";
        default:
            return defaultPostBoxThemeSetting;
    }
}

export function useDynamicTheme(): {
    current: DynamicThemeState;
    forceTheme: (theme: PostBoxTheme) => void;
} {
    const defaultPostBoxThemeSetting = useDisplayPrefs().defaultPostBoxTheme;
    const [forcedTheme, forceTheme] = useState<PostBoxTheme | null>(null);

    if (forcedTheme) {
        return { current: forcedTheme, forceTheme };
    } else if (defaultPostBoxThemeSetting === "prefers-color-scheme") {
        return { current: "both", forceTheme };
    } else {
        return { current: defaultPostBoxThemeSetting, forceTheme };
    }
}
