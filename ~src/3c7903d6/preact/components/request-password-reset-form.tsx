import type * as LoginV1Types from "@/shared/api-types/login-v1";
import sitemap from "@/shared/sitemap";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AuthnButton } from "./partials/authn-button";
import { AuthnInput } from "./partials/authn-input";

type Inputs = {
    email: string;
};

export const RequestPasswordResetForm: FunctionComponent = () => {
    const { t } = useTranslation();

    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const {
        handleSubmit,
        control,
        trigger,
        formState: { errors },
    } = useForm<Inputs>({
        mode: "all",
    });

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setSubmitting(true);
        const { email } = data;

        const params: LoginV1Types.RequestPasswordResetReq = {
            email,
        };

        try {
            await axios.post<
                any,
                AxiosResponse<any>,
                LoginV1Types.RequestPasswordResetReq
            >(sitemap.public.apiV1.requestPasswordReset().toString(), params);
            setSubmitting(false);
            location.replace(sitemap.public.login());
        } catch (e) {
            setFormError("Request failed.");
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="py flex flex-col gap-6"
        >
            <h1 className="font-league text-2xl">Reset password</h1>
            <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-lg">
                    {t("client:register.email.label")}
                </label>
                <AuthnInput
                    trigger={trigger}
                    type="email"
                    autoComplete="email"
                    placeholder="bradley@example.com"
                    name="email"
                    control={control}
                    rules={{
                        required: "E-mail address is required!",
                    }}
                />
                <p className="text-red">
                    {errors.email ? errors.email.message : null}
                </p>
                <p className="text-sm">
                    If this email exists in our system, we'll send a reset link
                    here. Please check your spam folder if you haven't received
                    it within 5 or so minutes!
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <AuthnButton type="submit" disabled={submitting}>
                    send reset email
                </AuthnButton>
                {formError ? <p className="text-red">{formError}</p> : null}
            </div>
        </form>
    );
};
