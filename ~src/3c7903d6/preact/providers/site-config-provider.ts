import { createContext, useContext } from "react";
import { SiteConfigType, defaultConfig } from "@/shared/util/site-config";

export const SiteConfigProvider = createContext<SiteConfigType>(defaultConfig);

export const useSiteConfig = () => {
    const ctx = useContext(SiteConfigProvider);
    return ctx;
};
