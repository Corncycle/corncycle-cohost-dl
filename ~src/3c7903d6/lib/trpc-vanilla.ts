import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/src/routes/api/trpc-type";
import sitemap from "@/shared/sitemap";

/**
 * DO NOT USE THIS! FOR TYPING ONLY
 */
const wrappedTRPCProxyClient_DoNotUse = () =>
    createTRPCProxyClient<AppRouter>({ links: [] });

let vanillaClient: ReturnType<typeof wrappedTRPCProxyClient_DoNotUse>;

export function getVanillaClient(): typeof vanillaClient {
    if (!vanillaClient) {
        const url = sitemap.public.apiV1.trpc().toString();

        vanillaClient = createTRPCProxyClient<AppRouter>({
            links: [
                httpBatchLink({
                    url,
                    fetch(url, options) {
                        return fetch(url, {
                            ...options,
                            credentials: "include",
                        });
                    },
                    maxURLLength: 2083,
                }),
            ],
        });
    }

    return vanillaClient;
}
