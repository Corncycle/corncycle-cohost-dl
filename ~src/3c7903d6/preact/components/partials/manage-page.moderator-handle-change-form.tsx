import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm, Validate } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InfoBox } from "../elements/info-box";
import { SettingsRow } from "../elements/settings-row";
import { sectionTitleClasses } from "../settings/shared";
import { AuthnButton } from "./authn-button";

type Inputs = {
    handle: string;
};

export const ModeratorHandleChangeForm: FunctionComponent<{
    project: WireProjectModel;
}> = ({ project }) => {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            handle: project.handle,
        },
        mode: "onBlur",
    });
    const checkHandle = trpc.projects.checkHandle.useMutation();
    const changeHandleMutation =
        trpc.moderation.project.changeHandle.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        return changeHandleMutation
            .mutateAsync({
                newHandle: values.handle as ProjectHandle,
                projectId: project.projectId,
            })
            .then(() =>
                location.replace(
                    sitemap.public.moderation.manageProject({
                        projectHandle: values.handle as ProjectHandle,
                    })
                )
            );
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

    return (
        <div className="flex max-h-min w-full max-w-prose flex-col gap-4 rounded-lg border border-mango bg-notWhite px-7 py-8 text-notBlack">
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h4 className={sectionTitleClasses}>change handle</h4>

                <InfoBox level="info">
                    <div className="prose prose-sm">
                        <p>
                            Handles must be at least 3 characters long, only
                            contain letters, numbers, and hyphens ("-"), and not
                            already be in use.
                        </p>
                    </div>
                </InfoBox>

                <div className="flex flex-col">
                    <SettingsRow
                        bigLabel="new handle"
                        inputElement={
                            <>
                                <input
                                    type="text"
                                    {...register("handle", {
                                        required: "Handle is required!",
                                        validate: validateHandle,
                                    })}
                                />
                                {errors.handle ? (
                                    <p className="text-red">
                                        {errors.handle.message}
                                    </p>
                                ) : null}
                            </>
                        }
                    />
                </div>

                <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                    {changeHandleMutation.isSuccess ? (
                        <p className="text-green">saved!</p>
                    ) : null}
                    {changeHandleMutation.isError ? (
                        <p className="text-red">
                            {changeHandleMutation.error.message}
                        </p>
                    ) : null}

                    <AuthnButton
                        type="submit"
                        disabled={changeHandleMutation.isLoading}
                        className="font-bold"
                    >
                        change handle
                    </AuthnButton>
                </div>
            </form>
        </div>
    );
};
