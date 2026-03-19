import { trpc } from "@/client/lib/trpc";
import { ExclamationTriangleIcon as ExclamationIconOutline } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { FunctionComponent, ReactNode, useState } from "react";
import { InfoBox } from "../../elements/info-box";
import { AuthnButton } from "../../partials/authn-button";
import { TokenInput } from "../../token-input";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";
import { SettingsRow } from "../../elements/settings-row";

const commonCWBoxClasses = "rounded border-cherry border p-2";

export const CWFiltersForm: FunctionComponent = () => {
    const utils = trpc.useContext();
    const { data: initialFilters } = trpc.users.cwFilters.query.useQuery(
        undefined,
        {
            suspense: true,
        }
    );

    const {
        mutate: saveFilters,
        error,
        isError,
        isLoading,
        isSuccess,
    } = trpc.users.cwFilters.mutate.useMutation({
        onSuccess: async () => {
            await utils.users.cwFilters.query.invalidate();
        },
    });

    const [silence, setSilence] = useState(initialFilters?.silence ?? []);
    const [autoexpand, setAutoexpand] = useState(
        initialFilters?.autoexpand ?? []
    );
    const [autoExpandAllCws, setAutoExpandAllCws] = useState(
        initialFilters?.autoExpandAllCws ?? false
    );

    const [visible, setVisible] = useState(false);
    const onShowSilencedCWs = () => setVisible(true);

    return (
        <div
            id="post-visibility"
            // FIXME: theme forced to light here because we haven't rethemed the rest of the site yet
            data-theme="light"
            className={classNames("co-themed-box", sectionBoxClasses)}
        >
            <h4 className={sectionTitleClasses}>filtered content warnings</h4>

            <InfoBox level="info" className="prose max-w-full">
                Content warnings are matched <em>case insensitively</em>; hiding
                or showing "spiders" also applies to "Spiders" and "SPIDERS".
                However, partial matches don't work right now, so posts with a
                content warning for "big spiders" will still show up.
            </InfoBox>

            <p className="prose">
                show me posts with these content warnings{" "}
                <strong className="font-bold text-cherry">
                    without clicking through
                </strong>
                :
            </p>

            <TokenInput
                TokenIcon={ExclamationIconOutline}
                className={commonCWBoxClasses}
                tokens={autoexpand}
                setTokens={setAutoexpand}
            />

            <SettingsRow
                bigLabel={
                    <>
                        show <span className="font-bold text-cherry">ALL</span>{" "}
                        posts with content warnings{" "}
                        <span className="font-bold text-cherry">
                            without clicking through
                        </span>
                    </>
                }
                infoBoxLevel="info"
                infoBoxContent={
                    <div className="prose prose-sm">
                        <p>
                            This will automatically expand ALL posts with
                            content warnings. However, posts which contain
                            content warnings you have asked to{" "}
                            <span className="font-bold text-cherry">
                                silence
                            </span>{" "}
                            will still be fully hidden.
                        </p>
                    </div>
                }
                inputElement={
                    <input
                        type="checkbox"
                        checked={autoExpandAllCws}
                        onChange={() => setAutoExpandAllCws((val) => !val)}
                        className="h-6 w-6 rounded-lg border-2 border-foreground bg-notWhite text-foreground focus:ring-foreground"
                    />
                }
            />

            <p className="prose">
                <strong className="font-bold text-cherry">silence</strong> posts
                with these content warnings, hiding them completely:
            </p>

            {visible ? (
                <div className={commonCWBoxClasses}>
                    <TokenInput
                        TokenIcon={ExclamationIconOutline}
                        tokens={silence}
                        setTokens={setSilence}
                    />
                </div>
            ) : (
                <button
                    className={classNames(
                        commonCWBoxClasses,
                        "cursor-pointer bg-strawberry-100 text-left"
                    )}
                    onClick={onShowSilencedCWs}
                    type="button"
                >
                    click to show list of silenced content warnings
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
                        saveFilters({ silence, autoexpand, autoExpandAllCws })
                    }
                >
                    save settings
                </AuthnButton>
            </div>
        </div>
    );
};
