import { trpc } from "@/client/lib/trpc";
import { getVanillaClient } from "@/client/lib/trpc-vanilla";
import { sitemap } from "@/shared/sitemap";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import NoSSR from "@mpth/react-no-ssr";
import React, { FunctionComponent, useState } from "react";
import { SubmitHandler, useForm, Validate } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import AuthHelpers from "../../lib/auth-helpers";
import { type LoginFormProps } from "./pages/login";
import { AuthnButton } from "./partials/authn-button";
import { AuthnInput } from "./partials/authn-input";

type Inputs = {
    email: string;
    password: string;
};

export const LoginForm: FunctionComponent<LoginFormProps> = ({
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
    const vanillaClient = getVanillaClient();
    const login = trpc.login.login.useMutation({
        onError: () => {
            setFormError("Couldn't login! Check your e-mail and password.");
            setSubmitting(false);
        },
    });

    const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
        setSubmitting(true);
        setFormError("");

        const saltResult = await vanillaClient.login.getSalt.query({ email });
        const clientHash = await AuthHelpers.hashPasswordInWorker(
            email,
            saltResult.salt,
            password
        );

        const loginResult = await login.mutateAsync({ email, clientHash });

        switch (loginResult.state) {
            case "need-otp":
                location.reload();
                break;
            case "done":
                location.replace(redirectTo);
                break;
        }
    };

    const validateEmail: Validate<string> = (email: string) => {
        return z.string().email().safeParse(email).success;
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
                    <label>
                        <div className="my-2 text-lg">
                            {t("client:register.email.label")}
                        </div>

                        <AuthnInput
                            trigger={trigger}
                            type="email"
                            autoComplete="email"
                            name="email"
                            data-testid="email"
                            rules={{
                                required: t(
                                    "client:register.email.required",
                                    "E-mail can't be empty!"
                                ).toString(),
                                validate: validateEmail,
                            }}
                            control={control}
                        />
                    </label>
                    <p className="text-red" role="alert">
                        {errors.email ? errors.email.message : null}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <label>
                        <div className="my-2 text-lg">
                            {t("common:password")}
                        </div>

                        <AuthnInput
                            trigger={trigger}
                            type="password"
                            autoComplete="current-password"
                            name="password"
                            data-testid="password"
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
                            control={control}
                        />
                    </label>
                    <p className="text-red" role="alert">
                        {errors.password ? errors.password.message : null}
                    </p>
                </div>
                <AuthnButton type="submit" disabled={submitting}>
                    {t("common:login")}
                </AuthnButton>
            </form>
            <a
                href={sitemap.public.resetPassword({}).toString()}
                className="flex items-center gap-1 capitalize text-mango hover:underline"
            >
                <QuestionMarkCircleIcon className="h-6 w-6" />
                forgot your password?
            </a>
        </NoSSR>
    );
};

export default LoginForm;
