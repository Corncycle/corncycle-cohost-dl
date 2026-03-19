import AuthHelpers from "@/client/lib/auth-helpers";
import type * as LoginV1Types from "@/shared/api-types/login-v1";
import sitemap from "@/shared/sitemap";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUserInfo } from "../../../providers/user-info-provider";
import { AuthnButton } from "../../partials/authn-button";
import { StyledInput } from "../../elements/styled-input";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";

type Inputs = {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
};

export const ChangePasswordForm: FunctionComponent = () => {
    const userInfo = useUserInfo();
    const { t } = useTranslation();
    const [formError, setFormError] = useState("");
    const {
        handleSubmit,
        control,
        getValues,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
        trigger,
    } = useForm<Inputs>({ mode: "onTouched" });

    const onSubmit: SubmitHandler<Inputs> = async ({
        oldPassword,
        newPassword,
    }) => {
        setFormError("");

        if (!userInfo.loggedIn) return;

        const salt = await AuthHelpers.getSalt(userInfo.email);
        const oldClientHash = await AuthHelpers.hashPasswordInWorker(
            userInfo.email,
            salt,
            oldPassword
        );
        const newClientHash = await AuthHelpers.hashPasswordInWorker(
            userInfo.email,
            salt,
            newPassword
        );

        const params: LoginV1Types.ChangePasswordReq = {
            type: "change",
            newClientHash,
            oldClientHash,
        };

        try {
            await axios.post<
                any,
                AxiosResponse<any>,
                LoginV1Types.ChangePasswordReq
            >(sitemap.public.apiV1.changePassword().toString(), params);
            reset({ confirmNewPassword: "", newPassword: "", oldPassword: "" });
        } catch (e) {
            setFormError("Changing password failed.");
        }
    };
    return (
        <div id="password-email" className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>change password</h4>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div>
                    <label className="flex flex-col">
                        <p className="font-bold">old password</p>
                        <StyledInput
                            trigger={trigger}
                            name="oldPassword"
                            control={control}
                            rules={{
                                required: t(
                                    "client:register.password.required"
                                ).toString(),
                                minLength: {
                                    value: 8,
                                    message: t(
                                        "client:register.password.min-length"
                                    ).toString(),
                                },
                            }}
                            type="password"
                            autoComplete="current-password"
                            placeholder="hunter2"
                        />
                    </label>

                    <p className="text-red" role="alert">
                        {errors.oldPassword ? errors.oldPassword.message : null}
                    </p>
                </div>

                <div>
                    <label className="flex flex-col">
                        <p className="font-bold">new password</p>
                        <StyledInput
                            trigger={trigger}
                            name="newPassword"
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
                            type="password"
                            autoComplete="new-password"
                            placeholder="hunter3"
                        />
                    </label>

                    <p className="text-red" role="alert">
                        {errors.newPassword ? errors.newPassword.message : null}
                    </p>
                </div>

                <div>
                    <label className="flex flex-col">
                        <p className="font-bold">confirm new password</p>
                        <StyledInput
                            trigger={trigger}
                            name="confirmNewPassword"
                            control={control}
                            rules={{
                                required: t(
                                    "client:register.password.required",
                                    "Password is required!"
                                ).toString(),
                                validate: (value) =>
                                    value === getValues().newPassword ||
                                    t(
                                        "client:register.password.confirm-password-mismatch",
                                        "Passwords must match!"
                                    ).toString(),
                            }}
                            type="password"
                            autoComplete="new-password"
                            placeholder="hunter3"
                        />
                    </label>

                    <p className="text-red" role="alert">
                        {errors.confirmNewPassword
                            ? errors.confirmNewPassword.message
                            : null}
                    </p>
                </div>

                <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                    {isSubmitSuccessful ? (
                        <p className="text-green">Password changed!</p>
                    ) : null}
                    {formError ? (
                        <p className="text-red" role="alert">
                            {formError}
                        </p>
                    ) : null}

                    <AuthnButton
                        type="submit"
                        disabled={isSubmitting}
                        className="font-bold"
                    >
                        change password
                    </AuthnButton>
                </div>
            </form>
        </div>
    );
};
