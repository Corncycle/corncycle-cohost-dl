import tailwindConfig from "@/client/../tailwind.config.js";
import rgba from "color-rgba";
import { type ThemeConfig } from "tailwindcss/types/config";

// we need to disable this rule here since otherwise eslint gets upset. one of
// those edge cases.
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const colors = tailwindConfig.theme.extend
    ?.colors as ThemeConfig["colors"];

export function tailwindColor(name: string, variant = "DEFAULT"): string {
    if (typeof colors !== "object") {
        return "fuschia";
    }

    const colorFamily = colors[name];
    if (typeof colorFamily === "object") {
        const candidate = colorFamily[variant] ?? colorFamily[500];
        if (typeof candidate === "string") {
            return candidate;
        }
    } else if (typeof colorFamily === "string") {
        return colorFamily;
    }

    // this is an error state
    return "fuschia";
}

export function varForTailwindColor(name: string, variant = "DEFAULT"): string {
    const color = tailwindColor(name, variant);
    return varForColor(color);
}

export function varForColor(color: string): string {
    const parsed = rgba(color) ?? [0, 0, 0, 0];
    return parsed.slice(0, 3).join(" ");
}
