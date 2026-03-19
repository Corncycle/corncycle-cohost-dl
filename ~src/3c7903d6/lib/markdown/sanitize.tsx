// this file is a .tsx so that tailwind will pick up on it

import deepmerge from "deepmerge";
// eslint-import-plugin has trouble resolving this one automatically
// eslint-disable-next-line import/no-unresolved
import { Root } from "hast";
import { Schema } from "hast-util-sanitize";
import { noop } from "lodash";
import { defaultSchema } from "rehype-sanitize";
import parseStyle from "style-to-object";
import { visit } from "unist-util-visit";

type AgeRuleset = {
    schema: Schema;
    cutoffDate: Date | null;
    className: string;
    additionalVisitor: (hast: Root) => void;
    singleLineBreaks: boolean;
    forceAttachmentsToTop: boolean;
    attachmentLayoutBehavior: "v1" | "v2";
    ask: {
        allowEmbeddedMedia: boolean;
    };
};

const FIRST_AGE: AgeRuleset = {
    schema: deepmerge(defaultSchema, {
        attributes: {
            "*": ["style"],
        },
        tagNames: ["video", "audio", "aside"], // consistency with current rules,
    }),
    // Wednesday, June 29, 2022 6:00:00 PM GMT
    cutoffDate: new Date(1656525600000),
    className: "",
    additionalVisitor: noop,
    singleLineBreaks: false,
    forceAttachmentsToTop: true,
    attachmentLayoutBehavior: "v1",
    ask: {
        allowEmbeddedMedia: true,
    },
};

const SECOND_AGE: AgeRuleset = {
    schema: deepmerge(defaultSchema, {
        attributes: {
            "*": ["style"],
        },
        tagNames: ["video", "audio", "aside"], // consistency with current rules,
    }),
    // Monday, November 14, 2022 6:00:00 AM GMT
    cutoffDate: new Date(1668405600000),
    className: "isolate",
    additionalVisitor(hast) {
        visit(hast, "element", (node, index, parent) => {
            if (parent === null || index === null) return;

            if (
                node.properties?.style &&
                typeof node.properties.style === "string"
            ) {
                try {
                    let changed = false;
                    const parsed = parseStyle(node.properties.style);
                    if (
                        parsed &&
                        parsed["position"] &&
                        [
                            // every valid value of `position` _except_ `fixed`
                            // (https://developer.mozilla.org/en-US/docs/Web/CSS/position),
                            // which we disallow
                            "static",
                            "relative",
                            "absolute",
                            "sticky",
                            "inherit",
                            "initial",
                            "revert",
                            "revert-layer",
                            "unset",
                        ].indexOf(parsed["position"].toLowerCase()) === -1
                    ) {
                        parsed.position = "static";
                        changed = true;
                    }

                    if (parsed && changed) {
                        node.properties.style = Object.entries(parsed)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(";");
                    }
                } catch (e) {
                    // couldn't parse, don't worry about it
                    return;
                }
            }
        });
    },
    singleLineBreaks: false,
    forceAttachmentsToTop: true,
    attachmentLayoutBehavior: "v1",
    ask: {
        allowEmbeddedMedia: true,
    },
};

const THIRD_AGE: AgeRuleset = {
    schema: deepmerge(defaultSchema, {
        attributes: {
            "*": ["style"],
        },
        tagNames: ["video", "audio", "aside"], // consistency with current rules,
    }),
    // may 10 2023, 3pm EDT
    cutoffDate: new Date("2023-05-10T15:00:00-04:00"),
    className: "isolate co-contain-paint",
    additionalVisitor(hast) {
        // run the previous age's visitor first
        SECOND_AGE.additionalVisitor(hast);

        visit(hast, "element", (node, index, parent) => {
            if (parent === null || index === null) return;

            if (
                node.properties?.style &&
                typeof node.properties.style === "string"
            ) {
                try {
                    let changed = false;
                    const parsed = parseStyle(node.properties.style);

                    if (parsed) {
                        for (const key in parsed) {
                            // drop all CSS variables
                            if (key.startsWith("--")) {
                                delete parsed[key];
                                changed = true;
                            }
                        }
                    }

                    if (parsed && changed) {
                        node.properties.style = Object.entries(parsed)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(";");
                    }
                } catch (e) {
                    // couldn't parse, don't worry about it
                    return;
                }
            }
        });
    },
    singleLineBreaks: false,
    forceAttachmentsToTop: true,
    attachmentLayoutBehavior: "v1",
    ask: {
        allowEmbeddedMedia: true,
    },
};

const FOURTH_AGE: AgeRuleset = {
    // no schema changes from third age
    schema: THIRD_AGE.schema,
    // july 17 2023, noon EDT
    cutoffDate: new Date("2023-07-17T12:00:00-04:00"),
    className: THIRD_AGE.className,
    additionalVisitor: THIRD_AGE.additionalVisitor,
    singleLineBreaks: true,
    forceAttachmentsToTop: true,
    attachmentLayoutBehavior: "v1",
    ask: {
        allowEmbeddedMedia: true,
    },
};

// list pulled from dompurify
const MATH_ML_SCHEMA: Schema = {
    // allow mathml
    tagNames: [
        "math",
        "menclose",
        "merror",
        "mfenced",
        "mfrac",
        "mglyph",
        "mi",
        "mlabeledtr",
        "mmultiscripts",
        "mn",
        "mo",
        "mover",
        "mpadded",
        "mphantom",
        "mroot",
        "mrow",
        "ms",
        "mspace",
        "msqrt",
        "mstyle",
        "msub",
        "msup",
        "msubsup",
        "mtable",
        "mtd",
        "mtext",
        "mtr",
        "munder",
        "munderover",
        "mprescripts",
    ],
    attributes: {
        "*": [
            "accent",
            "accentunder",
            "align",
            "bevelled",
            "close",
            "columnsalign",
            "columnlines",
            "columnspan",
            "denomalign",
            "depth",
            "dir",
            "display",
            "displaystyle",
            "encoding",
            "fence",
            "frame",
            "height",
            "href",
            "id",
            "largeop",
            "length",
            "linethickness",
            "lspace",
            "lquote",
            "mathbackground",
            "mathcolor",
            "mathsize",
            "mathvariant",
            "maxsize",
            "minsize",
            "movablelimits",
            "notation",
            "numalign",
            "open",
            "rowalign",
            "rowlines",
            "rowspacing",
            "rowspan",
            "rspace",
            "rquote",
            "scriptlevel",
            "scriptminsize",
            "scriptsizemultiplier",
            "selection",
            "separator",
            "separators",
            "stretchy",
            "subscriptshift",
            "supscriptshift",
            "symmetric",
            "voffset",
            "width",
            "xmlns",
        ],
        span: [["className", "math-inline"]],
        div: [["className", "math-display"]],
    },
};

const FIFTH_AGE: AgeRuleset = {
    // we allow mathml now
    schema: deepmerge(FOURTH_AGE.schema, MATH_ML_SCHEMA),
    cutoffDate: new Date("2024-02-12T12:00:00-08:00"), // 2024/02/12 12:00 PST
    className: FOURTH_AGE.className,
    additionalVisitor: FOURTH_AGE.additionalVisitor,
    singleLineBreaks: true,
    forceAttachmentsToTop: true,
    attachmentLayoutBehavior: "v1",
    ask: {
        allowEmbeddedMedia: true,
    },
};

const SIXTH_AGE: AgeRuleset = {
    schema: FIFTH_AGE.schema,
    cutoffDate: new Date("2024-03-27T12:00:00-08:00"), // 2024/03/27 12:00 PDT
    className: FIFTH_AGE.className,
    additionalVisitor: FIFTH_AGE.additionalVisitor,
    singleLineBreaks: true,
    // attachments now render in post order instead of being pushed to the
    // top of the post
    forceAttachmentsToTop: false,
    attachmentLayoutBehavior: "v1",
    ask: {
        allowEmbeddedMedia: true,
    },
};

const SEVENTH_AGE: AgeRuleset = {
    schema: SIXTH_AGE.schema,
    cutoffDate: new Date("2024-03-29T12:00:00-08:00"), // 2024/03/29 12:00 PDT
    className: SIXTH_AGE.className,
    additionalVisitor: SIXTH_AGE.additionalVisitor,
    singleLineBreaks: true,
    forceAttachmentsToTop: false,
    attachmentLayoutBehavior: "v2",
    ask: {
        allowEmbeddedMedia: true,
    },
};

const EIGHTH_AGE: AgeRuleset = {
    schema: SEVENTH_AGE.schema,
    cutoffDate: null, // current age
    className: SEVENTH_AGE.className,
    additionalVisitor: SEVENTH_AGE.additionalVisitor,
    singleLineBreaks: true,
    forceAttachmentsToTop: false,
    attachmentLayoutBehavior: "v2",
    // asks no longer allow images, video, or audio to be embedded.
    ask: {
        allowEmbeddedMedia: false,
    },
};

export const AGE_LIST = [
    FIRST_AGE,
    SECOND_AGE,
    THIRD_AGE,
    FOURTH_AGE,
    FIFTH_AGE,
    SIXTH_AGE,
    SEVENTH_AGE,
    EIGHTH_AGE,
] as const;

export const chooseAgeRuleset = (postDate: Date) =>
    AGE_LIST.find((ruleset) => {
        if (ruleset.cutoffDate) {
            return postDate < ruleset.cutoffDate;
        }

        return true;
    }) ?? AGE_LIST[AGE_LIST.length - 1];
