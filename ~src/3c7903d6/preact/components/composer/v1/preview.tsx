import { generatePostAst } from "@/client/lib/markdown/post-rendering";
import {
    selectBlocks,
    selectHeadline,
    selectTags,
} from "./post-editor-machine.helpers";
import { tw } from "@/client/lib/tw-tagged-literal";
import { useSelector } from "@xstate/react";
import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAsync } from "react-use";
import { useHasCohostPlus } from "../../../hooks/data-loaders";
import { PostBody } from "@/client/preact/components/posts/post-body";
import { PreviewsFromAttachments } from "./attachment-preview";
import { PostComposerContext } from "./post-composer-context";
import { PostId } from "@/shared/types/ids";

export const PostComposerPreview: FunctionComponent = () => {
    const postEditorService = useContext(PostComposerContext);
    const blocks = useSelector(postEditorService, selectBlocks);
    const headline = useSelector(postEditorService, selectHeadline);
    const tags = useSelector(postEditorService, selectTags);

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
            generatePostAst(blocks, new Date(), {
                hasCohostPlus,
                renderingContext: "post",
            }),
        [blocks, hasCohostPlus]
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
            <PreviewsFromAttachments canRemove={false} />
            {postAst.loading ? (
                <div className={tw`co-ui-text`}>rendering...</div>
            ) : postAst.error ? (
                <div className={tw`co-ui-text`}>{postAst.error.message}</div>
            ) : (
                <PostBody
                    viewModel={{
                        postId: 0 as PostId,
                        blocks,
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
