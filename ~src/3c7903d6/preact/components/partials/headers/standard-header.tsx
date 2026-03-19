import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";
import React, { FunctionComponent, ReactChild } from "react";

export const StandardHeader: FunctionComponent<{ children: ReactChild }> = ({
    children,
}) => {
    const dynamicTheme = useDynamicTheme();

    return (
        <div
            className={`co-themed-box co-header-alert cohost-shadow-light dark:cohost-shadow-dark flex flex-row items-start self-stretch p-3`}
            data-theme={dynamicTheme.current}
        >
            {children}
        </div>
    );
};
