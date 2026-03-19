import { trpc } from "@/client/lib/trpc";
import { useHasCohostPlus } from "@/client/preact/hooks/data-loaders";
import { useDisplayPrefs } from "@/client/preact/hooks/use-display-prefs";
import { env } from "@/shared/env";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { WireUserModel } from "@/shared/types/wire-models";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { InfoBox } from "../../elements/info-box";
import { SettingsRow } from "../../elements/settings-row";
import { AuthnButton } from "../../partials/authn-button";
import { sectionTitleClasses, subsectionTitleClasses } from "../shared";
import { HomeView, PostBoxThemeSetting } from "@/shared/types/display-prefs";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

type DisplaySettingsFormProps = {
    user: WireUserModel;
};

type Inputs = {
    collapseAdultContent: boolean;
    collapseLongThreads: boolean;
    gifsStartPaused: boolean;
    pauseProfileGifs: boolean;
    enableEmbeds: boolean;
    externalLinksInNewTab: boolean;
    enableNotificationCount: boolean;
    suggestedFollowsDismissed: boolean;
    enableMobileQuickShare: boolean;
    beatsTimestamps: boolean;
    disableModalPostComposer: boolean;
    homeView: HomeView;
    defaultShow18PlusPostsInSearches: boolean;
    defaultPostBoxTheme: PostBoxThemeSetting;
    previewFeatures_lexicalPostEditor: boolean;
    chaosDay2023_showNumbers: boolean;
};

export const DisplaySettingsForm: FunctionComponent<
    DisplaySettingsFormProps
> = ({ user }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const displayPrefs = useDisplayPrefs();
    const hasCohostPlus = useHasCohostPlus();
    const showNumbersField = useFlag(FeatureFlag.Enum["chaos-day-2023"]);
    const showPostComposerV2Field = useFlag(
        FeatureFlag.Enum["attachment-composer-v2"]
    );
    const {
        handleSubmit,
        formState: { errors },
        register,
    } = useForm<Inputs>({
        mode: "onTouched",
        defaultValues: {
            collapseAdultContent: user.collapseAdultContent,
            collapseLongThreads: displayPrefs.collapseLongThreads,
            gifsStartPaused: displayPrefs.gifsStartPaused,
            pauseProfileGifs: displayPrefs.pauseProfileGifs,
            enableEmbeds: !displayPrefs.disableEmbeds,
            externalLinksInNewTab: displayPrefs.externalLinksInNewTab,
            enableNotificationCount: displayPrefs.enableNotificationCount,
            suggestedFollowsDismissed: displayPrefs.suggestedFollowsDismissed,
            enableMobileQuickShare: displayPrefs.enableMobileQuickShare,
            beatsTimestamps: hasCohostPlus
                ? displayPrefs.beatsTimestamps
                : false,
            disableModalPostComposer: displayPrefs.disableModalPostComposer,
            homeView: displayPrefs.homeView,
            defaultShow18PlusPostsInSearches:
                displayPrefs.defaultShow18PlusPostsInSearches,
            defaultPostBoxTheme: displayPrefs.defaultPostBoxTheme,
            previewFeatures_lexicalPostEditor:
                displayPrefs.previewFeatures_lexicalPostEditor,
            chaosDay2023_showNumbers: displayPrefs.chaosDay2023_showNumbers,
        },
    });

    const userSettingsMutation = trpc.login.userSettings.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async ({
        collapseAdultContent,
        collapseLongThreads,
        gifsStartPaused,
        pauseProfileGifs,
        enableEmbeds,
        externalLinksInNewTab,
        enableNotificationCount,
        suggestedFollowsDismissed,
        enableMobileQuickShare,
        beatsTimestamps,
        disableModalPostComposer,
        homeView,
        defaultShow18PlusPostsInSearches,
        defaultPostBoxTheme,
        previewFeatures_lexicalPostEditor,
        chaosDay2023_showNumbers,
    }) => {
        setSubmitting(true);
        setFormError("");
        setFormSuccess("");

        try {
            await userSettingsMutation.mutateAsync({
                explicitlyCollapseAdultContent: collapseAdultContent,
                collapseLongThreads,
                gifsStartPaused,
                pauseProfileGifs,
                disableEmbeds: !enableEmbeds,
                externalLinksInNewTab,
                enableNotificationCount,
                suggestedFollowsDismissed,
                enableMobileQuickShare,
                beatsTimestamps,
                disableModalPostComposer,
                homeView,
                defaultShow18PlusPostsInSearches,
                defaultPostBoxTheme,
                previewFeatures_lexicalPostEditor,
                // we don't modify this here but still need to include it so
                // that the server doesn't get mad at us
                autoExpandAllCws: displayPrefs.autoExpandAllCws,

                // time-limited settings
                chaosDay2023_showNumbers: chaosDay2023_showNumbers,
            });
        } catch (e) {
            setFormError("Changing settings failed.");
            setSubmitting(false);
        }
        setFormSuccess("Settings changed!");
        setSubmitting(false);
    };

    const showPreviewFeatures = showPostComposerV2Field;

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark relative mx-auto flex max-h-min w-full flex-col gap-4 rounded-lg bg-notWhite px-7 py-8 text-notBlack">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <h4 className={sectionTitleClasses}>display settings</h4>

                <div className="flex flex-col">
                    <h5 className={subsectionTitleClasses}>
                        what posts you see
                    </h5>

                    <SettingsRow
                        bigLabel='hide 18+ posts until you click "show post"?'
                        inputElement={
                            <input
                                id="collapseAdultContent"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("collapseAdultContent")}
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="include 18+ posts in tag searches and bookmarked tag feed by default?"
                        inputElement={
                            <input
                                id="defaultShow18PlusPostsInSearches"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register(
                                    "defaultShow18PlusPostsInSearches"
                                )}
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="hide middle of long threads by default?"
                        inputElement={
                            <input
                                id="collapseLongThreads"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("collapseLongThreads")}
                            />
                        }
                    />
                    <p className="text-red">
                        {errors.collapseAdultContent
                            ? errors.collapseAdultContent.message
                            : null}
                    </p>

                    <div
                        id="post-display"
                        className="invisible relative top-0 h-0 w-0"
                    />

                    <h5 className={subsectionTitleClasses}>
                        how content inside posts looks
                    </h5>

                    <SettingsRow
                        bigLabel="pause animated GIFs until you click them?"
                        inputElement={
                            <input
                                id="gifsStartPaused"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("gifsStartPaused")}
                            />
                        }
                        infoBoxLevel="warning"
                        infoBoxContent={
                            <>
                                This feature still has some limitations that
                                we're working on fixing. It currently only works
                                on images attached at the top of a post, and
                                only on GIFs; other animated image types can't
                                be paused yet.
                            </>
                        }
                    />

                    <SettingsRow
                        bigLabel="open external links in a new tab?"
                        inputElement={
                            <input
                                id="externalLinksInNewTab"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("externalLinksInNewTab")}
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="display previews of links?"
                        inputElement={
                            <input
                                id="enableEmbeds"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("enableEmbeds")}
                            />
                        }
                        infoBoxLevel="info"
                        infoBoxContent={
                            <>
                                We use a service provider, iframely (
                                <a
                                    href="https://iframely.com/privacy"
                                    className="underline"
                                >
                                    privacy policy
                                </a>
                                ), to generate these. If you don't want to load
                                content from iframely, uncheck this box. Some
                                previews require you to load content from other
                                sites in addition to iframely; we'll prompt you
                                before new sites do this, and you can turn them
                                off later through{" "}
                                <a
                                    href={`https://iframely.com/consents?site=${encodeURIComponent(
                                        new URL(env.HOME_URL).hostname
                                    )}`}
                                    className="underline"
                                >
                                    iframely's site
                                </a>
                                .
                            </>
                        }
                    />

                    <SettingsRow
                        bigLabel="default theme of posts and notifications:"
                        inputElement={
                            <select {...register("defaultPostBoxTheme")}>
                                <option value="light">always light</option>
                                <option value="dark">always dark</option>
                                <option value="prefers-color-scheme">
                                    follows device theme
                                </option>
                            </select>
                        }
                        infoBoxLevel="info"
                        infoBoxContent={
                            <>
                                Other parts of the site follow your device's
                                default color scheme. If a post doesn't look
                                right in your default theme, you can switch to
                                the other one from the "meatball" (
                                <EllipsisHorizontalIcon className="inline-block h-4 w-4" />
                                ) menu.
                            </>
                        }
                    />

                    <div
                        id="ui-display"
                        className="invisible relative top-0 h-0 w-0"
                    />

                    <h6 className={subsectionTitleClasses}>
                        how other parts of the site look
                    </h6>

                    <SettingsRow
                        bigLabel="pause animated GIFs in avatars and header images?"
                        inputElement={
                            <input
                                id="pauseProfileGifs"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("pauseProfileGifs")}
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="show new notification count in the sidebar?"
                        inputElement={
                            <input
                                id="enableNotificationCount"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("enableNotificationCount")}
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="go to a new page when sharing or writing a post?"
                        inputElement={
                            <input
                                id="disableModalPostComposer"
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("disableModalPostComposer")}
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="which view do you want to be your home page?"
                        inputElement={
                            <select {...register("homeView")}>
                                <option value="dashboard">
                                    dashboard view
                                </option>
                                <option value="following">
                                    following view
                                </option>
                            </select>
                        }
                    />

                    {showNumbersField ? (
                        <SettingsRow
                            bigLabel="display Numbers™️ on posts?"
                            inputElement={
                                <input
                                    type="checkbox"
                                    className="rounded-checkbox"
                                    {...register("chaosDay2023_showNumbers")}
                                />
                            }
                        />
                    ) : null}

                    {showPreviewFeatures ? (
                        <>
                            <h5 className={subsectionTitleClasses}>
                                preview features
                            </h5>

                            <InfoBox level="info">
                                <div className="prose prose-sm">
                                    <p>
                                        These settings control features that are
                                        new to the site and which we intend to
                                        permanently enable soon, but that we
                                        want to give you the ability to disable
                                        in the event you run into problems. If
                                        you do run into problems, please e-mail
                                        us at{" "}
                                        <a href="mailto:support@cohost.org">
                                            support@cohost.org
                                        </a>{" "}
                                        so we can fix them permanently for
                                        everyone.
                                    </p>
                                </div>
                            </InfoBox>

                            {showPostComposerV2Field ? (
                                <SettingsRow
                                    bigLabel="enable new post editor?"
                                    inputElement={
                                        <input
                                            type="checkbox"
                                            className="rounded-checkbox"
                                            {...register(
                                                "previewFeatures_lexicalPostEditor"
                                            )}
                                        />
                                    }
                                    infoBoxLevel="info"
                                    infoBoxContent={
                                        <div className="prose prose-sm">
                                            <p>
                                                This new editor allows you to
                                                place images and audio in the
                                                middle of a post without having
                                                to set up your own hosting.
                                            </p>
                                        </div>
                                    }
                                />
                            ) : null}
                        </>
                    ) : null}

                    <h5 className={subsectionTitleClasses}>
                        cohost plus settings
                    </h5>

                    <InfoBox level="info">
                        <div className="prose prose-sm">
                            <p>
                                These settings enable features that are only
                                available for cohost <i>Plus!</i> subscribers.
                            </p>
                            {!hasCohostPlus ? (
                                <p>
                                    You can sign up for cohost <i>Plus!</i> by
                                    scrolling down slightly.
                                </p>
                            ) : null}
                        </div>
                    </InfoBox>

                    <SettingsRow
                        bigLabel="enable .beat internet timestamps?"
                        inputElement={
                            <input
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("beatsTimestamps", {
                                    disabled: !hasCohostPlus,
                                })}
                            />
                        }
                        infoBoxLevel="info"
                        infoBoxContent={
                            <div className="prose prose-sm">
                                <p>
                                    changes all timestamps on cohost to use{" "}
                                    <a href="https://en.wikipedia.org/wiki/Swatch_Internet_Time">
                                        .beat internet time
                                    </a>
                                    .
                                </p>
                            </div>
                        }
                    />
                </div>

                <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                    {formSuccess ? (
                        <p className="text-green">{formSuccess}</p>
                    ) : null}
                    {formError ? <p className="text-red">{formError}</p> : null}

                    <AuthnButton
                        type="submit"
                        disabled={submitting}
                        className="font-bold"
                    >
                        save settings
                    </AuthnButton>
                </div>
            </form>
        </div>
    );
};
