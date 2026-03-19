import { trpc } from "@/client/lib/trpc";
import type * as LoginV1Types from "@/shared/api-types/login-v1";
import sitemap from "@/shared/sitemap";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent, useCallback } from "react";
import { SubmitHandler, useForm, Validate } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUserInfo } from "../../../providers/user-info-provider";
import { AuthnButton } from "../../partials/authn-button";
import { StyledInput } from "../../elements/styled-input";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";

type Inputs = {
    email: string;
};

export const ChangeEmailForm: FunctionComponent = () => {
    const { t } = useTranslation();
    const { email: currentEmail, emailVerified } = useUserInfo();
    const {
        control,
        handleSubmit,
        trigger,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<Inputs>({
        defaultValues: { email: currentEmail ?? undefined },
    });
    const utils = trpc.useContext();
    const changeEmailMutation = trpc.login.changeEmail.useMutation({
        onSuccess: () => utils.login.emailChangeInProgress.invalidate(),
    });

    const resendVerificationMutation =
        trpc.login.resendVerification.useMutation({});

    const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
        await changeEmailMutation.mutateAsync({ newEmail: email });
    };

    const validateEmail: Validate<string> = useCallback(
        async (email: string) => {
            try {
                const resp = await axios.post<
                    LoginV1Types.CheckEmailResp,
                    AxiosResponse<LoginV1Types.CheckEmailResp>,
                    LoginV1Types.CheckEmailReq
                >(
                    sitemap.public.apiV1.checkEmail().toString(),
                    {
                        email,
                    },
                    { responseType: "json" }
                );

                return resp.data.valid === true ? true : resp.data.reason;
            } catch (e) {
                return t("common:unknown-error").toString();
            }
        },
        [t]
    );

    const emailChangeInProgress = trpc.login.emailChangeInProgress.useQuery();

    return (
        <div className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>change email</h4>
            {emailChangeInProgress.data ? (
                <p>
                    You're already changing your e-email address to{" "}
                    {emailChangeInProgress.data}. Click the verify link we sent
                    there to finish it!
                </p>
            ) : null}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col">
                    <label>
                        <p className="font-bold">email</p>
                        <StyledInput
                            trigger={trigger}
                            name="email"
                            control={control}
                            rules={{
                                required: t(
                                    "client:register.email.required"
                                ).toString(),
                                validate: validateEmail,
                            }}
                            type="email"
                            autoComplete="email"
                            placeholder="bradley@example.com"
                        />
                    </label>
                    <p className="text-red">
                        {errors.email ? errors.email.message : null}
                    </p>
                    {!emailVerified ? (
                        <p className="mt-2 flex flex-row gap-2">
                            <button
                                className="font-bold underline"
                                onClick={() =>
                                    resendVerificationMutation.mutate()
                                }
                                disabled={resendVerificationMutation.isLoading}
                            >
                                resend verification
                            </button>
                            {resendVerificationMutation.isLoading ? (
                                <span>sending...</span>
                            ) : resendVerificationMutation.isSuccess ? (
                                <span className="text-green">sent!</span>
                            ) : resendVerificationMutation.isError ? (
                                <span className="text-red">
                                    <>
                                        error:{" "}
                                        {
                                            resendVerificationMutation.failureReason
                                        }
                                    </>
                                </span>
                            ) : null}
                        </p>
                    ) : null}
                </div>
                <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                    {isSubmitSuccessful ? (
                        <p className="text-green">
                            Email changed! Check for a new verification email!
                        </p>
                    ) : null}

                    <AuthnButton
                        type="submit"
                        disabled={isSubmitting}
                        className="font-bold"
                    >
                        change email
                    </AuthnButton>
                </div>
            </form>
        </div>
    );
};
