import thinkbug from "@/client/images/thinkbug.png";
import { serverPathFromImport } from "@/client/lib/server-path-from-import";
import { tw } from "@/client/lib/tw-tagged-literal";
import { useQuery } from "@tanstack/react-query";
import React, { FunctionComponent, useEffect } from "react";
import RenderIfVisible from "react-render-if-visible";
import { useSiteConfig } from "../../providers/site-config-provider";

export type IframelyEmbedProps = {
    url: string;
};

type IframelyResponse =
    | { html: string; error: undefined }
    | { html: undefined; status: number; error: string };

declare const window: Window &
    typeof globalThis & {
        iframely: {
            load: () => unknown;
            on: (event: string, cb: (...args: unknown[]) => void) => void;
        };
    };

export const IframelyEmbed: FunctionComponent<IframelyEmbedProps> = React.memo(
    (props) => {
        const siteConfig = useSiteConfig();

        useEffect(() => {
            window.iframely && window.iframely.load();
        });

        const { data, status } = useQuery<IframelyResponse>(
            ["iframely", props.url],
            ({ queryKey }) =>
                fetch(
                    `https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(
                        queryKey[1] as string
                    )}&key=${siteConfig.IFRAMELY_KEY}&iframe=1&omit_script=1`
                ).then((res) => res.json()),
            {
                staleTime: Infinity, // never refetch
                keepPreviousData: true, // but just in case we do, keep using the old data
                retry: false, // pretty much all error states are an issue with the URL or our account. no reason to retry
            }
        );

        let embedBody = undefined;

        // prioritize states where we have data so that we don't accidentally swap
        // to `loading...` on refetch
        if (data && data.error) {
            embedBody = (
                <div
                    className={tw`co-embed co-loading not-prose flex flex-row gap-8 py-8 pl-8`}
                >
                    <img
                        className="max-w-[106px] object-contain"
                        src={serverPathFromImport(thinkbug)}
                        alt=""
                    />
                    <div className="self-center" data-testid="iframely-error">
                        <p className="font-league text-2xl font-semibold">
                            hmm...
                        </p>
                        <p className="font-atkinson text-2xl">
                            something went wrong with this preview.
                        </p>
                        <p className="font-atkinson text-2xl">
                            here's why: {data.error}
                        </p>
                    </div>
                </div>
            );
        } else if (data && data.html) {
            embedBody = (
                // only render the iframely player if it's visible onscreen
                // because we can't take its children out of the tab order; set
                // initial visibility to true to minimize glitches for elements
                // above the fold in a read-more post when the read more is
                // closed
                <RenderIfVisible initialVisible={true}>
                    <div dangerouslySetInnerHTML={{ __html: data.html }} />
                </RenderIfVisible>
            );
        } else if (status === "loading") {
            // display `loading...` immediately instead of waiting for the request to
            // actually start
            embedBody = (
                <div
                    className={tw`co-embed co-loading not-prose flex flex-row gap-8 py-8 pl-8`}
                >
                    {/* TODO: add throbber */}
                    <div className="h-[102px] w-[106px]">&nbsp;</div>
                    <div className="self-center">
                        <p className="font-atkinson text-2xl">loading...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className={tw`co-embed`}>
                {embedBody}
                <div className={tw`co-ui-text mt-0 p-3 text-right`}>
                    <a href={props.url} target="_blank" rel="noopener nofollow">
                        {props.url}
                    </a>
                </div>
            </div>
        );
    }
);

IframelyEmbed.displayName = "IframelyEmbed";
