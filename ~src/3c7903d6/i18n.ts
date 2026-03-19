import i18n from "i18next";
import Backend from "i18next-chained-backend";

import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import { env } from "@/shared/env";

const isDevelopment = process.env.NODE_ENV !== "production";

// @ts-expect-error there's some weird shit happening with declaration merging. i can't figure it out.
i18n.use(Backend)
    .use(initReactI18next)
    .init({
        backend: {
            backends: [LocalStorageBackend, HttpBackend],
            backendOptions: [
                {
                    expirationTime: isDevelopment
                        ? 0 // no cache in dev
                        : 30 * 24 * 60 * 60 * 1000, // 30 days
                    defaultVersion: env.VERSION,
                },
                {
                    loadPath: `/rc/locales/{{lng}}/{{ns}}.json?${env.VERSION}`,
                },
            ],
        },
        lng: "en",
        fallbackLng: "en",
        debug: process.env.NODE_ENV !== "production",
        interpolation: { escapeValue: true },
        // TODO: move server keys that are actually needed on the client to `client` namespace
        ns: ["client", "common", "server"],
        react: {
            useSuspense: false,
        },
    })
    .catch((e) => console.error(e));

export default i18n;

// ye olde hack to make common strings used in interpolation stick around
// t("common:username", "username")
// t("common:handle", "handle")
// t("common:email", "e-mail")
// t("common:password", "password")
