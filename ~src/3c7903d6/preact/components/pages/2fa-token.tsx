import sitemap from "@/shared/sitemap";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { Helmet } from "react-helmet-async";
import { CohostLogo } from "../icons/cohost-logo";
import NoSSR from "@mpth/react-no-ssr";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AuthnButton } from "../partials/authn-button";
import { AuthnInput } from "../partials/authn-input";
import { trpc } from "@/client/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/src/routes/api/trpc-type";

export type TwoFactorTokenFormProps = {
    redirectTo?: string;
};

type Inputs = {
    token: string;
};

const TwoFactorTokenForm: FunctionComponent<TwoFactorTokenFormProps> = ({
    redirectTo = "/",
}) => {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const {
        handleSubmit,
        control,
        formState: { errors },
        trigger,
    } = useForm<Inputs>({
        mode: "onTouched",
    });
    const [retriesRemaining, setRetriesRemaining] = useState<
        number | undefined
    >(undefined);
    const send2FAToken = trpc.login.send2FAToken.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async ({ token }) => {
        setSubmitting(true);
        setFormError("");

        try {
            await send2FAToken.mutateAsync({ token });
            location.replace(redirectTo);
        } catch (e) {
            if (!(e instanceof TRPCClientError)) setFormError("error");

            const error = e as TRPCClientError<AppRouter>;

            switch (error.data?.errorCode) {
                case "incorrect-totp":
                    if (error.data?.retriesRemaining !== undefined) {
                        setRetriesRemaining(error.data.retriesRemaining);
                        break;
                    } else {
                        // reset the state machine by reloading
                        location.reload();
                        break;
                    }
                default:
                    setFormError(error.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <NoSSR
            fallback={
                <div className="prose prose-invert text-notWhite">
                    <p>Loading...</p>
                    <p>If you keep seeing this, try refreshing!</p>
                </div>
            }
        >
            <form
                className="flex flex-col gap-4"
                id="login-form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h1 className="text-xl capitalize">{t("common:login")}</h1>
                {formError ? (
                    <div className="max-w-prose rounded-lg border-red-500 bg-red-300 p-3 text-notBlack">
                        {formError}
                    </div>
                ) : null}
                <div className="flex flex-col gap-2">
                    <label htmlFor="token" className="text-lg">
                        {t("client:login.2fa-token", {
                            defaultValue: "your 2fa code:",
                        })}
                    </label>
                    <AuthnInput
                        trigger={trigger}
                        type="text"
                        autoComplete="one-time-code"
                        name="token"
                        rules={{
                            required: t(
                                "client:login.token.required",
                                "2FA code can't be empty!"
                            ).toString(),
                            minLength: 6,
                            // no max length (recovery secret is longer than 6
                            // chars)
                        }}
                        control={control}
                    />
                    {retriesRemaining ? (
                        <div className="text-sm text-notWhite" role="alert">
                            incorrect code. retries left: {retriesRemaining}.
                        </div>
                    ) : null}
                </div>
                <AuthnButton type="submit" disabled={submitting}>
                    {t("common:login")}
                </AuthnButton>
            </form>
        </NoSSR>
    );
};

export const TwoFactorTokenPage: FunctionComponent<TwoFactorTokenFormProps> = ({
    redirectTo,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet title="login" />
            <CohostLogo className="-ml-6 text-notWhite lg:-ml-12" />
            <TwoFactorTokenForm redirectTo={redirectTo} />
            <a
                href={sitemap.public.welcome().toString()}
                className="flex items-center gap-1 capitalize text-mango hover:underline"
            >
                <ChevronDoubleLeftIcon className="h-6 w-6" />
                {t("common:back-button")}
            </a>
        </>
    );
};

TwoFactorTokenPage.displayName = "2fa-token";
export default TwoFactorTokenPage;
