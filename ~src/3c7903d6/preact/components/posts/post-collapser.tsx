import { tw } from "@/client/lib/tw-tagged-literal";
import { patterns } from "@/shared/sitemap";
import { DisplayPrefs } from "@/shared/types/display-prefs";
import { PostState } from "@/shared/types/posts";
import { WirePostViewModel } from "@/shared/types/wire-models";
import React, {
    FunctionComponent,
    ReactNode,
    useContext,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useHref, useLocation } from "react-router-dom";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { UserInfoType, useUserInfo } from "../../providers/user-info-provider";
import { PostCombinedInfoBox } from "../elements/post-combined-info-box";
import { PostInfoBox, PostInfoBoxType } from "../elements/post-info-box";
import { CollapserButton } from "../partials/collapser-button";
//

import { PostTags } from "../partials/post-tags";

type HeadlineRowProps = {
    viewModel: WirePostViewModel;
};

export const HeadlineRow: FunctionComponent<HeadlineRowProps> = ({
    viewModel,
}) => (
    <div className="flex w-full flex-row p-3">
        <HeadlineElement viewModel={viewModel} />
    </div>
);

type HeadlineElementProps = {
    viewModel: WirePostViewModel;
};

export const HeadlineElement: FunctionComponent<HeadlineElementProps> = ({
    viewModel,
}) => {
    return (
        <a
            key="headline"
            href={viewModel.singlePostPageUrl.toString()}
            className={tw`co-prose prose flex-grow self-center break-words hover:underline`}
        >
            <h3>{viewModel.headline}</h3>
        </a>
    );
};

type PostCollapserProps = React.PropsWithChildren<{
    viewModel: WirePostViewModel;
    effectiveTags: string[];
    highlightedTags: readonly string[];
}>;

// specifies the list of applicable reasons the post might be collapsed
export type PotentialCollapseReasons = {
    hasCws: boolean;
    hasAdultContent: boolean;
    isOtherAccountDraft: boolean;
    isDeleted: boolean;
    muffledTagsPresent: string[] | null;
    loggedOutAndNotVisible: boolean;
};

// specifies reasons the post might be unshowable & how to change that
// and whether there are cases that would skip a collapse
type ClickthroughMode = {
    // true if the user can dismiss this clickthrough at will
    canShow: boolean;
    // true if the user can log in to dismiss this clickthrough
    canLogIn: boolean;
    // true if the user can pass an age gate to dismiss this clickthrough
    canAssertAge: boolean;
    hasAdultContentAndShouldAutoexpand: boolean;
    hasCwsAndAllShouldAutoexpand: boolean;
};

function potentialCollapseReasons(
    props: PostCollapserProps,
    filterableTags: string[],
    userInfo: UserInfoType,
    displayPrefs: DisplayPrefs
): PotentialCollapseReasons {
    const muffledTagsPresent = filterableTags.filter((tag) =>
        displayPrefs.collapsedTags.includes(tag)
    );

    return {
        isDeleted: props.viewModel.limitedVisibilityReason === "deleted",
        isOtherAccountDraft:
            props.viewModel.limitedVisibilityReason === "unpublished",
        hasCws: props.viewModel.cws.length > 0,
        hasAdultContent: props.viewModel.effectiveAdultContent,
        muffledTagsPresent:
            muffledTagsPresent.length > 0 ? muffledTagsPresent : null,
        loggedOutAndNotVisible:
            !userInfo.loggedIn &&
            props.viewModel.postingProject.loggedOutPostVisibility === "none",
    };
}

function clickthroughMode(
    props: PostCollapserProps,
    reasons: PotentialCollapseReasons,
    loggedIn: boolean,
    displayPrefs: DisplayPrefs
): ClickthroughMode {
    const ctMode = {
        canShow: true,
        canLogIn: false,
        canAssertAge: false,
        hasAdultContentAndShouldAutoexpand:
            reasons.hasAdultContent &&
            !displayPrefs.explicitlyCollapseAdultContent,
        hasCwsAndAllShouldAutoexpand:
            reasons.hasCws &&
            // the user wants to auto-expand all CW'd posts no matter what OR
            (displayPrefs.autoExpandAllCws ||
                // all included CWs are set to auto-expand
                props.viewModel.cws
                    .map((cw) => cw.toLowerCase())
                    .every((cw) => displayPrefs.autoexpandCWs.includes(cw))),
    };

    // The conditionals below look for cases where the post shouldn't just collapse
    // but in fact can't be shown at all, set canShow to false in that case, and
    // specify any applicable strategies by which the user can gain access to the post
    if (reasons.hasAdultContent) {
        if (loggedIn) {
            if (!displayPrefs.isAdult && !props.viewModel.isEditor) {
                // logged-in kid; blocking message
                ctMode.canShow = false;
                return ctMode;
            }
        } else {
            // adult content, user is logged out; allow the user to log in, or to
            // assert their age iff the poster's logged-out post visibility is public
            ctMode.canShow = false;
            ctMode.canLogIn = true;
            ctMode.canAssertAge =
                props.viewModel.postingProject.loggedOutPostVisibility ===
                "public";
        }
    }
    if (reasons.loggedOutAndNotVisible) {
        ctMode.canShow = false;
        ctMode.canLogIn = true;
    }
    if (reasons.isDeleted || reasons.isOtherAccountDraft) {
        ctMode.canShow = false;
    }

    return ctMode;
}

const collapserBoxColumnStyle = "flex flex-col items-center m-3 gap-3";

const ExpandedCWAndOrMuffledCollapserBody: FunctionComponent<
    PostCollapserProps & {
        isDraft: boolean;
        clickthroughMode: ClickthroughMode;
        reasons: PotentialCollapseReasons;
        setRelevantClickthroughs: (a: boolean) => void;
    }
> = ({
    isDraft,
    reasons,
    viewModel,
    setRelevantClickthroughs,
    children,
    effectiveTags,
    highlightedTags,
}) => {
    const { t } = useTranslation();

    return (
        <div>
            <div className={collapserBoxColumnStyle}>
                {isDraft ? <PostInfoBox boxType="draft" /> : null}
                <div className="flex flex-row items-center gap-3 self-stretch">
                    <PostCombinedInfoBox
                        reasons={reasons}
                        cws={viewModel.cws}
                    />
                    <CollapserButton
                        onClick={() => setRelevantClickthroughs(false)}
                        collapserButtonStyle="default"
                    >
                        {t("client:post-preview.hide-post", "hide post")}
                    </CollapserButton>
                </div>
            </div>

            {viewModel.headline ? <HeadlineRow viewModel={viewModel} /> : null}
            {children}
            {effectiveTags.length > 0 ? (
                <PostTags
                    tags={effectiveTags}
                    highlightedTags={highlightedTags}
                />
            ) : null}
        </div>
    );
};

const ExpandedAdultCollapserBody: FunctionComponent<
    PostCollapserProps & {
        isDraft: boolean;
        setRelevantClickthroughs: (a: boolean) => void;
    }
> = ({
    isDraft,
    viewModel,
    children,
    effectiveTags,
    highlightedTags,
    setRelevantClickthroughs,
}) => {
    const { t } = useTranslation();
    return (
        <div>
            <div className={collapserBoxColumnStyle}>
                {isDraft ? <PostInfoBox boxType="draft" /> : null}
                <div className="flex flex-row items-start justify-end gap-3 self-stretch p-3">
                    {viewModel.headline ? (
                        <HeadlineElement viewModel={viewModel} />
                    ) : null}
                    <CollapserButton
                        as="a"
                        href="https://help.antisoftware.club/a/solutions/articles/62000225024"
                        target="_blank"
                        rel="noreferrer"
                        collapserButtonStyle="18-badge"
                    >
                        {t(
                            "client:post-preview.adult.expanded-content-note",
                            "18+"
                        )}
                    </CollapserButton>

                    <CollapserButton
                        onClick={() => setRelevantClickthroughs(false)}
                        collapserButtonStyle="default"
                    >
                        {t("client:post-preview.adult.hide-post", "hide post")}
                    </CollapserButton>
                </div>
            </div>

            {children}
            {effectiveTags.length > 0 ? (
                <PostTags
                    tags={effectiveTags}
                    highlightedTags={highlightedTags}
                />
            ) : null}
        </div>
    );
};

const NoReasonToCollapseBody: FunctionComponent<
    PostCollapserProps & {
        isDraft: boolean;
    }
> = ({ isDraft, viewModel, children, effectiveTags, highlightedTags }) => (
    <div>
        {isDraft ? (
            <div className={collapserBoxColumnStyle}>
                <PostInfoBox boxType="draft" />
            </div>
        ) : null}
        {viewModel.headline ? <HeadlineRow viewModel={viewModel} /> : null}
        {children}
        {effectiveTags.length > 0 ? (
            <PostTags tags={effectiveTags} highlightedTags={highlightedTags} />
        ) : null}
    </div>
);

const CollapsedBody: FunctionComponent<
    PostCollapserProps & {
        isDraft: boolean;
        clickthroughMode: ClickthroughMode;
        reasons: PotentialCollapseReasons;
        setRelevantClickthroughs: (a: boolean) => void;
        displayPrefs: DisplayPrefs;
    }
> = ({
    isDraft,
    clickthroughMode,
    reasons,
    viewModel,
    effectiveTags,
    highlightedTags,
    setRelevantClickthroughs,
}) => {
    const { t } = useTranslation();
    const [loggedOutChild, setLoggedOutChild] = useState(false);
    const currentUrl = useHref(useLocation());

    const loginParamStr = new URLSearchParams({
        originalUrl: currentUrl,
    }).toString();
    const loginHref = `${patterns.public.login}?${loginParamStr}`;

    let clickthroughRow = (
        <div className="flex flex-row items-center gap-3">
            {clickthroughMode.canShow ? (
                <CollapserButton
                    onClick={() => setRelevantClickthroughs(true)}
                    collapserButtonStyle="default"
                >
                    {t("client:post-preview.adult.show-post", "show post")}
                </CollapserButton>
            ) : null}

            {clickthroughMode.canLogIn ? (
                <CollapserButton
                    as="a"
                    href={loginHref}
                    collapserButtonStyle="default"
                >
                    {t("client:post-preview.adult.log-in", "log in")}
                </CollapserButton>
            ) : null}

            {clickthroughMode.canAssertAge ? (
                <>
                    <CollapserButton
                        onClick={() => setRelevantClickthroughs(true)}
                        collapserButtonStyle="default"
                    >
                        {t("client:post-preview.adult.i-am-18", "I am 18+")}
                    </CollapserButton>
                    <CollapserButton
                        collapserButtonStyle="default"
                        onClick={() => setLoggedOutChild(true)}
                    >
                        {t(
                            "client:post-preview.adult.i-am-not-18",
                            "I am not 18+"
                        )}
                    </CollapserButton>
                </>
            ) : null}
        </div>
    );

    let mainClickthroughInfoBox: ReactNode = null;

    if (viewModel.limitedVisibilityReason !== "none") {
        let postInfoBoxType: PostInfoBoxType | undefined = undefined;

        switch (viewModel.limitedVisibilityReason) {
            case "log-in-first":
                postInfoBoxType = "log-in-first";
                break;
            case "unpublished":
                postInfoBoxType = "unpublished";
                break;
            case "deleted":
                postInfoBoxType = "deleted";
                break;
            case "blocked":
                // blocked posts should 404, so this case shouldn't be
                // accessible to begin with. we want an exhaustive switch
                // statement here though.
                break;
            // catch the case where the post is invisible due to logged-in minor
            case "adult-content":
                postInfoBoxType = "adult-collapsed";
                break;
        }

        if (postInfoBoxType !== undefined) {
            mainClickthroughInfoBox = <PostInfoBox boxType={postInfoBoxType} />;
        }
    } else if (reasons.hasAdultContent) {
        // catch the case where the post has adult content but can still be
        // expanded
        mainClickthroughInfoBox = <PostInfoBox boxType="adult-collapsed" />;
    }

    if (reasons.hasAdultContent && loggedOutChild) {
        clickthroughRow = (
            <div className="flex flex-row items-center gap-3 text-cherry">
                {t(
                    "client:post-preview.adult.the-wise-child",
                    "Thanks for being honest."
                )}
            </div>
        );
    }

    return (
        <div>
            <div className={collapserBoxColumnStyle}>
                {isDraft ? <PostInfoBox boxType="draft" /> : null}
                {mainClickthroughInfoBox}
                {reasons.hasCws ? (
                    <PostInfoBox boxType="cw-collapsed">
                        <span className="font-bold">
                            {viewModel.cws.join(", ")}.
                        </span>
                    </PostInfoBox>
                ) : null}
                {reasons.muffledTagsPresent ? (
                    <PostInfoBox boxType="muffled-tags-collapsed">
                        <span className="font-bold">
                            {reasons.muffledTagsPresent.join(", ")}.
                        </span>
                    </PostInfoBox>
                ) : null}
                {clickthroughRow}
            </div>

            {effectiveTags.length > 0 ? (
                <PostTags
                    tags={effectiveTags}
                    highlightedTags={highlightedTags}
                />
            ) : null}
        </div>
    );
};

export const PostCollapser: FunctionComponent<PostCollapserProps> = (props) => {
    const userInfo = useUserInfo();
    const { viewModel } = props;
    const displayPrefs = useDisplayPrefs();
    /*
     * we set the tags we filter off of manually since posts up the share tree
     * have an empty array for `effectiveTags` (since we don't display them).
     *
     * we don't just set this to `viewModel.tags` since, if the post we're
     * displaying is a transparent share, we display that share's tags instead
     * of the viewModel's tags. while including both arrays might be redundant,
     * it gives us a complete picture of which tags we actually need to
     * consider.
     */
    const filterableTags = new Set([...props.effectiveTags, ...viewModel.tags]);
    const reasons = potentialCollapseReasons(
        props,
        Array.from(filterableTags),
        userInfo,
        displayPrefs
    );
    const ctMode = clickthroughMode(
        props,
        reasons,
        userInfo.loggedIn,
        displayPrefs
    );

    // To autoexpand, you must be logged in, and for every reason, that reason
    // must either be false or able to autoexpand for this post
    const canAutoexpand =
        userInfo.loggedIn &&
        ctMode.canShow &&
        (!reasons.hasCws || ctMode.hasCwsAndAllShouldAutoexpand) &&
        (!reasons.hasAdultContent ||
            ctMode.hasAdultContentAndShouldAutoexpand) &&
        !reasons.muffledTagsPresent;

    const [cwClickedThrough, setCWClickedThrough] = useState(
        reasons.hasCws && canAutoexpand
    );
    const [adultContentClickedThrough, setAdultContentClickedThrough] =
        useState(reasons.hasAdultContent && canAutoexpand);
    const [muffledTagsClickedThrough, setMuffledTagsClickedThrough] = useState(
        reasons.muffledTagsPresent && canAutoexpand
    );
    const setRelevantClickthroughs = (b: boolean) => {
        if (reasons.hasCws) {
            setCWClickedThrough(b);
        }
        if (reasons.hasAdultContent) {
            setAdultContentClickedThrough(b);
        }
        if (reasons.muffledTagsPresent) {
            setMuffledTagsClickedThrough(b);
        }
    };

    const isDraft = viewModel.state === PostState.Unpublished;

    // NOTE: This conditional is order sensitive, as the logic for combined info
    // boxes is only contained in the top-most relevant condition:
    //
    //      ExpandedCWCollapserBody has CW, CW+18, CW+Muffle, CW+18+Muffle
    //      ExpandedMuffledCollapserBody has Muffle, Muffle+18
    //
    // As such, you must test CW, then Muffle, then 18+

    if (reasons.isDeleted || reasons.isOtherAccountDraft) {
        // this post is Really invisible (deleted or unpublished)
        return (
            <CollapsedBody
                isDraft={false}
                setRelevantClickthroughs={setRelevantClickthroughs}
                clickthroughMode={ctMode}
                reasons={reasons}
                displayPrefs={displayPrefs}
                {...props}
            />
        );
    } else if (reasons.hasCws) {
        // there is a CW
        if (cwClickedThrough) {
            // there is a CW and we already expanded it
            return (
                <ExpandedCWAndOrMuffledCollapserBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    clickthroughMode={ctMode}
                    reasons={reasons}
                    {...props}
                />
            );
        } else {
            // the CW remains collapsed
            return (
                <CollapsedBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    clickthroughMode={ctMode}
                    reasons={reasons}
                    displayPrefs={displayPrefs}
                    {...props}
                />
            );
        }
    } else if (reasons.muffledTagsPresent) {
        // there is a muffled tag that we are collapsing
        if (muffledTagsClickedThrough) {
            // the muffled tag has already been click through
            return (
                <ExpandedCWAndOrMuffledCollapserBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    clickthroughMode={ctMode}
                    reasons={reasons}
                    {...props}
                />
            );
        } else {
            // the muffled content remains hidden
            return (
                <CollapsedBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    clickthroughMode={ctMode}
                    reasons={reasons}
                    displayPrefs={displayPrefs}
                    {...props}
                />
            );
        }
    } else if (reasons.hasAdultContent) {
        // there is adult content that we are collapsing
        if (adultContentClickedThrough) {
            // the adult content has been clicked through
            return (
                <ExpandedAdultCollapserBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    {...props}
                />
            );
        } else {
            // the adult content remains hidden
            return (
                <CollapsedBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    clickthroughMode={ctMode}
                    reasons={reasons}
                    displayPrefs={displayPrefs}
                    {...props}
                />
            );
        }
    } else {
        if (reasons.loggedOutAndNotVisible) {
            // user isn't logged in, and the post shouldn't be visible to them
            return (
                <CollapsedBody
                    isDraft={isDraft}
                    setRelevantClickthroughs={setRelevantClickthroughs}
                    clickthroughMode={ctMode}
                    reasons={reasons}
                    displayPrefs={displayPrefs}
                    {...props}
                />
            );
        } else {
            // no CWs, no adult content, public post, let's go
            return <NoReasonToCollapseBody isDraft={isDraft} {...props} />;
        }
    }
};
