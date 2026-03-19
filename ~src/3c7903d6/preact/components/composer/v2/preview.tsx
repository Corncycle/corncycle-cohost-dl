import { generatePostAst } from "@/client/lib/markdown/post-rendering";
import { tw } from "@/client/lib/tw-tagged-literal";
import { PostBody } from "@/client/preact/components/posts/post-body";
import { PostId } from "@/shared/types/ids";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAsync } from "react-use";
import { useHasCohostPlus } from "../../../hooks/data-loaders";
import { selectHeadline, selectRenderedPost, selectTags } from "./reducer";
import { useAppSelector } from "./redux-hooks";

export const PostComposerPreview: FunctionComponent = () => {
    const { blocksForPreview } = useAppSelector(selectRenderedPost);
    const headline = useAppSelector(selectHeadline);
    const tags = useAppSelector(selectTags);

    const tagListRef = useRef<HTMLDivElement>(null);

    const [expanded, setExpanded] = useState(false);
    const [hasRunLayout, setHasRunLayout] = useState(false);
    const toggleExpanded = () => setExpanded(!expanded);

    useEffect(() => {
        if (!hasRunLayout && tagListRef.current) {
            setExpanded(
                tagListRef.current.scrollHeight <=
                    tagListRef.current.clientHeight
            );
            setHasRunLayout(true);
        }
    }, [hasRunLayout]);

    const { t } = useTranslation();

    const hasCohostPlus = useHasCohostPlus();
    const postAst = useAsync(
        () =>
            generatePostAst(blocksForPreview, new Date(), {
                hasCohostPlus,
                renderingContext: "post",
            }),
        [blocksForPreview, hasCohostPlus]
    );

    return (
        <div data-post-composer-preview>
            {headline ? (
                <div className="w-full p-3">
                    <h1
                        className={tw`co-prose prose font-atkinson text-xl font-bold`}
                    >
                        {headline}
                    </h1>
                </div>
            ) : null}
            {postAst.loading ? (
                <div className={tw`co-ui-text`}>rendering...</div>
            ) : postAst.error ? (
                <div className={tw`co-ui-text`}>{postAst.error.message}</div>
            ) : (
                <PostBody
                    viewModel={{
                        postId: 0 as PostId,
                        blocks: blocksForPreview,
                        astMap: postAst.value!,
                    }}
                    skipCollapse={true}
                    effectiveDate={undefined}
                />
            )}
            {tags.length ? (
                <div className="w-full max-w-full p-3">
                    <div
                        ref={tagListRef}
                        className={tw`co-tags relative w-full overflow-y-hidden break-words leading-none ${
                            expanded ? "" : "max-h-10"
                        }`}
                    >
                        <div>
                            {tags.map((tag) => (
                                <span
                                    className="mr-2 inline-block text-sm"
                                    key={tag}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        {!expanded ? (
                            <div className="absolute bottom-0 right-2 flex h-5">
                                <span className="co-from-body inline-block h-full bg-gradient-to-l pl-4" />
                                <button
                                    onClick={toggleExpanded}
                                    className={
                                        "co-tags co-opaque inline-block cursor-pointer text-sm font-bold hover:underline"
                                    }
                                >
                                    {t(
                                        "client:post-preview.expand-tags",
                                        "see all"
                                    )}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
