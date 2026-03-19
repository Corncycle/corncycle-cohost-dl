import { renderReactFromAst } from "@/client/lib/markdown/post-rendering";
import { chooseAgeRuleset } from "@/client/lib/markdown/sanitize";
import { tw } from "@/client/lib/tw-tagged-literal";
import {
    AttachmentViewBlock,
    ViewBlock,
    isAskViewBlock,
    isAttachmentRowViewBlock,
    isAttachmentViewBlock,
    isMarkdownViewBlock,
} from "@/shared/types/post-blocks";
import { WirePostViewModel } from "@/shared/types/wire-models";
import _ from "lodash";
import {
    FunctionComponent,
    default as React,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import {
    AttachmentLayoutV1,
    AttachmentLayoutV2,
    AttachmentLayoutChildComponent,
} from "../attachment-layout";
import { useLightbox } from "../lightbox";
import Ask from "./blocks/ask";
import { AudioAttachment } from "./blocks/attachments/audio";
import { ImageAttachment } from "./blocks/attachments/image";

// 65ch = 675px
const MAX_ROW_WIDTH = 675;

declare const window: Window &
    typeof globalThis & {
        iframely: {
            load: () => unknown;
            on: (event: string, cb: (...args: unknown[]) => void) => void;
        };
    };

type PostBodyProps = {
    viewModel: Pick<WirePostViewModel, "blocks" | "astMap" | "postId">;
    skipCollapse?: boolean;
    effectiveDate: string | undefined;
};

type PostBodyInnerProps = {
    viewModel: Pick<WirePostViewModel, "blocks" | "astMap" | "postId">;
    renderUntilBlockIndex: number;
    ruleset: ReturnType<typeof chooseAgeRuleset>;
};

const magicContentAttachment: (
    onClickAttachmentFactory: (attachment: AttachmentViewBlock) => () => void
) => AttachmentLayoutChildComponent<AttachmentViewBlock> = (
    onClickAttachmentFactory
) => {
    const component: AttachmentLayoutChildComponent<AttachmentViewBlock> = ({
        attachment,
        index,
        rowLength,
        aspectRatio,
    }) => {
        switch (attachment.attachment.kind) {
            case "image":
                return (
                    <ImageAttachment
                        block={attachment}
                        onClick={onClickAttachmentFactory(attachment)}
                        maxWidth={MAX_ROW_WIDTH / rowLength}
                        key={index}
                        aspectRatio={aspectRatio}
                    />
                );
            case "audio":
                return (
                    <AudioAttachment
                        block={attachment}
                        onClick={onClickAttachmentFactory(attachment)}
                        maxWidth={MAX_ROW_WIDTH / rowLength}
                        key={index}
                        aspectRatio={aspectRatio}
                    />
                );
        }
    };
    component.displayName = "MagicContentAttachment";

    return component;
};

function attachmentKind(attachment: AttachmentViewBlock) {
    return attachment.attachment.kind;
}

function attachmentDimensions(attachment: AttachmentViewBlock) {
    if (attachment.attachment.kind === "image") {
        return {
            width: attachment.attachment.width ?? 0,
            height: attachment.attachment.height ?? 0,
        };
    } else return undefined;
}

const PostBodyInner: FunctionComponent<PostBodyInnerProps> = ({
    viewModel,
    renderUntilBlockIndex,
    ruleset,
}) => {
    const displayPrefs = useDisplayPrefs();

    // flatten attachment blocks out of rows
    const attachmentBlocks = viewModel.blocks.reduce<AttachmentViewBlock[]>(
        (accumulator, block) => {
            if (block.type === "attachment") {
                accumulator.push(block);
            } else if (block.type === "attachment-row") {
                accumulator.push(...block.attachments);
            }
            return accumulator;
        },
        []
    );

    // create a clean copy of attachment blocks that we can pass to the lightbox
    // DO NOT MODIFY THIS ONE!!!
    const passableAttachmentBlocks = [...attachmentBlocks].filter(
        (block) => block.attachment.kind === "image"
    );

    const { openLightbox, setLightboxContentForPost } = useLightbox();

    useEffect(() => {
        setLightboxContentForPost(viewModel.postId, passableAttachmentBlocks);
    });

    const onClickAttachmentFactory =
        (attachment: AttachmentViewBlock) => () => {
            openLightbox(viewModel.postId, attachment.attachment.attachmentId);
        };

    const spansByStartIndex = new Map(
        viewModel.astMap.spans.map((span) => [span.startIndex, span])
    );

    // for pre-sixth age posts, we need to render blocks out of order in case
    // there's an attachment in the middle of the block list that's been
    // rendered at the top all this time.
    let askChild: JSX.Element | null = null;
    let outlineAttachmentChild: JSX.Element | null = null;

    const normalFlowChildren: JSX.Element[] = [];

    let blockIndex = 0;

    while (blockIndex < renderUntilBlockIndex) {
        const block = viewModel.blocks[blockIndex];

        if (isMarkdownViewBlock(block)) {
            // markdown block!  render the matching span.
            const span = spansByStartIndex.get(blockIndex);

            if (!span) {
                console.error(
                    `PostBodyInner: couldn't find markdown span starting at index ${blockIndex}`
                );
                blockIndex++;
            } else {
                normalFlowChildren.push(
                    <div
                        className={`co-prose prose my-4 overflow-hidden break-words px-3`}
                        key={`block-${blockIndex}`}
                    >
                        {renderReactFromAst(span.ast, {
                            renderingContext: "post",
                            disableEmbeds: displayPrefs.disableEmbeds,
                            externalLinksInNewTab:
                                displayPrefs.externalLinksInNewTab,
                        })}
                    </div>
                );
                blockIndex = span.endIndex;
            }
        } else if (isAttachmentViewBlock(block)) {
            // attachment block.  what we do here depends on what age this post
            // was made in.
            if (ruleset.forceAttachmentsToTop && !outlineAttachmentChild) {
                // pre-sixth age post: we gotta outline the attachments, and
                // haven't done that work yet
                if (ruleset.attachmentLayoutBehavior === "v2") {
                    outlineAttachmentChild = (
                        <AttachmentLayoutV2
                            attachments={attachmentBlocks}
                            attachmentKind={attachmentKind}
                            attachmentDimensions={attachmentDimensions}
                            renderOne={magicContentAttachment(
                                onClickAttachmentFactory
                            )}
                            key={`outline-attachments`}
                        />
                    );
                } else {
                    outlineAttachmentChild = (
                        <AttachmentLayoutV1
                            attachments={attachmentBlocks}
                            attachmentKind={attachmentKind}
                            attachmentDimensions={attachmentDimensions}
                            renderOne={magicContentAttachment(
                                onClickAttachmentFactory
                            )}
                            key={`outline-attachments`}
                        />
                    );
                }

                blockIndex++;
            } else if (ruleset.forceAttachmentsToTop) {
                // we gotta outline the attachments, but already did it.  just
                // ignore this block since it's already rendered somewhere else.
                blockIndex++;
            } else {
                // post-sixth age post: spin forward until we run out of attachments,
                // then lay them out.
                let nextNonAttachmentIndex = blockIndex;

                while (nextNonAttachmentIndex < viewModel.blocks.length) {
                    if (
                        !isAttachmentViewBlock(
                            viewModel.blocks[nextNonAttachmentIndex]
                        )
                    )
                        break;
                    nextNonAttachmentIndex++;
                }

                if (ruleset.attachmentLayoutBehavior === "v2") {
                    normalFlowChildren.push(
                        <AttachmentLayoutV2
                            attachments={
                                viewModel.blocks.slice(
                                    blockIndex,
                                    nextNonAttachmentIndex
                                ) as AttachmentViewBlock[]
                            }
                            attachmentKind={attachmentKind}
                            attachmentDimensions={attachmentDimensions}
                            renderOne={magicContentAttachment(
                                onClickAttachmentFactory
                            )}
                            key={`block-${blockIndex}`}
                        />
                    );
                } else {
                    normalFlowChildren.push(
                        <AttachmentLayoutV1
                            attachments={
                                viewModel.blocks.slice(
                                    blockIndex,
                                    nextNonAttachmentIndex
                                ) as AttachmentViewBlock[]
                            }
                            attachmentKind={attachmentKind}
                            attachmentDimensions={attachmentDimensions}
                            renderOne={magicContentAttachment(
                                onClickAttachmentFactory
                            )}
                            key={`block-${blockIndex}`}
                        />
                    );
                }

                blockIndex = nextNonAttachmentIndex;
            }
        } else if (isAttachmentRowViewBlock(block)) {
            // we have an explicit attachment row! these are always rendered in place with the v2 layout regardless of post age, so let's do it.
            normalFlowChildren.push(
                <AttachmentLayoutV2
                    attachments={block.attachments}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={magicContentAttachment(onClickAttachmentFactory)}
                    key={`block-${blockIndex}`}
                />
            );
            blockIndex++;
        } else if (isAskViewBlock(block)) {
            // ask block.
            askChild = <Ask askBlock={block} key={`block-${blockIndex}`} />;
            blockIndex++;
        } else {
            throw new Error("PostBodyInner: unexpected block type?");
        }
    }

    return (
        <>
            {askChild}
            {outlineAttachmentChild}
            {normalFlowChildren}
        </>
    );
};

type PostCollapseState = "default" | "forced-open" | "forced-closed";

export const PostBody: FunctionComponent<PostBodyProps> = React.memo(
    ({ viewModel, skipCollapse = false, effectiveDate }) => {
        const ruleset = useMemo(() => {
            const postDate = effectiveDate
                ? new Date(effectiveDate)
                : new Date();
            return chooseAgeRuleset(postDate);
        }, [effectiveDate]);
        const bodyRef = useRef<HTMLDivElement>(null);
        const readMoreRef = useRef<HTMLButtonElement>(null);
        const readLessRef = useRef<HTMLButtonElement>(null);
        const [postCollapseState, setPostCollapseState] =
            useState<PostCollapseState>(
                skipCollapse ? "forced-open" : "default"
            );
        const [eligibleForAutocollapse, setEligibleForAutocollapse] = useState<
            boolean | null
        >(null);
        const manualReadMorePresent = viewModel.astMap.readMoreIndex !== null;
        const collapsePossible =
            eligibleForAutocollapse || manualReadMorePresent;
        const collapsed =
            postCollapseState === "forced-open" ? false : collapsePossible;

        // cut the inner renderer off early iff the post is collapsed and it
        // has an explicit read more
        const renderUntilBlockIndex =
            collapsed && viewModel.astMap.readMoreIndex !== null
                ? viewModel.astMap.readMoreIndex
                : viewModel.blocks.length;

        const lastPostHeight = useRef(0);
        const hasRun = useRef(false);

        const resize = useCallback(
            (force: boolean) => {
                // we don't want to run immediately after we just did to prevent a loop
                if (hasRun.current === true && !force) {
                    return;
                }
                if (bodyRef.current && !collapsed) {
                    const postHeight = bodyRef.current.scrollHeight;
                    if (postHeight === lastPostHeight.current) {
                        return;
                    }
                    lastPostHeight.current = postHeight;

                    const pageHeight = Math.max(
                        document.documentElement.clientHeight,
                        window.innerHeight || 0
                    );
                    const shouldCollapse = postHeight / pageHeight > 2.0;
                    setEligibleForAutocollapse(shouldCollapse);

                    hasRun.current = true;
                }
            },
            [bodyRef, collapsed]
        );

        const readMore = useCallback(() => {
            setPostCollapseState("forced-open");
        }, []);

        const readLess = useCallback(() => {
            let scrollOffset = 0;
            if (readLessRef?.current) {
                scrollOffset = readLessRef.current.getBoundingClientRect().top;
            }
            setPostCollapseState("forced-closed");

            requestAnimationFrame(() => {
                // scroll so that the relative position of "read more" is
                // identical to the relative position of "read less"
                // (effectively no scroll)
                if (readMoreRef?.current) {
                    const readMoreOffset =
                        readMoreRef.current.getBoundingClientRect().top;
                    const scrollTo =
                        window.scrollY + readMoreOffset - scrollOffset;
                    // don't smooth scroll, it breaks the effect
                    window.scroll({ top: scrollTo });
                }
            });
        }, []);

        /**
         * this can only run in browser so we don't need to check for if document exists
         */
        useEffect(() => {
            resize(false);
        }, [resize]);

        useEffect(() => {
            window.iframely &&
                // iframe just resized, check to see if it's in this post. force
                // a resize check if it is
                window.iframely.on("heightChanged", (...args) => {
                    const iframe = args[0] as HTMLIFrameElement;
                    const parentPostBody = iframe.closest("[data-post-body]");
                    if (parentPostBody === bodyRef.current) {
                        resize(true);
                    }
                });
            // empty array so this only runs once On Purpose
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        /**
         * mask the tab order of elements which are collapsed offscreen by a
         * read more.
         */
        useEffect(() => {
            if (!bodyRef.current) return;

            // gather descendants of the body from the DOM which participate in
            // tab order
            function tabOrderedDescendants(element: Element): Element[] {
                if (!(element instanceof HTMLElement)) return [];

                const tabOrdered = _.reduce(
                    element.children,
                    (accum, child) => [
                        ...accum,
                        ...tabOrderedDescendants(child),
                    ],
                    [] as Element[]
                );

                // > 0 is explicit tab indexing, == 0 is "default, in page order"
                if (element.tabIndex >= 0) {
                    tabOrdered.push(element);
                }

                return tabOrdered;
            }

            const tabOrderedElements = tabOrderedDescendants(bodyRef.current);

            // give each of them an IntersectionObserver; when an element goes
            // offscreen (hidden behind a read more), suppress its tab index,
            // and when it comes back restore it
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const targetHtml = entry.target as HTMLElement;

                        // note: we're flattening positive tabIndexes to zero here,
                        // instead of taking pains to restore its original value;
                        // we've never allowed tabIndex attributes in posts, and
                        // I can't think of a good reason why we'd ever use them so
                        // just live with this
                        if (entry.isIntersecting) {
                            targetHtml.tabIndex = 0;
                        } else {
                            targetHtml.tabIndex = -1;
                        }
                    });
                },
                {
                    root: bodyRef.current,
                    threshold: 0.0,
                }
            );

            tabOrderedElements.forEach((element) => observer.observe(element));

            // empty array so this only runs once On Purpose
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // to preserve proper layout, posts without _any_ markdown spans should
        // have postbody render as null
        return viewModel.blocks.length > 0 ? (
            /*
                the two layers of overflows here attempt to prevent a combination
                of post box breakout (discovered by @bark) and bad default tab
                navigation behavior.  the inner overflow-hidden crops the post
                content to fit inside the post box, and the outer overflow-clip
                (where supported) prevents the post content from scrolling around
                inside the post box when tab focus goes below the "read more"
                link in situations where we can't prevent that.
                
                if you make changes to this, check:
            
                https://cohost.org/blep/post/3924485-is-it-just-me-or-ism
                https://cohost.org/bark-test/post/3891805-my-totally-normal-po

                to ensure proper rendering
            */
            <div
                className={`${
                    // the disparity between `max-h-screen` and a 2x check
                    // threshold is deliberate
                    collapsed && !manualReadMorePresent ? "max-h-screen" : ""
                } relative overflow-hidden supports-[overflow:clip]:overflow-clip ${
                    ruleset.className
                }`}
                data-post-body
                data-testid="post-body"
                ref={bodyRef}
            >
                <PostBodyInner
                    viewModel={viewModel}
                    renderUntilBlockIndex={renderUntilBlockIndex}
                    ruleset={ruleset}
                />
                {collapsed && !manualReadMorePresent ? (
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col px-3">
                        <span className="co-from-body inline-block h-8 w-full bg-gradient-to-t pl-4" />
                        <button
                            className={tw`co-link-button co-opaque inline-block pb-3 text-left 
                                text-sm font-bold hover:underline`}
                            onClick={readMore}
                            ref={readMoreRef}
                        >
                            read more
                        </button>
                    </div>
                ) : collapsed ? (
                    <button
                        className={tw`co-link-button co-opaque inline-block pb-3 pl-3 text-left text-sm font-bold hover:underline`}
                        onClick={readMore}
                        ref={readMoreRef}
                    >
                        read more
                    </button>
                ) : collapsePossible ? (
                    <button
                        className={tw`co-link-button co-opaque inline-block pb-3 pl-3 text-left text-sm font-bold hover:underline`}
                        onClick={readLess}
                        ref={readLessRef}
                    >
                        read less
                    </button>
                ) : null}
            </div>
        ) : null;
    }
);

PostBody.displayName = "PostBodyV2";
