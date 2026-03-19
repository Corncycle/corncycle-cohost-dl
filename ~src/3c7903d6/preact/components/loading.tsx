import React, { FunctionComponent } from "react";
import sitemap from "@/shared/sitemap";
import path from "path";
import _ from "lodash";

// copied/modified from emoji.ts, we can't use that directly because Loading can
// be used before the home env is available so using emoji directly crashes the
// app.
function importAll(
    r: __WebpackModuleApi.RequireContext
): { name: string; baseUrl: string }[] {
    return r.keys().map<{ name: string; baseUrl: string }>((key) => {
        const name = path.basename(key, path.extname(key));
        return {
            baseUrl: r<string>(key),
            name,
        };
    });
}

const customEmoji =
    // require.context is webpack runtime specific and thus not available under jest
    typeof process !== "undefined" && process.env?.RUN_MODE === "test"
        ? []
        : importAll(
              require.context("../../images/emoji", false, /\.(png|jpe?g|svg)$/)
          );

const cohostPlusCustomEmoji =
    // require.context is webpack runtime specific and thus not available under jest
    typeof process !== "undefined" && process.env?.RUN_MODE === "test"
        ? []
        : importAll(
              require.context(
                  "../../images/plus-emoji",
                  false,
                  /\.(png|jpe?g|svg)$/
              )
          );

const eggbugEmojiOnly = [...customEmoji, ...cohostPlusCustomEmoji].filter(
    (emoji) => emoji.name.includes("eggbug") && emoji.name !== "eggbug-classic"
);

export const Loading: FunctionComponent<{ className?: string }> = ({
    className,
}) => {
    return (
        <div
            className={`flex flex-row items-center gap-2 motion-safe:animate-bounce motion-reduce:animate-pulse ${
                className ?? ""
            }`}
        >
            <LoadingIcon />
            loading...
        </div>
    );
};

export const LoadingIcon = () => {
    const loadingEmoji = _.sample(eggbugEmojiOnly)?.baseUrl;
    return loadingEmoji ? (
        <img
            className="inline-block h-6 flex-none"
            src={sitemap.public.static
                .staticAsset({ path: loadingEmoji })
                .toString()}
            alt=""
        />
    ) : null;
};
