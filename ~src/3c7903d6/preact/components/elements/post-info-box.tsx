import { tw } from "@/client/lib/tw-tagged-literal";
import {
    ExclamationCircleIcon,
    InformationCircleIcon,
    ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import React, { FunctionComponent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { useUserInfo } from "../../providers/user-info-provider";

export const PostInfoBoxType = z.enum([
    "draft",
    "log-in-first",
    "adult-collapsed",
    "cw-collapsed",
    "muffled-tags-collapsed",
    "unpublished",
    "deleted",
]);
export type PostInfoBoxType = z.infer<typeof PostInfoBoxType>;

type InfoBoxProps = {
    boxType: PostInfoBoxType;
};

export const PostInfoBox: FunctionComponent<
    React.PropsWithChildren<InfoBoxProps>
> = ({ boxType, children }) => {
    const { t } = useTranslation();
    const userInfo = useUserInfo();
    const displayPrefs = useDisplayPrefs();

    // boxSharedStyle excludes border, background, and text color, which are handled case-by-case
    const boxSharedStyle = tw`box-border border-[1px] flex flex-row items-center gap-3 self-stretch rounded-lg p-3`;
    const iconSharedStyle = tw`h-6 w-6 flex-none`;

    switch (boxType) {
        case "draft":
            return (
                <div className={tw`co-info-box co-info ${boxSharedStyle}`}>
                    <InformationCircleIcon className={iconSharedStyle} />
                    <div>
                        <p>
                            {t("client:post-preview.draft.content-note", {
                                defaultValue:
                                    "This post is a draft. It's not publicly visible, but you can send people links to it.",
                            })}
                        </p>
                    </div>
                </div>
            );
        case "log-in-first":
            return (
                <div className={tw`co-info-box co-info ${boxSharedStyle}`}>
                    <InformationCircleIcon className={iconSharedStyle} />
                    {t(
                        "client:post-preview.post-visible-if-logged-in",
                        "This page's posts are visible only to users who are logged in."
                    )}
                </div>
            );
        case "adult-collapsed":
            return (
                <div className={tw`co-info-box co-18-plus ${boxSharedStyle}`}>
                    <InformationCircleIcon className={iconSharedStyle} />
                    {!userInfo.loggedIn
                        ? t(
                              "client:post-preview.adult.hidden-content-logged-out",
                              "This post contains 18+ content. You can view it if you're over 18."
                          )
                        : displayPrefs.isAdult
                        ? displayPrefs.explicitlyCollapseAdultContent
                            ? t(
                                  "client:post-preview.adult.collapsed-content-note",
                                  "This post contains 18+ content. We're hiding it according to your content preferences."
                              )
                            : t(
                                  "client:post-preview.adult.18-not-collapsed-note",
                                  "This post contains 18+ content."
                              )
                        : t(
                              "client:post-preview.adult.grow-up",
                              "This post contains 18+ content. You can view it when you're older."
                          )}
                </div>
            );
        case "cw-collapsed":
            return (
                <div className={tw`co-info-box co-warning ${boxSharedStyle}`}>
                    <ShieldExclamationIcon className="h-6 w-6" />
                    <div>
                        {t(
                            "client:post-preview.cw.collapsed-content-note",
                            "This post has content warnings for: "
                        )}
                        {children}
                    </div>
                </div>
            );
        case "muffled-tags-collapsed":
            return (
                <div className={tw`co-info-box co-warning ${boxSharedStyle}`}>
                    <ShieldExclamationIcon className="h-6 w-6" />
                    <div>
                        {t(
                            "client:post-preview.cw.muffled-content-note",
                            "This post has tags you muffled: "
                        )}
                        {children}
                    </div>
                </div>
            );
        case "unpublished":
            return (
                <div className={tw`co-info-box co-tombstone ${boxSharedStyle}`}>
                    <ExclamationCircleIcon className="h-6 w-6" />
                    <div>
                        {t(
                            "client:post-preview.unpublished",
                            "Sorry!  This post has been unpublished by its original author."
                        )}
                    </div>
                </div>
            );
        case "deleted":
            return (
                <div className={tw`co-info-box co-tombstone ${boxSharedStyle}`}>
                    <ExclamationCircleIcon className="h-6 w-6" />
                    <div>
                        {t(
                            "client:post-preview.deleted",
                            "Sorry!  This post has been deleted by its original author."
                        )}
                    </div>
                </div>
            );
        default:
            return null;
    }
};
