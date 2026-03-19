import { useMedia } from "react-use";

export type BreakpointName = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: { [breakpoint in BreakpointName]: string } = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
};

export const useTailwindBreakpoint = (breakpoint: BreakpointName) =>
    useMedia(`(min-width: ${breakpoints[breakpoint]})`, false);
