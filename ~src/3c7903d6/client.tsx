import "@fontsource/atkinson-hyperlegible/400-italic.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700-italic.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/source-code-pro";
import "../sass/main.scss";

import axios from "axios";

axios.defaults.withCredentials = true;

import loadable, { loadableReady } from "@loadable/component";

import ClientStateID from "@/shared/types/client-state-ids";
import { env } from "@/shared/env";
import React, { ComponentType } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { App } from "./app";
import { layoutByName } from "./layouts/layout-map";
import { loadJSONFromID } from "./lib/load-json-from-id";
import { CohostRoutes } from "./preact/routes";

export type ServerPropsType = {
    [displayName: string]: Record<string, unknown>;
};

const AsyncPage = loadable<{ page: string }>(
    (props) =>
        import(`@/client/preact/components/pages/${props.page}`) as Promise<
            ComponentType<{ page: string }>
        >,
    {
        cacheKey: (props) => props.page,
    }
);

const setupApp = async () => {
    const appEl = document.getElementById("app");
    if (!appEl) {
        console.info(
            "Couldn't find app EL, probably not loaded that far yet. trying again in 20ms"
        );
        setTimeout(setupApp, 20);
        return;
    }
    const state = loadJSONFromID<ServerPropsType>(
        ClientStateID.COHOST_LOADER_STATE
    );
    const Layout = layoutByName(
        loadJSONFromID<string>(ClientStateID.COHOST_LAYOUT)
    );

    const envVars = loadJSONFromID<Record<string, string>>(
        ClientStateID.ENV_VARS
    );

    env.setEnv(envVars);

    await import("./i18n"); // load after env so the version is available (needed for cache busting)

    ReactDOM.hydrateRoot(
        appEl,
        <App>
            <BrowserRouter>
                <CohostRoutes>
                    <Route
                        path="*"
                        element={
                            <Layout>
                                {Object.keys(state).map((name) => (
                                    <AsyncPage
                                        key={name}
                                        page={name}
                                        {...state[name]}
                                    />
                                ))}
                            </Layout>
                        }
                    ></Route>
                </CohostRoutes>
            </BrowserRouter>
        </App>
    );
};

void loadableReady(setupApp);
