import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { type LayoutProps } from "./layout-map";

export const IFrameLayout: FunctionComponent<LayoutProps> = ({ children }) => {
    return (
        <div>
            <Helmet>
                <base target="_parent" />
                <meta name="robots" content="noindex" />
            </Helmet>
            {children}
        </div>
    );
};
