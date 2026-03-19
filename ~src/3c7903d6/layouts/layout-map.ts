import React, { ComponentType } from "react";
import { AuthnLayout } from "./authn";
import { ErrorLayout } from "./error";
import { IFrameLayout } from "./iframe";
import { MainLayout } from "./main";
import { MainNoFooterLayout } from "./main-no-footer";
import { StaticLayout } from "./static";
import { StaticNoWrapperLayout } from "./static-no-wrapper";

export type LayoutProps = { children: React.ReactNode };

const layouts = new Map<string, ComponentType<LayoutProps>>([
    ["main", MainLayout],
    ["mainNoFooter", MainNoFooterLayout],
    ["iframe", IFrameLayout],
    ["authn", AuthnLayout],
    ["error", ErrorLayout],
    ["static", StaticLayout],
    ["staticNoWrapper", StaticNoWrapperLayout],
]);

export const layoutByName = (name: string): ComponentType<LayoutProps> => {
    const layout = layouts.get(name);
    return layout ?? MainLayout;
};
