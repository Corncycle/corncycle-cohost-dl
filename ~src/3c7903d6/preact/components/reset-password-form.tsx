import AuthHelpers from "@/client/lib/auth-helpers";
import type * as LoginV1Types from "@/shared/api-types/login-v1";
import sitemap from "@/shared/sitemap";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { AuthnButton } from "./partials/authn-button";
import { AuthnInput } from "./partials/authn-input";

type Inputs = {
    password: string;
    passwordConfirm: string;
    email: string;
    resetNonce: string;
};

type ResetPasswordFormProps = {
    email: string;
    resetNonce: string;
};

export const ResetPasswordForm: FunctionComponent<ResetPasswordFormProps> = ({
    email,
    resetNonce,
}) => {
    const { t } = useTranslation();

    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        getValues,
        control,
        trigger,
        formState: { errors },
    } = useForm<Inputs>({
        mode: "all",
        defaultValues: {
            email,
            resetNonce,
        },
    });
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setSubmitting(true);
        const { email, resetNonce } = data;
        const salt = await AuthHelpers.getSalt(data.email);
        const newClientHash = await AuthHelpers.hashPasswordInWorker(
            data.email,
            salt,
            data.password
        );

        const params: LoginV1Types.ChangePasswordReq = {
            type: "reset",
            newClientHash,
            email,
            resetNonce,
        };

        try {
            const res = await axios.post<
                any,
                AxiosResponse<LoginV1Types.ChangePasswordResp>,
                LoginV1Types.ChangePasswordReq
            >(sitemap.public.apiV1.changePassword().toString(), params);
            setSubmitting(false);
            location.replace(res.data.redirectTo);
        } catch (e) {
            setFormError("Changing password failed.");
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="py flex flex-col gap-6"
        >
            <input type="hidden" {...register("email", { required: true })} />
            <input
                type="hidden"
                {...register("resetNonce", { required: true })}
            />
            <h1 className="font-league text-2xl">Reset password</h1>
            <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-lg">
                    {t("client:register.password.label")}
                </label>
                <AuthnInput
                    trigger={trigger}
                    type="password"
                    autoComplete="new-password"
                    placeholder="hunter2"
                    name="password"
                    control={control}
                    rules={{
                        required: t(
                            "client:register.password.required",
                            "Password is required!"
                        ).toString(),
                        minLength: {
                            value: 8,
                            message: t(
                                "client:register.password.min-length",
                                "Password must be at least 8 characters!"
                            ).toString(),
                        },
                    }}
                />
                <p className="text-red">
                    {errors.password ? errors.password.message : null}
                </p>
                <AuthnInput
                    trigger={trigger}
                    type="password"
                    placeholder="hunter2"
                    autoComplete="new-password"
                    control={control}
                    name="passwordConfirm"
                    rules={{
                        validate: (value) =>
                            value === getValues().password ||
                            t(
                                "client:register.password.confirm-password-mismatch",
                                "Passwords must match!"
                            ).toString(),
                    }}
                />
                <p className="text-sm">
                    {t(
                        "client:register.password.description",
                        "Your password must be at least 8 characters. Other than that, go wild."
                    )}
                </p>
                <p className="text-sm">
                    <Trans i18nKey="client:register.password.password-manager">
                        Please consider{" "}
                        <a
                            rel="noopener noreferrer"
                            target="_blank"
                            className="font-bold text-mango hover:underline"
                            href="https://www.consumerreports.org/digital-security/everything-you-need-to-know-about-password-managers-a5624939418/"
                        >
                            using a password manager
                        </a>{" "}
                        to generate a secure password.
                    </Trans>
                </p>
                <p className="text-red">
                    {errors.passwordConfirm
                        ? errors.passwordConfirm.message
                        : null}
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <AuthnButton type="submit" disabled={submitting}>
                    reset password
                </AuthnButton>
                {formError ? <p className="text-red">{formError}</p> : null}
            </div>
        </form>
    );
};
