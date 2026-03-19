import { createContext } from "react";

export const FlashesProvider = createContext<{
    info: string[];
    error: string[];
}>({
    info: [],
    error: [],
});
