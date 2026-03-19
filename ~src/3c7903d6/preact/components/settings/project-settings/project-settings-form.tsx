import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import {
    LoggedOutPostVisibility,
    ProjectPrivacy,
} from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { InfoBox } from "../../elements/info-box";
import { SettingsRow } from "../../elements/settings-row";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";
import { AuthnButton } from "../../partials/authn-button";

type Inputs = {
    private: boolean;
    adultContent: boolean;
    loggedOutPostVisibility: LoggedOutPostVisibility;

    // asks
    asksEnabled: boolean;
    asksAllowAnon: boolean;
    asksRequireLoggedInAnon: boolean;
};

export const ProjectSettingsForm: FunctionComponent = () => {
    const { data } = trpc.projects.projectSettings.useQuery(undefined, {
        suspense: true,
    });
    const mutateProjectSettings =
        trpc.projects.changeProjectSettings.useMutation();
    const { register, handleSubmit, watch } = useForm<Inputs>({
        defaultValues: {
            private: data!.privacy === ProjectPrivacy.Private,
            adultContent: data!.adultContent,
            loggedOutPostVisibility: data!.loggedOutPostVisibility,
            asksEnabled: data!.asks.enabled,
            asksAllowAnon: data!.asks.allowAnon,
            asksRequireLoggedInAnon: data!.asks.requireLoggedInAnon,
        },
    });
    const formPrivateValue = watch("private");

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        return mutateProjectSettings.mutateAsync({
            privacy: values.private
                ? ProjectPrivacy.Private
                : ProjectPrivacy.Public,
            adultContent: values.adultContent,
            loggedOutPostVisibility: values.loggedOutPostVisibility,
            asks: {
                enabled: values.asksEnabled,
                allowAnon: values.asksAllowAnon,
                requireLoggedInAnon: values.asksRequireLoggedInAnon,
            },
        });
    };

    const subsectionTitleClasses = "font-atkinson font-bold text-2xl pt-8";

    const loggedOutPostSelectElement = (
        <select
            disabled={formPrivateValue}
            {...register("loggedOutPostVisibility")}
        >
            <option value="public">all posts</option>
            <option value="none">no posts</option>
        </select>
    );

    return (
        <div className={sectionBoxClasses}>
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h4 className={sectionTitleClasses}>page settings</h4>

                <div className="flex flex-col">
                    <SettingsRow
                        bigLabel="private page?"
                        inputElement={
                            <input
                                type="checkbox"
                                {...register("private")}
                                className="rounded-checkbox"
                            />
                        }
                    />

                    <SettingsRow
                        bigLabel="18+ content?"
                        inputElement={
                            <input
                                type="checkbox"
                                {...register("adultContent")}
                                className="rounded-checkbox"
                            />
                        }
                        infoBoxLevel="info"
                        infoBoxContent={
                            <div className="prose prose-sm">
                                <p>
                                    This controls the default 18+ content state
                                    for any post you make. We recommend that
                                    pages which mostly post adult content enable
                                    this.
                                </p>
                                <p>
                                    Please note: even if your page is marked as
                                    18+ content, profile information (avatar and
                                    header image) must be all-ages appropriate!
                                    You can read more in our{" "}
                                    <a
                                        href={sitemap.public
                                            .staticContent({
                                                slug: "community-guidelines",
                                            })
                                            .toString()}
                                    >
                                        community guidelines
                                    </a>
                                    .
                                </p>
                            </div>
                        }
                    />

                    {formPrivateValue === false ? (
                        <SettingsRow
                            bigLabel="which posts should be visible to users who are logged out?"
                            inputElement={loggedOutPostSelectElement}
                        />
                    ) : (
                        <SettingsRow
                            bigLabel="which posts should be visible to users who are logged out?"
                            inputElement={loggedOutPostSelectElement}
                            infoBoxLevel="info"
                            infoBoxContent={
                                <div className="prose prose-sm">
                                    <p>
                                        Because this page is private, none of
                                        its posts will be visible to users who
                                        are logged out.
                                    </p>
                                </div>
                            }
                        />
                    )}

                    <h5 className={subsectionTitleClasses}>asks</h5>
                    <SettingsRow
                        bigLabel="asks enabled?"
                        inputElement={
                            <input
                                type="checkbox"
                                className="rounded-checkbox"
                                {...register("asksEnabled")}
                            />
                        }
                    />
                    {watch("asksEnabled") ? (
                        <>
                            <SettingsRow
                                bigLabel="anon asks enabled?"
                                inputElement={
                                    <input
                                        type="checkbox"
                                        className="rounded-checkbox"
                                        {...register("asksAllowAnon")}
                                    />
                                }
                            />

                            {watch("asksAllowAnon") ? (
                                <SettingsRow
                                    bigLabel="require anon asks to be logged in?"
                                    inputElement={
                                        <input
                                            type="checkbox"
                                            className="rounded-checkbox"
                                            {...register(
                                                "asksRequireLoggedInAnon"
                                            )}
                                        />
                                    }
                                />
                            ) : null}
                        </>
                    ) : null}
                </div>

                <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                    {mutateProjectSettings.isSuccess ? (
                        <p className="text-green">saved!</p>
                    ) : null}
                    {mutateProjectSettings.isError ? (
                        <p className="text-red">
                            {mutateProjectSettings.error.message}
                        </p>
                    ) : null}

                    <AuthnButton
                        type="submit"
                        disabled={mutateProjectSettings.isLoading}
                        className="font-bold"
                    >
                        save settings
                    </AuthnButton>
                </div>
            </form>
        </div>
    );
};
