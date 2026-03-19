import { trpc } from "@/client/lib/trpc";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUserInfo } from "../../providers/user-info-provider";
import { Button } from "../elements/button";
import type {
    ModalTagSuggestionDialogRef,
    TaggedPostFeedProps,
} from "../pages/tagged-post-feed";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { useFlag } from "@unleash/proxy-client-react";

type BookmarkTagButtonProps = {
    tagName: string;
    className?: string;
};

export const BookmarkTagButton: FunctionComponent<BookmarkTagButtonProps> = ({
    tagName,
    className,
}) => {
    const { loggedIn } = useUserInfo();
    const utils = trpc.useContext();
    const { data: isBookmarked, isFetched } =
        trpc.bookmarks.tags.isBookmarked.useQuery(
            { tagName },
            { enabled: loggedIn }
        );
    const { t } = useTranslation();
    const buttonText = isBookmarked
        ? t("common:unbookmark-tag", "unbookmark this tag")
        : t("common:bookmark-tag", "bookmark this tag");

    const bookmarkTagMutation = trpc.bookmarks.tags.create.useMutation({
        onSettled: () =>
            Promise.all([
                utils.bookmarks.tags.isBookmarked.invalidate({ tagName }),
                utils.bookmarks.tags.list.invalidate(),
            ]),
    });

    const unbookmarkTagMutation = trpc.bookmarks.tags.delete.useMutation({
        onSettled: () =>
            Promise.all([
                utils.bookmarks.tags.isBookmarked.invalidate({ tagName }),
                utils.bookmarks.tags.list.invalidate(),
            ]),
    });

    const bookmarkTag = useCallback(() => {
        if (isBookmarked) {
            unbookmarkTagMutation.mutate({ tagName });
        } else {
            bookmarkTagMutation.mutate({ tagName });
        }
    }, [isBookmarked, unbookmarkTagMutation, tagName, bookmarkTagMutation]);

    return loggedIn ? (
        isFetched ? (
            <Button
                className={className}
                buttonStyle="roundrect"
                color="secondary"
                onClick={bookmarkTag}
            >
                {buttonText}
            </Button>
        ) : (
            <Button
                className={className}
                buttonStyle="roundrect"
                color="secondary"
                disabled
            >
                {t("common:loading")}
            </Button>
        )
    ) : null;
};

export const TaggedPostFeedHeader: FunctionComponent<
    Pick<TaggedPostFeedProps, "tagName" | "synonymsAndRelatedTags"> & {
        modalSuggestionDialogRef: React.RefObject<ModalTagSuggestionDialogRef>;
    }
> = ({ tagName, synonymsAndRelatedTags, modalSuggestionDialogRef }) => {
    const dynamicTheme = useDynamicTheme();
    const userInfo = useUserInfo();
    const featureFlagEnabled = useFlag(
        FeatureFlag.Enum["tag-relation-request-ui"]
    );
    const synonyms = synonymsAndRelatedTags.filter(
        (synrel) =>
            synrel.relationship === "synonym" &&
            synrel.content.toLowerCase() !== tagName.toLowerCase()
    );

    return (
        <div
            data-theme={dynamicTheme.current}
            className="co-themed-box mb-12 items-center"
        >
            {userInfo.loggedIn ? (
                <BookmarkTagButton tagName={tagName} className="mb-4" />
            ) : null}

            <h4 className="h4 flex-1 text-bgText">#{tagName}</h4>
            <div className="flex flex-row flex-wrap">
                {synonyms.length > 0 ? (
                    <h6 className="h6 pr-3 text-bgText">
                        also:{" "}
                        {synonyms.map((syn) => `#${syn.content}`).join(", ")}
                    </h6>
                ) : null}

                {userInfo.loggedIn && featureFlagEnabled ? (
                    <button
                        className="h6 co-link-button-disabled underline"
                        onClick={() => modalSuggestionDialogRef.current?.open()}
                    >
                        suggest tag synonym
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default TaggedPostFeedHeader;
