import { tw } from "@/client/lib/tw-tagged-literal";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { WirePostViewModel } from "@/shared/types/wire-models";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { Numbers } from "../partials/numbers";
import PostControls from "../partials/post-controls";

export const PostFooter: FunctionComponent<{
    singlePostPageUrl: string;
    post: WirePostViewModel;
}> = ({ singlePostPageUrl, post }) => {
    const { t } = useTranslation();
    const numbersFlag = useFlag(FeatureFlag.Values["chaos-day-2023"]);
    const { chaosDay2023_showNumbers } = useDisplayPrefs();
    const singlePostPageUrlWithComments = useMemo(() => {
        const url = new URL(singlePostPageUrl);
        url.hash = "#comments";
        return url.toString();
    }, [singlePostPageUrl]);

    return (
        <>
            <hr className="co-hairline" />
            <footer
                className={tw`co-thread-footer w-full max-w-full rounded-b-lg p-3`}
            >
                <div className="flex justify-between align-middle">
                    <div className="w-max flex-none">
                        <a
                            href={singlePostPageUrlWithComments}
                            className="text-sm hover:underline"
                        >
                            {t("client:post-preview.num-comments", {
                                count: post.numComments,
                                defaultValue: "{{numComments}} comment",
                                numComments: post.numComments,
                            })}
                            {post.numSharedComments
                                ? t("client:post-preview.num-shared-comments", {
                                      defaultValue:
                                          " + {{numSharedComments}} on shared posts",
                                      numSharedComments: post.numSharedComments,
                                  })
                                : null}
                        </a>
                        {numbersFlag && chaosDay2023_showNumbers ? (
                            /*
                                i know it's a meme number but in testing 420px
                                was actually the first safe option with the
                                longest possible post controls to prevent
                                overlap.
                            */
                            <span className="text-sm">
                                <br className="[@media(min-width:420px)]:hidden" />
                                <span className="[@media(max-width:419px)]:hidden">
                                    &nbsp;&bull;&nbsp;
                                </span>
                                <Numbers post={post} />
                            </span>
                        ) : null}
                    </div>
                    <PostControls viewModel={post} />
                </div>
            </footer>
        </>
    );
};
