import { WirePostViewModel } from "@/shared/types/wire-models";
import React, { FunctionComponent } from "react";
import { PostBody } from "./post-body";
import { PostCollapser } from "./post-collapser";

export type PostContentProps = {
    viewModel: WirePostViewModel;
    highlightedTags: readonly string[];
    skipCollapse?: boolean;
};

export const PostContent: FunctionComponent<PostContentProps> = ({
    viewModel,
    highlightedTags,
    skipCollapse = false,
}) => {
    return (
        <div>
            <PostCollapser
                viewModel={viewModel}
                effectiveTags={viewModel.tags}
                highlightedTags={highlightedTags}
            >
                <PostBody
                    viewModel={viewModel}
                    skipCollapse={skipCollapse}
                    effectiveDate={viewModel.publishedAt}
                />
            </PostCollapser>
        </div>
    );
};
