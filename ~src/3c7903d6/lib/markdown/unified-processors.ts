import type { Element, Root, Text } from "hast";
import _ from "lodash";
import { CompilerFunction, ParserFunction, Plugin } from "unified";
import { is } from "unist-util-is";
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import { EXIT, visitParents } from "unist-util-visit-parents";
import { extractMentions } from "../mention-parsing";

export const processMatches =
    (
        regex: RegExp,
        callback: (
            matches: string[],
            splits: string[],
            node: Text,
            index: number,
            parent: Root | Element
        ) => void
    ) =>
    (hast: Root) => {
        // we only want to check on text nodes for this
        visit(hast, "text", (node, index, parent) => {
            // there is no such thing as a text node without a parent.
            // but if there is we want nothing to do with it.
            if (parent === null || index === null) return;

            const matches = node.value.match(regex);

            // if this text has mentions, process them
            if (matches) {
                const splits = node.value.split(regex);
                if (splits.length - 1 !== matches.length) {
                    // something isn't how it should be. bail.
                    return;
                }

                return callback(matches, splits, node, index, parent);
            }
        });
    };

export const convertMentions = (hast: Root) => {
    // we only want to check on text nodes for this
    visit(hast, "text", (node, index, parent) => {
        // there is no such thing as a text node without a parent.
        // but if there is we want nothing to do with it.
        if (parent === null || index === null) return;

        const text = node.value;
        const names = extractMentions(text);

        // if this text has mentions, consider processing them
        if (names.length) {
            // if we have an `a` in our parent tree, we don't want to process
            // the mention so that links still work.
            let hasAnchorParent = false;
            visitParents(parent, { type: "text" }, (newNode, ancestors) => {
                // since we have to traverse for all text nodes on the parent,
                // we will pretty often get text nodes that _aren't_ the one
                // we're trying to operate on. check to make sure they match.
                if (!_.isEqual(node, newNode)) return CONTINUE;

                // flag if we've got an anchro parent
                hasAnchorParent = !!ancestors.find((el) =>
                    is(el, { type: "element", tagName: "a" })
                );

                // if we do, we don't need to check everything else so bail out.
                if (hasAnchorParent) return EXIT;
            });

            if (hasAnchorParent) return CONTINUE;

            const els: Array<Element | Text> = [];
            let currentStart = 0;

            names.forEach((token, idx, names) => {
                const [startPosition, endPosition] = token.indices;
                els.push({
                    type: "text",
                    value: text.slice(currentStart, startPosition),
                });
                els.push({
                    type: "element",
                    tagName: "Mention",
                    properties: {
                        handle: token.handle,
                    },
                    children: [
                        {
                            type: "text",
                            value: `@${token.handle}`,
                        },
                    ],
                });
                currentStart = endPosition;

                if (idx === names.length - 1) {
                    // if we're last we need to grab the rest of the string
                    els.push({
                        type: "text",
                        value: text.slice(currentStart),
                    });
                }
            });

            parent.children.splice(index, 1, ...els);
            // skip over all the new elements we just created
            return [SKIP, index + els.length];
        }
    });
};

export const cleanUpFootnotes = (hast: Root) => {
    visit(hast, "element", (node, index, parent) => {
        if (parent === null || index === null) return;
        // remove the link from the superscript number
        if (
            node.tagName === "a" &&
            (node.properties?.id as string)?.includes("fnref")
        ) {
            parent.children.splice(index, 1, ...node.children);
            return [SKIP, index];
        }

        // remove the little arrow at the bottom
        if (
            node.tagName === "a" &&
            (node.properties?.href as string)?.includes("fnref")
        ) {
            parent.children.splice(index, 1);
            return [SKIP, index];
        }

        // replace the invisible label with a hr
        if (
            node.tagName === "h2" &&
            (node.properties?.id as string)?.includes("footnote-label")
        ) {
            const hrEl: Element = {
                tagName: "hr",
                type: "element",
                children: [],
                properties: {
                    "aria-label": "Footnotes",
                    style: "margin-bottom: -0.5rem;",
                },
            };
            parent.children.splice(index, 1, hrEl);
        }
    });
};

export const copyImgAltToTitle = (hast: Root) => {
    visit(hast, { type: "element", tagName: "img" }, (node) => {
        if (node.properties?.alt) {
            node.properties.title = node.properties.alt;
        }
    });
};

export const makeIframelyEmbeds = (hast: Root) => {
    visit(hast, { type: "element", tagName: "a" }, (node, index, parent) => {
        if (parent === null || index === null) return;

        // GFM autolink literals have the following two properties:
        // - they have exactly one child, and it's a text child;
        if (node.children.length != 1 || node.children[0].type != "text")
            return;
        // - the starting offset of the text child matches the starting offset
        //   of the node (angle-bracket autolinks and explicit links differ by 1
        //   char)
        if (
            !node.position ||
            !node.children[0].position ||
            node.children[0].position.start.offset != node.position.start.offset
        )
            return;

        // additionally, GFM autolink literals in their own paragraph are the
        // only child of their parent node.
        if (parent.children.length != 1) return;

        // change the type of the parent to a div because you can't nest a div
        // inside a paragraph
        if (parent.type === "element") parent.tagName = "div";

        parent.children.splice(index, 1, {
            type: "element",
            tagName: "IframelyEmbed",
            properties: {
                url: node.properties?.href,
            },
            children: [],
        });

        return true;
    });
};

export const compileHastAST: Plugin = function () {
    const compiler: CompilerFunction<Root, string> = (node: Root) => {
        return JSON.stringify(node);
    };

    Object.assign(this, { Compiler: compiler });
};

export const parseHastAST: Plugin = function () {
    const parser: ParserFunction<Root> = (astString: string) => {
        const ast = JSON.parse(astString) as Root;
        return ast;
    };

    Object.assign(this, { Parser: parser });
};
