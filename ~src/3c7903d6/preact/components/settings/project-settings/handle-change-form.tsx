import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { ProjectHandle } from "@/shared/types/ids";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm, Validate } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCurrentProject } from "../../../hooks/data-loaders";
import { useDisplayPrefs } from "../../../hooks/use-display-prefs";
import { InfoBox } from "../../elements/info-box";
import { SettingsRow } from "../../elements/settings-row";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";
import { UnfriendlyTimestamp } from "../../unfriendly-timestamp";
import { AuthnButton } from "../../partials/authn-button";
import { StyledInput } from "../../elements/styled-input";

type Inputs = {
    handle: string;
};

export const HandleChangeForm: FunctionComponent = () => {
    const { t } = useTranslation();
    const project = useCurrentProject();
    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        control,
    } = useForm<Inputs>({
        defaultValues: {
            handle: project!.handle,
        },
        mode: "onBlur",
    });
    const checkHandle = trpc.projects.checkHandle.useMutation();
    const changeHandleMutation = trpc.projects.changeHandle.useMutation();
    const canChangeHandle = trpc.projects.canChangeHandle.useQuery(undefined, {
        suspense: true,
    });
    const { beatsTimestamps } = useDisplayPrefs();

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        return changeHandleMutation
            .mutateAsync({
                handle: values.handle as ProjectHandle,
            })
            .then(() => location.reload());
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
        <div className={sectionBoxClasses}>
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h4 className={sectionTitleClasses}>change handle</h4>

                <InfoBox level="info">
                    <div className="prose prose-sm">
                        <p>
                            You can change your page handle here. Handles must
                            be at least 3 characters long, only contain letters,
                            numbers, and hyphens ("-"), and not already be in
                            use.
                        </p>
                        <p>
                            You may change your handle up to once every{" "}
                            {beatsTimestamps ? "1000 beats" : "24 hours"}.{" "}
                            {canChangeHandle.data?.canChange === false ? (
                                <>
                                    You've already changed it once today. Wait
                                    until{" "}
                                    <UnfriendlyTimestamp
                                        dateISO={
                                            canChangeHandle.data.nextChangeDate
                                        }
                                        // we have to set this to reset the default classes. we don't need anything special tho.
                                        className=""
                                    />{" "}
                                    to change it again.
                                </>
                            ) : null}
                        </p>
                    </div>
                </InfoBox>

                <div className="flex flex-col">
                    <SettingsRow
                        bigLabel="new handle"
                        inputElement={
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-xl">@</span>
                                <StyledInput
                                    trigger={trigger}
                                    name="handle"
                                    control={control}
                                    type="text"
                                    rules={{
                                        required: "Handle is required!",
                                    }}
                                />
                                {errors.handle ? (
                                    <p className="text-red">
                                        {errors.handle.message}
                                    </p>
                                ) : null}
                            </div>
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
