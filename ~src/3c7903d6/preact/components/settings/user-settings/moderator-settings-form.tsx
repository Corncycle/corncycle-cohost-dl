import * as ModerationV1Types from "@/shared/api-types/moderation-v1";
import sitemap from "@/shared/sitemap";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AuthnButton } from "../../partials/authn-button";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";

type ModeratorSettingsFormProps = {
    modMode: boolean;
};

type Inputs = {
    modMode: boolean;
};

export const ModeratorSettingsForm: FunctionComponent<
    ModeratorSettingsFormProps
> = ({ modMode }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const { handleSubmit, register } = useForm<Inputs>({
        mode: "onTouched",
        defaultValues: { modMode },
    });

    const onSubmit: SubmitHandler<Inputs> = async ({ modMode }) => {
        setSubmitting(true);
        setFormError("");
        setFormSuccess("");

        try {
            await axios.post<
                any,
                AxiosResponse<any>,
                ModerationV1Types.ChangeSettingsReq
            >(sitemap.public.apiV1.moderation.changeSettings().toString(), {
                modMode,
            });
            setFormSuccess("Settings changed!");
            setSubmitting(false);
        } catch (e) {
            setFormError("Changing settings failed.");
            setSubmitting(false);
        }
    };

    return (
        <div id="staff-only" className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>moderator settings</h4>

            <a
                href={sitemap.public.moderation.home().toString()}
                className="underline"
            >
                Moderation directory
            </a>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-2">
                        <label htmlFor="modMode" className="font-bold">
                            enable moderator mode (ignore visibility checks)?
                        </label>
                        <input type="checkbox" {...register("modMode")} />
                    </div>
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
