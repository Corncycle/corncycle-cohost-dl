import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import { ProjectPrivacy } from "@/shared/types/projects";
import axios from "axios";
import React, { FunctionComponent, useState } from "react";
import { Helmet } from "react-helmet-async";
import { SubmitHandler, useForm, Validate } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InfoBox } from "../elements/info-box";
import { SettingsRow } from "../elements/settings-row";
import { AuthnButton } from "../partials/authn-button";
import { sectionTitleClasses } from "../settings/shared";

type Inputs = {
    handle: string;
    adultContent: string;
    privateProject: string;
};

type CreateProjectComponentProps = {
    canCreate: boolean;
    isAdult: boolean;
};

export const CreateProjectComponent: FunctionComponent<
    CreateProjectComponentProps
> = ({ canCreate, isAdult }) => {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [, setFormError] = useState("");
    const checkHandle = trpc.projects.checkHandle.useMutation();
    const { register, handleSubmit, control, trigger } = useForm<Inputs>({
        mode: "onTouched",
    });

    const onSubmit: SubmitHandler<Inputs> = async ({
        handle,
        adultContent,
        privateProject,
    }) => {
        setSubmitting(true);
        setFormError("");

        const params = new URLSearchParams({
            handle: handle,
            adultContent: adultContent ? adultContent.toString() : "false",
            privacy: privateProject
                ? ProjectPrivacy.Private
                : ProjectPrivacy.Public,
        });

        try {
            await axios.post(
                sitemap.public.apiV1.createProject().toString(),
                params
            );
            location.replace(sitemap.public.project.profileEdit());
        } catch (e) {
            setFormError("Creating a project failed.");
            setSubmitting(false);
        }
    };

    const validateHandle: Validate<string> = async (handle: string) => {
        try {
            const resp = await checkHandle.mutateAsync({
                handle: handle as ProjectHandle,
            });

            return resp.valid === true ? true : resp.reason;
        } catch (e) {
            return t("common:unknown-error").toString();
        }
    };

    let adultForm: React.ReactNode;

    if (isAdult) {
        adultForm = (
            <SettingsRow
                bigLabel="18+ content?"
                inputElement={
                    <input
                        type="checkbox"
                        className="rounded-checkbox"
                        {...register("adultContent")}
                    />
                }
                customDescription={
                    <div className="prose prose-sm">
                        <p>
                            This controls the default 18+ content state for any
                            post you make. We recommend that pages which mostly
                            post 18+ content enable this.
                        </p>
                        <p>
                            Please note: even if your page is marked as 18+
                            content, profile information (avatar and header
                            image) must be all-ages appropriate! You can read
                            more in our{" "}
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
        );
    } else {
        adultForm = (
            <InfoBox level="warning" className="prose">
                you're under 18, so you can't create an 18+ page, but you can
                flag individual posts on your pages as 18+ content.
            </InfoBox>
        );
    }

    return (
        <>
            <Helmet title="create a page" />
            <div className="container mx-auto mt-16 flex flex-col items-center">
                <div className="cohost-shadow-light dark:cohost-shadow-dark flex w-full max-w-prose flex-col gap-4 rounded-lg bg-notWhite p-3 text-notBlack">
                    <h4 className={sectionTitleClasses}>create a new page</h4>

                    {canCreate ? (
                        <>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="flex flex-col gap-4"
                            >
                                <SettingsRow
                                    bigLabel="page handle"
                                    inputElement={
                                        <>
                                            <input
                                                type="text"
                                                {...register("handle", {
                                                    required:
                                                        "Handle is required!",
                                                    validate: validateHandle,
                                                })}
                                            />
                                        </>
                                    }
                                    customDescription={
                                        <div className="prose prose-sm">
                                            <p>
                                                Handles must be at least 3
                                                characters long, only contain
                                                letters, numbers, and hyphens
                                                ("-"), and not already be in
                                                use.
                                            </p>
                                        </div>
                                    }
                                />

                                {adultForm}

                                <SettingsRow
                                    bigLabel="private page?"
                                    inputElement={
                                        <input
                                            type="checkbox"
                                            className="rounded-checkbox"
                                            {...register("privateProject")}
                                        />
                                    }
                                />

                                <InfoBox
                                    level="info"
                                    className="prose prose-sm"
                                >
                                    Pages can have multiple editors, but we
                                    haven't built a UI for you to manage the
                                    editorship of a page yet. If you want to
                                    co-edit this page with collaborators, please
                                    e-mail us at support@cohost.org with the
                                    name of the new page and the name of one of
                                    your collaborators' pages, and we'll get
                                    everything sorted out for you.
                                </InfoBox>

                                <div className="flex w-full flex-col font-bold text-notWhite">
                                    <AuthnButton
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        create a new page
                                    </AuthnButton>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div>
                            sorry, but you can't create new pages until your
                            account is activated.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

CreateProjectComponent.displayName = "create-project";
export default CreateProjectComponent;
