import { PostASTMap } from "@/shared/types/wire-models";
import React, { FunctionComponent, useMemo } from "react";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import _ from "lodash";
import { renderReactFromSpans } from "@/client/lib/markdown/post-rendering";

type CohostCornerContentProps = {
    readMoreUrl: string;
    postAst: PostASTMap;
};

export const CohostCornerContent: FunctionComponent<
    CohostCornerContentProps
> = ({ postAst, readMoreUrl }) => {
    const displayPrefs = useDisplayPrefs();
    // render the post above the fold
    // cohost corner is immune to post ages and cohost plus
    const renderedAboveFold = useMemo(() => {
        let spansAboveFold: PostASTMap["spans"];

        if (postAst.readMoreIndex !== null) {
            spansAboveFold = _.filter(
                postAst.spans,
                (span) => span.startIndex < postAst.readMoreIndex!
            );
        } else {
            spansAboveFold = postAst.spans;
        }

        return renderReactFromSpans(spansAboveFold, {
            renderingContext: "post",
            disableEmbeds: true,
            externalLinksInNewTab: displayPrefs.externalLinksInNewTab,
        });
    }, [
        postAst.readMoreIndex,
        postAst.spans,
        displayPrefs.externalLinksInNewTab,
    ]);

    return (
        <div className={`relative w-full overflow-hidden`}>
            <div className="prose prose-sidebar text-sidebarText">
                {renderedAboveFold}
            </div>
            {postAst.readMoreIndex !== null ? (
                <a
                    className="inline-block cursor-pointer text-sm font-bold text-sidebarAccent  hover:underline"
                    href={readMoreUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    read more
                </a>
            ) : null}
        </div>
    );
};
