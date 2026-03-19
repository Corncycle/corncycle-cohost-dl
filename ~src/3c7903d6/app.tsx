// ensure the broken attachment icon actually gets its hash icon in /static/
import "@/client/images/placeholders/attach_padding.svg";
import sitemap from "@/shared/sitemap";
import ClientStateID from "@/shared/types/client-state-ids";
import { SiteConfigType } from "@/shared/util/site-config";
import {
    Hydrate,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import FlagsProvider, { IConfig, IToggle } from "@unleash/proxy-client-react";
import { Resource } from "i18next";
import React, { FunctionComponent, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { useSSR } from "react-i18next";
import type { Configuration as RollbarConfig } from "rollbar";
import { loadJSONFromID } from "./lib/load-json-from-id";
import { trpc } from "./lib/trpc";
import { FlashesProvider } from "./preact/providers/flashes";
import {
    ReqMutableStoreProvider,
    ReqMutableStoreType,
} from "./preact/providers/req-mutable-store";
import { RollbarProvider } from "./preact/providers/rollbar";
import { SiteConfigProvider } from "./preact/providers/site-config-provider";
import { UserInfoProvider } from "./preact/providers/user-info-provider";

export const App: FunctionComponent<{ children: React.ReactChild }> = ({
    children,
}) => {
    const siteConfig = loadJSONFromID<SiteConfigType>(
        ClientStateID.SITE_CONFIG
    );
    const initialI18nStore = loadJSONFromID<Resource>(
        ClientStateID.INITIAL_I18N_STORE
    );
    const initialLanguage = loadJSONFromID<string>(
        ClientStateID.INITIAL_LANGUAGE
    );

    const flashes = loadJSONFromID<{ info: string[]; error: string[] }>(
        ClientStateID.FLASHES
    );

    const rollbarConfig = loadJSONFromID<RollbarConfig>(
        ClientStateID.ROLLBAR_CONFIG
    );

    const unleashBootstrap = loadJSONFromID<IToggle[]>(
        ClientStateID.UNLEASH_BOOTSTRAP
    );

    const mutableStore = loadJSONFromID<ReqMutableStoreType>(
        ClientStateID.INITIAL_MUTABLE_STORE
    );

    const unleashConfig: IConfig = {
        appName: siteConfig.UNLEASH_APP_NAME,
        url: sitemap.public.unleashProxy().toString(),
        clientKey: siteConfig.UNLEASH_CLIENT_KEY,
        bootstrap: unleashBootstrap,
        disableRefresh: true,
    };
    const dehyrdatedState = loadJSONFromID(ClientStateID.TRPC_DEHYRDATED_STATE);

    useSSR(initialI18nStore, initialLanguage);

    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: sitemap.public.apiV1.trpc().toString(),
                    maxURLLength: 2083,
                    fetch(url, options) {
                        return fetch(url, {
                            ...options,
                            credentials: "include",
                        });
                    },
                }),
            ],
        })
    );

    return (
        <React.StrictMode>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <Hydrate state={dehyrdatedState}>
                        <HelmetProvider>
                            <RollbarProvider config={rollbarConfig}>
                                <FlagsProvider config={unleashConfig}>
                                    <UserInfoProvider>
                                        <FlashesProvider.Provider
                                            value={flashes}
                                        >
                                            <SiteConfigProvider.Provider
                                                value={siteConfig}
                                            >
                                                <ReqMutableStoreProvider
                                                    store={mutableStore}
                                                >
                                                    {children}
                                                </ReqMutableStoreProvider>
                                            </SiteConfigProvider.Provider>
                                        </FlashesProvider.Provider>
                                    </UserInfoProvider>
                                </FlagsProvider>
                            </RollbarProvider>
                        </HelmetProvider>
                    </Hydrate>
                </QueryClientProvider>
            </trpc.Provider>
        </React.StrictMode>
    );
};
