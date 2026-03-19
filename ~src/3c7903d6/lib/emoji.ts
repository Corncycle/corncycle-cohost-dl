import sitemap from "@/shared/sitemap";
import path from "path";
import { SKIP } from "unist-util-visit";
import { processMatches } from "./markdown/unified-processors";
import type { Plugin, CompilerFunction } from "unified";
// eslint-import-plugin has trouble resolving this one automatically
// eslint-disable-next-line import/no-unresolved
import { Element, Text, type Root } from "hast";

const EMOJI_REGEX = /:[a-zA-Z\d-_]+:/gims;

export type CustomEmoji = {
    id: string;
    name: string;
    keywords: string[];
    skins: { src: string }[];
    native?: undefined;
    // added by the library; we don't need to set it
    shortcodes?: string;
};
type CustomEmojiCategory = {
    id: string;
    name: string;
    emojis: CustomEmoji[];
};
export type CustomEmojiSet = CustomEmojiCategory[];

type NativeEmoji = {
    id: string;
    keywords: string[];
    name: string;
    native: string;
    shortcodes: string;
    unified: string;
};

export type Emoji = NativeEmoji | CustomEmoji;

function importAll(r: __WebpackModuleApi.RequireContext): CustomEmoji[] {
    return r.keys().map<CustomEmoji>((key) => {
        const name = path.basename(key, path.extname(key));
        return {
            id: name,
            name,
            skins: [
                {
                    src: sitemap.public.static
                        .staticAsset({ path: r<string>(key) })
                        .toString(),
                },
            ],
            keywords: [],
        };
    });
}

export const customEmoji =
    // require.context is webpack runtime specific and thus not available under jest
    typeof process !== "undefined" && process.env?.RUN_MODE === "test"
        ? []
        : importAll(
              require.context("../images/emoji", false, /\.(png|jpe?g|svg)$/)
          );

export const cohostPlusCustomEmoji =
    // require.context is webpack runtime specific and thus not available under jest
    typeof process !== "undefined" && process.env?.RUN_MODE === "test"
        ? []
        : importAll(
              require.context(
                  "../images/plus-emoji",
                  false,
                  /\.(png|jpe?g|svg)$/
              )
          );

export const indexableCustomEmoji = new Map<string, CustomEmoji>(
    customEmoji.reduce<[string, CustomEmoji][]>((collector, emoji) => {
        return [...collector, [emoji.name, emoji]];
    }, [])
);

export const indexableCohostPlusCustomEmoji = new Map<string, CustomEmoji>(
    cohostPlusCustomEmoji.reduce<[string, CustomEmoji][]>(
        (collector, emoji) => {
            return [...collector, [emoji.name, emoji]];
        },
        []
    )
);

type ParseOptions = {
    cohostPlus: boolean;
};

export const parseEmoji: Plugin<[ParseOptions], Root, void> = (options) => {
    const compiler: CompilerFunction<Root, void> = processMatches(
        EMOJI_REGEX,
        (matches, splits, node, index, parent) => {
            const els = splits.reduce<Array<Element | Text>>(
                (collector, curr, index) => {
                    const currNode: Text = {
                        type: "text",
                        value: curr,
                    };

                    const pending = [...collector, currNode];

                    if (index < matches.length) {
                        const emojiName = matches[index].slice(
                            1,
                            matches[index].length - 1
                        );
                        let emoji = indexableCustomEmoji.get(emojiName);
                        if (!emoji && options.cohostPlus) {
                            emoji =
                                indexableCohostPlusCustomEmoji.get(emojiName);
                        }

                        if (emoji) {
                            pending.push({
                                type: "element",
                                tagName: "CustomEmoji",
                                properties: {
                                    name: emoji.name,
                                    url: emoji.skins[0].src,
                                },
                                children: [],
                            } as Element);
                        } else {
                            pending.push({
                                type: "text",
                                value: matches[index],
                            });
                        }
                    }

                    return pending;
                },
                [] as Array<Element | Text>
            );
            parent.children.splice(index, 1, ...els);
            // skip over all the new elements we just created
            return [SKIP, index + els.length];
        }
    );
    return compiler;
};
