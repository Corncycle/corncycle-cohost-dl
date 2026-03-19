/**
 * For comments, page descriptions, etc. Everything that accepts markdown and
 * isn't a post.
 */

import { CustomEmoji } from "@/client/preact/components/posts/blocks/custom-emoji";
import { compile } from "html-to-text";
import { createElement, Fragment } from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { Mention } from "@/client/preact/components/posts/blocks/mention";
import { parseEmoji } from "../emoji";
import { chooseAgeRuleset } from "./sanitize";
import { MAX_GFM_LINES, RenderingOptions } from "./shared-types";
import {
    cleanUpFootnotes,
    convertMentions,
    copyImgAltToTitle,
} from "./unified-processors";
import remarkBreaks from "remark-breaks";
import _ from "lodash";

const convert = compile({
    wordwrap: false,
});

/**
 * Used in places like comments, page descriptions, etc. places we don't want to
 * support arbitrary HTML
 * @returns
 */
const markdownRenderStackNoHTML = (
    postDate: Date,
    lineLength: number,
    options: RenderingOptions
) => {
    let stack = unified().use(remarkParse);

    const ruleset = chooseAgeRuleset(postDate);

    if (ruleset.singleLineBreaks) {
        stack = stack.use(remarkBreaks);
    }

    const externalRel = ["nofollow"];
    if (options.externalLinksInNewTab) {
        externalRel.push("noopener");
    }

    if (lineLength < MAX_GFM_LINES) {
        stack = stack.use(remarkGfm, {
            singleTilde: false,
        });
    }

    const effectiveSchema = { ...ruleset.schema };

    if (options.renderingContext === "ask" && !ruleset.ask.allowEmbeddedMedia) {
        effectiveSchema.tagNames = _.filter(
            effectiveSchema.tagNames,
            (tagName) => !["img", "picture", "audio", "video"].includes(tagName)
        );
    }

    return stack
        .use(remarkRehype)
        .use(() => copyImgAltToTitle)
        .use(() => cleanUpFootnotes)
        .use(rehypeSanitize, effectiveSchema)
        .use(() => ruleset.additionalVisitor)
        .use(rehypeExternalLinks, {
            rel: externalRel,
            target: options.externalLinksInNewTab ? "_blank" : "_self",
        });
};

export function renderMarkdownNoHTML(
    src: string,
    publishDate: Date,
    options: RenderingOptions
): string {
    const lineLength = src.split("\n", MAX_GFM_LINES).length;
    return markdownRenderStackNoHTML(publishDate, lineLength, options)
        .use(rehypeStringify)
        .processSync(src)
        .toString();
}

export function renderSummaryNoHTML(
    src: string,
    publishDate: Date,
    options: RenderingOptions
): string {
    const renderedBody = renderMarkdownNoHTML(src, publishDate, options);
    return convert(renderedBody);
}

export function renderMarkdownReactNoHTML(
    src: string,
    publishDate: Date,
    options: RenderingOptions
) {
    const components = {
        Mention,
        CustomEmoji,
    };

    if (options.renderingContext === "artistAlley") {
        // remove headers for artist alley
        Object.assign(components, {
            h1: "strong",
            h2: "strong",
            h3: "strong",
            h4: "strong",
            h5: "strong",
            h6: "strong",
        });
    }

    const lineLength = src.split("\n", MAX_GFM_LINES).length;
    return (
        markdownRenderStackNoHTML(publishDate, lineLength, options)
            .use(() => convertMentions)
            .use(parseEmoji, { cohostPlus: options.hasCohostPlus })
            // @ts-expect-error: Typings don't natively support custom elements
            .use(rehypeReact, {
                createElement,
                Fragment,
                components,
            })
            .processSync(src).result
    );
}
