import React, { FunctionComponent } from "react";
import { SidebarMenu } from "../preact/components/sidebar-menu";
import { type LayoutProps } from "./layout-map";
import { MainLayout } from "./main";

export const StaticNoWrapperLayout: FunctionComponent<LayoutProps> = ({
    children,
}) => {
    return (
        <MainLayout>
            <main className="w-full pt-16">
                <div className="container mx-auto grid grid-cols-1 gap-16 md:grid-cols-4">
                    <SidebarMenu />
                    <section className="col-span-1 flex flex-col gap-12 md:col-span-2">
                        {children}
                    </section>
                </div>
            </main>
        </MainLayout>
    );
};
