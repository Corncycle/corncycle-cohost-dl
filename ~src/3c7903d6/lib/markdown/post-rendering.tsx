import { InfoBox } from "@/client/preact/components/elements/info-box";
import { CustomEmoji } from "@/client/preact/components/posts/blocks/custom-emoji";
import {
    isAskViewBlock,
    isMarkdownViewBlock,
    MarkdownViewBlock,
    summaryContent,
    ViewBlock,
} from "@/shared/types/post-blocks";
import { PostASTMap, WirePostViewModel } from "@/shared/types/wire-models";
import { compile } from "html-to-text";
import i18n from "i18next";
import { DateTime } from "luxon";
import React, { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { IframelyEmbed } from "@/client/preact/components/posts/iframely";
import { Mention } from "@/client/preact/components/posts/blocks/mention";
import { parseEmoji } from "../emoji";
import { chooseAgeRuleset } from "./sanitize";
import { MAX_GFM_LINES, RenderingOptions } from "./shared-types";
import {
    cleanUpFootnotes,
    compileHastAST,
    convertMentions,
    copyImgAltToTitle,
    makeIframelyEmbeds,
    parseHastAST,
} from "./unified-processors";
import _ from "lodash";

const convert = compile({
    wordwrap: false,
});

/**
 * Used for posts only, supports arbitrary HTML
 * @returns
 */
const markdownRenderStack = (
    postDate: Date,
    lineLength: number,
    options: Pick<RenderingOptions, "renderingContext">
) => {
    let stack = unified().use(remarkParse);

    const ruleset = chooseAgeRuleset(postDate);

    if (ruleset.singleLineBreaks) {
        stack = stack.use(remarkBreaks);
    }

    if (lineLength < MAX_GFM_LINES) {
        stack = stack.use(remarkGfm, {
            singleTilde: false,
        });
    }

    // make a copy so we don't accidentally modify it in-place
    const effectiveSchema = { ...ruleset.schema };

    if (options.renderingContext === "ask" && !ruleset.ask.allowEmbeddedMedia) {
        effectiveSchema.tagNames = _.filter(
            effectiveSchema.tagNames,
            (tagName) => !["img", "picture", "audio", "video"].includes(tagName)
        );
    }

    return stack
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(() => copyImgAltToTitle)
        .use(() => cleanUpFootnotes)
        .use(rehypeRaw)
        .use(rehypeSanitize, effectiveSchema)
        .use(() => ruleset.additionalVisitor);
};

const ERROR_BOX_NODE = (
    <InfoBox level="post-box-warning" className="not-prose">
        <p>
            There was an issue rendering the HTML for this post! This usually
            means you've messed up syntax on a <code>style</code> attribute.
            Please check your syntax!
        </p>
    </InfoBox>
);
const ERROR_BOX_HTML = renderToStaticMarkup(ERROR_BOX_NODE);

async function renderMarkdownAst(
    blocks: MarkdownViewBlock[],
    publishDate: Date,
    options: Pick<RenderingOptions, "hasCohostPlus" | "renderingContext">
): Promise<string> {
    const src = blocks.map((block) => block.markdown.content).join("\n\n");
    let lineLength = 0;

    // get the max line length among the blocks. while we group all blocks
    // together for rendering, the performance regression associated with GFM
    // tables only occurs with single line breaks, which can only exist within a
    // single block. if the total number of line breaks ACROSS THE ENTIRE POST
    // is >256, this isn't an issue. we're only impacted if it's in a single
    // block.
    for (const block of blocks) {
        if (lineLength >= MAX_GFM_LINES) {
            break;
        }

        lineLength = Math.max(
            lineLength,
            block.markdown.content.split("\n", MAX_GFM_LINES).length
        );
    }

    return markdownRenderStack(publishDate, lineLength, options)
        .use(() => convertMentions)
        .use(parseEmoji, { cohostPlus: options.hasCohostPlus })
        .use(compileHastAST)
        .process(src)
        .then((result) => result.value.toString())
        .catch((e) => {
            // re-run the renderer with our static error box. we only get errors
            // when a user has an invalid style tag that fails parsing. our error
            // box is Known Good so this is not a concern for us.
            return renderMarkdownAst(
                [
                    {
                        type: "markdown",
                        markdown: {
                            content: ERROR_BOX_HTML,
                        },
                    },
                ],
                publishDate,
                options
            );
        });
}

export function renderReactFromAst(
    astString: string,
    options: Omit<RenderingOptions, "hasCohostPlus">
) {
    let stack = unified().use(parseHastAST);

    const externalRel = ["nofollow"];
    if (options.externalLinksInNewTab) {
        externalRel.push("noopener");
    }

    if (!options.disableEmbeds) {
        stack = stack.use(() => makeIframelyEmbeds);
    }

    try {
        return (
            stack
                .use(rehypeExternalLinks, {
                    rel: externalRel,
                    target: options.externalLinksInNewTab ? "_blank" : "_self",
                })
                // @ts-expect-error: Typings don't natively support custom elements
                .use(rehypeReact, {
                    createElement,
                    Fragment,
                    components: {
                        Mention,
                        CustomEmoji,
                        IframelyEmbed,
                    },
                })
                .processSync(astString).result
        );
    } catch (e) {
        return ERROR_BOX_NODE;
    }
}

function renderMarkdown(src: string, publishDate: Date): string {
    const lineLength = src.split("\n", MAX_GFM_LINES).length;
    return markdownRenderStack(publishDate, lineLength, {
        renderingContext: "post",
    })
        .use(rehypeStringify)
        .processSync(src)
        .toString();
}

export function renderPostSummary(
    viewModel: WirePostViewModel,
    options: { myPost: boolean; rss?: boolean; skipHeadline?: boolean }
): string {
    // invocations with either options.rss set true, or options.skipHeadline
    // set true, have a second field they can use to carry the headline of the
    // post and don't need to have it embedded herein.
    const effectiveSkipHeadline = options.skipHeadline || options.rss;

    if (!options.myPost) {
        if (viewModel.effectiveAdultContent && viewModel.cws.length > 0) {
            const cwList = viewModel.cws.join(", ");

            return i18n.t("client:opengraph.cws-and-adult", {
                defaultValue: "18+ content; content warnings: {{cwList}}",
                cwList,
            });
        } else if (viewModel.cws.length > 0) {
            const cwList = viewModel.cws.join(", ");

            return i18n.t("client:opengraph.cws", {
                defaultValue: "(content warning: {{cwList}})",
                cwList,
            });
        } else if (viewModel.effectiveAdultContent) {
            return i18n.t("client:opengraph.adult-content", {
                defaultValue: "this post contains 18+ content",
            });
        }
    }

    if (viewModel.transparentShareOfPostId) {
        // transparent share; find the opaque post above it
        const originalPost = viewModel.shareTree.find(
            (vm) => vm.postId === viewModel.transparentShareOfPostId
        );

        if (options.rss) {
            // RSS: just include a link in the summary
            if (originalPost) {
                return `Share from @${originalPost.postingProject.handle}: ${originalPost.singlePostPageUrl}`;
            }
        } else {
            // on-site: nest opaque parent's preview inside this one
            if (originalPost) {
                return `Share from @${
                    originalPost.postingProject.handle
                }: ${renderPostSummary(originalPost, options)}`;
            }
        }
    }

    let summary: string = "";

    if (viewModel.headline && !effectiveSkipHeadline) {
        summary = viewModel.headline;
    } else {
        const effectiveDate = viewModel.publishedAt
            ? DateTime.fromISO(viewModel.publishedAt).toJSDate()
            : new Date();

        const askBlocks = viewModel.blocks.filter(isAskViewBlock);
        const markdownBlocks = viewModel.blocks.filter(isMarkdownViewBlock);
        const textBlocks = [...askBlocks, ...markdownBlocks];
        const textContent = (
            textBlocks.length > 0 ? textBlocks : viewModel.blocks
        )
            .map((block) => summaryContent(block))
            .join("\n\n");

        const renderedBody = renderMarkdown(textContent, effectiveDate);

        summary = convert(renderedBody);
    }

    if (options.rss && viewModel.shareOfPostId) {
        // contentful share, include the link at the start of the summary
        const originalPost = viewModel.shareTree.find(
            (vm) => vm.postId === viewModel.shareOfPostId
        );
        if (originalPost) {
            summary = `Share from @${originalPost.postingProject.handle}: ${originalPost.singlePostPageUrl}\n\n${summary}`;
        }
    }

    return summary;
}

export async function generatePostAst(
    viewBlocks: ViewBlock[],
    publishDate: Date,
    options: Pick<RenderingOptions, "hasCohostPlus" | "renderingContext">
): Promise<PostASTMap> {
    // identify markdown spans
    const spans: {
        startIndex: number;
        endIndex: number;
    }[] = [];
    let currentSpanStartIndex: number | null = null;
    let readMoreIndex: number | null = null;

    for (let i = 0; i < viewBlocks.length; i++) {
        const block = viewBlocks[i];
        const isMarkdownBlock = isMarkdownViewBlock(block);

        if (isMarkdownBlock) {
            if (
                currentSpanStartIndex !== null &&
                block.markdown.content === "---" &&
                readMoreIndex === null
            ) {
                // inside a span, content is "---", no read-more yet: end the
                //     span, set read-more index, and start a new one
                spans.push({
                    startIndex: currentSpanStartIndex,
                    endIndex: i,
                });
                currentSpanStartIndex = i;
                readMoreIndex = i;
            } else if (currentSpanStartIndex !== null) {
                // inside a span, any other content: keep it going
                continue;
            } else {
                // outside a span: start a new span
                currentSpanStartIndex = i;
            }
        } else {
            if (currentSpanStartIndex !== null) {
                // inside a span: end the span
                spans.push({
                    startIndex: currentSpanStartIndex,
                    endIndex: i,
                });
                currentSpanStartIndex = null;
            } else {
                // outside a span: do nothing
                continue;
            }
        }
    }

    // if we ended the post in a span, finish the one we were in
    if (currentSpanStartIndex !== null) {
        spans.push({
            startIndex: currentSpanStartIndex,
            endIndex: viewBlocks.length,
        });
    }

    // render each span and return AST map
    return {
        spans: await Promise.all(
            spans.map(async (span) => ({
                startIndex: span.startIndex,
                endIndex: span.endIndex,
                ast: await renderMarkdownAst(
                    viewBlocks.slice(
                        span.startIndex,
                        span.endIndex
                    ) as MarkdownViewBlock[],
                    publishDate,
                    options
                ),
            }))
        ),
        readMoreIndex,
    };
}

// interim rendering method for until we get the rest of the inline attachments
// changes done.  render a sequence of markdown spans all joined together.
export function renderReactFromSpans(
    spans: PostASTMap["spans"],
    options: Omit<RenderingOptions, "hasCohostPlus">
) {
    const rendered: JSX.Element[] = [];

    for (let i = 0; i < spans.length; i++) {
        // throw a warning if there are any missing blocks in the middle of the
        // rendered spans.  this should only happen if we're attempting to
        // render the markdown in a post with attachments in the middle, which
        // shouldn't exist yet.
        if (i != 0 && spans[i].startIndex !== spans[i - 1].endIndex) {
            console.error("renderReactFromSpans: span interval is sparse?");
        }

        rendered.push(
            <React.Fragment key={`span-${spans[i].startIndex}`}>
                {renderReactFromAst(spans[i].ast, options)}
            </React.Fragment>
        );
    }

    return <>{rendered}</>;
}
