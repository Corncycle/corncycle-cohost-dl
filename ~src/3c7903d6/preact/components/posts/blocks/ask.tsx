import anonBug from "@/client/images/anonbug.png";
import { renderMarkdownReactNoHTML } from "@/client/lib/markdown/other-rendering";
import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap from "@/shared/sitemap";
import { AskViewBlock } from "@/shared/types/post-blocks";
import React, { FunctionComponent, useMemo } from "react";
import { useDisplayPrefs } from "@/client/preact/hooks/use-display-prefs";
import { ProjectAvatar } from "@/client/preact/components/partials/project-avatar";

export const Ask: FunctionComponent<{
    askBlock: AskViewBlock;
}> = ({ askBlock: { ask } }) => {
    const attribution = useMemo(() => {
        if (ask.anon) {
            return (
                <span className="font-bold">
                    {ask.loggedIn ? "Anonymous User" : "Anonymous Guest"}
                </span>
            );
        }

        return (
            <a
                className="font-bold hover:underline"
                href={sitemap.public.project
                    .mainAppProfile({ projectHandle: ask.askingProject.handle })
                    .toString()}
            >
                @{ask.askingProject.handle}
            </a>
        );
    }, [ask.anon, ask.askingProject?.handle, ask.loggedIn]);

    const displayPrefs = useDisplayPrefs();

    const rendered = useMemo(() => {
        return renderMarkdownReactNoHTML(ask.content, new Date(ask.sentAt), {
            renderingContext: "ask",
            disableEmbeds: true,
            externalLinksInNewTab: displayPrefs.externalLinksInNewTab,
            hasCohostPlus: false,
        });
    }, [ask.content, ask.sentAt, displayPrefs.externalLinksInNewTab]);

    return (
        <div
            data-askid={ask.askId}
            className={tw`co-embedded-ask m-3 grid grid-cols-[2rem_1fr] grid-rows-[2rem_1fr] gap-x-3 gap-y-2 rounded-lg border p-3`}
        >
            {ask.anon ? (
                <img
                    src={sitemap.public.static
                        .staticAsset({ path: anonBug })
                        .toString()}
                    className="mask mask-squircle col-start-1 row-start-1 h-8 w-8"
                    alt=""
                />
            ) : (
                <ProjectAvatar
                    project={ask.askingProject}
                    noLink={true}
                    className="col-start-1 row-start-1 h-8 w-8"
                />
            )}
            <span
                className={tw`co-attribution col-start-2 row-start-1 align-middle leading-8`}
            >
                {attribution} asked:{" "}
            </span>
            <div className={tw`co-prose prose col-start-2 row-start-2`}>
                {rendered}
            </div>
        </div>
    );
};

export default Ask;
