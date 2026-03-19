import { trpc } from "@/client/lib/trpc";
import { HashtagIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { FunctionComponent, ReactNode, useState } from "react";
import { InfoBox } from "../../elements/info-box";
import { AuthnButton } from "../../partials/authn-button";
import { TokenInput } from "../../token-input";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";

const commonBoxClasses = "rounded border-cherry border p-2";

export const TagFiltersForm: FunctionComponent = () => {
    const utils = trpc.useContext();
    const { data: initialFilters } = trpc.users.tagFilters.query.useQuery(
        undefined,
        {
            suspense: true,
        }
    );

    const {
        mutate: saveTagFilters,
        error,
        isError,
        isLoading,
        isSuccess,
    } = trpc.users.tagFilters.mutate.useMutation({
        onSuccess: async () => {
            await utils.users.tagFilters.query.invalidate();
        },
    });

    const [collapsedTags, setCollapsedTags] = useState(
        initialFilters?.collapse ?? []
    );

    const [silencedTags, setSilencedTags] = useState(
        initialFilters?.silence ?? []
    );

    const [silencedTagsVisible, setSilencedTagsVisible] = useState(false);
    const onShowSilencedTags = () => setSilencedTagsVisible(true);

    return (
        <div
            id="post-visibility"
            // FIXME: theme forced to light here because we haven't rethemed the rest of the site yet
            data-theme="light"
            className={classNames("co-themed-box", sectionBoxClasses)}
        >
            <h4 className={sectionTitleClasses}>filtered tags</h4>

            <InfoBox level="info" className="prose max-w-full">
                Tags are matched <em>case insensitively</em>—hiding or showing
                "#fandom" also applies to "#Fandom" and "#FANDOM". However,
                partial matches don't work right now, so "#javascript fandom"
                will still show up.
            </InfoBox>

            <p className="prose">
                <strong className="font-bold text-cherry">muffle</strong> posts
                with these tags, requiring me to click through to view them:
            </p>

            <div className={commonBoxClasses}>
                <TokenInput
                    TokenIcon={HashtagIcon}
                    tokens={collapsedTags}
                    setTokens={setCollapsedTags}
                    getSuggestions={true}
                />
            </div>

            <p className="prose">
                <strong className="font-bold text-cherry">silence</strong> posts
                with these tags, hiding them completely:
            </p>

            {silencedTagsVisible ? (
                <div className={commonBoxClasses}>
                    <TokenInput
                        TokenIcon={HashtagIcon}
                        tokens={silencedTags}
                        setTokens={setSilencedTags}
                        getSuggestions={true}
                    />
                </div>
            ) : (
                <button
                    className={classNames(
                        commonBoxClasses,
                        "cursor-pointer bg-strawberry-100 text-left"
                    )}
                    onClick={onShowSilencedTags}
                    type="button"
                >
                    click to show list of silenced tags
                </button>
            )}

            <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                {isSuccess ? (
                    <p className="text-green">Settings saved!</p>
                ) : null}
                {isError ? <p className="text-red">{error.message}</p> : null}

                <AuthnButton
                    type="submit"
                    disabled={isLoading}
                    className="font-bold"
                    onClick={() =>
                        saveTagFilters({
                            collapse: collapsedTags,
                            silence: silencedTags,
                        })
                    }
                >
                    save settings
                </AuthnButton>
            </div>
        </div>
    );
};
