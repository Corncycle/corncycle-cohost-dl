import { tw } from "@/client/lib/tw-tagged-literal";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent } from "react";
import { Trans, useTranslation } from "react-i18next";
import { type PotentialCollapseReasons } from "@/client/preact/components/posts/post-collapser";

type InfoBoxProps = {
    reasons: PotentialCollapseReasons;
    cws: string[];
};

export const PostCombinedInfoBox: FunctionComponent<
    React.PropsWithChildren<InfoBoxProps>
> = ({ reasons, cws }) => {
    const { t } = useTranslation();

    // Adult-only doesn't use PostCombinedInfoBox, so the only cases of default
    // text size are when it's CWs-only or muffled tags-only
    const textSize =
        reasons.hasAdultContent ||
        (reasons.hasCws && reasons.muffledTagsPresent)
            ? "text-sm"
            : "";

    return (
        <div
            className={tw`co-info-box co-warning flex flex-grow flex-row items-center gap-3 rounded-lg 
                    border-[2px] p-3 ${textSize}`}
        >
            <ShieldExclamationIcon className="h-6 w-6" />

            <div>
                {reasons.hasAdultContent ? (
                    <>
                        <Trans i18nKey="client:post-preview.adult.combined-content-note">
                            This post contains{" "}
                            <a
                                href="https://help.antisoftware.club/a/solutions/articles/62000225024"
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                            >
                                18+ content
                            </a>
                            .
                        </Trans>
                        <br />
                    </>
                ) : null}
                {reasons.hasCws ? (
                    <>
                        {t(
                            "client:post-preview.cw.expanded-content-note",
                            "CWs: "
                        )}
                        <span className="font-bold">{cws.join(", ")}.</span>
                    </>
                ) : null}
                {reasons.muffledTagsPresent ? (
                    <div>
                        {t(
                            "client:post-preview.muffled.expanded-content-note",
                            "Muffled tags: "
                        )}
                        <span className="font-bold">
                            {reasons.muffledTagsPresent.join(", ")}.
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
