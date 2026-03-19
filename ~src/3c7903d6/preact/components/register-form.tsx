import AuthHelpers from "@/client/lib/auth-helpers";
import type * as LoginV1Types from "@/shared/api-types/login-v1";
import sitemap from "@/shared/sitemap";
import { InviteId, ProjectHandle } from "@/shared/types/ids";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import axios, { AxiosResponse } from "axios";
import Chance from "chance";
import { DateTime } from "luxon";
import generate from "project-name-generator";
import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { SubmitHandler, useForm, useWatch, Validate } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { useSSR } from "../hooks/is-server";
import { AuthnButton } from "./partials/authn-button";
import { AuthnInput } from "./partials/authn-input";
import NoSSR from "@mpth/react-no-ssr";
import { trpc } from "@/client/lib/trpc";
import { useSiteConfig } from "../providers/site-config-provider";
const chance = new Chance();

const SIXTEEN_YEARS_AGO = DateTime.now().minus({ years: 16 });

type Inputs = {
    handle: string;
    password: string;
    passwordConfirm: string;
    email: string;
    birthdate: string;
    hCaptchaToken: string;
    inviteCode: InviteId;
};

type RegisterFormProps = {
    inviteCode?: string;
};

export const RegisterForm: FunctionComponent<RegisterFormProps> = ({
    inviteCode,
}) => {
    const { t } = useTranslation();
    const { isServer } = useSSR();
    const randomHandle = useMemo(() => {
        return isServer
            ? ""
            : generate({
                  alliterative: chance.d10() < 3,
                  words: chance.integer({ min: 2, max: 4 }),
              }).dashed;
    }, [isServer]);

    const [submitting, setSubmitting] = useState(false);
    const [, setValidatingEmail] = useState(false);
    const { HCAPTCHA_SITE_KEY } = useSiteConfig();
    const captchaRef = useRef<HCaptcha>(null);
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        control,
        trigger,
        formState: { errors },
    } = useForm<Inputs>({
        mode: "all",
        defaultValues: {
            inviteCode,
        },
    });
    const checkHandle = trpc.projects.checkHandle.useMutation();
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setSubmitting(true);
        await captchaRef.current?.execute({ async: true });
        const salt = await AuthHelpers.getSalt(data.email);
        const clientHash = await AuthHelpers.hashPasswordInWorker(
            data.email,
            salt,
            data.password
        );

        const params = new URLSearchParams({
            handle: data.handle,
            salt,
            clientHash,
            email: data.email,
            birthdate: data.birthdate,
            "h-captcha-response": data.hCaptchaToken,
        });

        if (inviteCode) params.set("inviteCode", inviteCode);

        const response = await axios.post(
            sitemap.public.apiV1.register().toString(),
            params
        );

        if (response.status === 201) {
            location.replace("/");
        }

        setSubmitting(false);
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

    const validateEmail: Validate<string> = async (email: string) => {
        try {
            setValidatingEmail(true);
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
            setValidatingEmail(false);

            return resp.data.valid === true ? true : resp.data.reason;
        } catch (e) {
            setValidatingEmail(false);
            return t("common:unknown-error").toString();
        }
    };

    useEffect(() => {
        register("hCaptchaToken", {
            required: t(
                "client:register.captcha.required",
                "Please complete the captcha."
            ).toString(),
        });
    });

    const watch = useWatch({
        control,
    });
    const selectedBirthdate = watch.birthdate;
    // this number will always be negative but we don't want that. shout out
    // absolute values for existing as a mathematical concept.
    const selectedBirthdateUnder18 =
        Math.abs(
            DateTime.fromISO(
                watch.birthdate ?? DateTime.now().toISODate()
            ).diffNow("years").years
        ) < 18;

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
                onSubmit={handleSubmit(onSubmit)}
                className="py flex flex-col gap-6"
            >
                <h1 className="font-league text-2xl">Register</h1>
                <div className="flex flex-col gap-2">
                    <label className="text-lg">
                        <p className="my-2 text-lg">
                            {t("client:register.handle.label")}
                        </p>

                        <AuthnInput
                            trigger={trigger}
                            placeholder={randomHandle}
                            type="text"
                            name="handle"
                            control={control}
                            rules={{
                                required: "Handle is required!",
                                validate: validateHandle,
                            }}
                        />

                        <p className="my-2 text-sm">
                            {t(
                                "client:register.handle.description",
                                "Must be at least 3 characters and contain only letters, numbers, or the hyphen (-) character. You can change this later!"
                            )}
                        </p>
                    </label>
                    <p className="text-red" role="alert">
                        {errors.handle ? errors.handle.message : null}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <label>
                        <p className="my-2 text-lg">
                            {t("client:register.email.label")}
                        </p>
                        <AuthnInput
                            trigger={trigger}
                            type="email"
                            placeholder="bradley@example.com"
                            autoComplete="email"
                            name="email"
                            control={control}
                            rules={{
                                required: "E-mail address is required!",
                                validate: validateEmail,
                            }}
                        />
                        <p className="my-2 text-sm">
                            {t(
                                "client:register.email.description",
                                "You'll use this to login! We will never email you without your permission."
                            )}
                        </p>
                    </label>
                    <p className="text-red" role="alert">
                        {errors.email ? errors.email.message : null}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg">
                        {t("client:register.password.label")}
                    </p>

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
                        aria-label="password"
                    />

                    <p className="text-red" role="alert">
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
                        aria-label="confirm password"
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

                    <p className="text-red" role="alert">
                        {errors.passwordConfirm
                            ? errors.passwordConfirm.message
                            : null}
                    </p>
                </div>
                {watch.inviteCode ? (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="inviteCode" className="text-lg">
                            {t(
                                "client:register.invite-code.label",
                                "invite code"
                            )}
                        </label>
                        <AuthnInput
                            trigger={trigger}
                            type="text"
                            name="inviteCode"
                            readOnly
                            control={control}
                        />
                        <Trans i18nKey="client:register.invite-code.description">
                            <p className="text-sm">
                                You're signing up with an invite code! You'll be
                                able to post immediately!
                            </p>
                        </Trans>
                    </div>
                ) : null}
                <label className="flex flex-col gap-2">
                    <p className="text-lg">
                        {t("client:register.birthdate.label", "date of birth")}
                    </p>
                    <AuthnInput
                        trigger={trigger}
                        type="date"
                        autoComplete="bday"
                        max={SIXTEEN_YEARS_AGO.toISODate()}
                        name="birthdate"
                        rules={{
                            required: "Birthdate is required!",
                            max: SIXTEEN_YEARS_AGO.toISODate(),
                        }}
                        control={control}
                    />
                    <p className="text-sm">
                        {t(
                            "client:register.birthdate.description",
                            "You must be 16 or older to use cohost."
                        )}
                    </p>
                    {selectedBirthdate && selectedBirthdateUnder18 ? (
                        <p className="text-sm">
                            {t(
                                "client:register.birthdate.under-18",
                                "If you're under 18, your legal guardian must also agree to the terms of service."
                            )}
                        </p>
                    ) : null}
                    <p className="text-red" role="alert">
                        {errors.birthdate ? errors.birthdate.message : null}
                    </p>
                </label>
                <div className="flex flex-col gap-2">
                    <HCaptcha
                        sitekey={HCAPTCHA_SITE_KEY}
                        onVerify={(token) => {
                            setValue("hCaptchaToken", token);
                            void trigger("hCaptchaToken");
                        }}
                        onExpire={() => {
                            setValue("hCaptchaToken", "");
                            void trigger("hCaptchaToken");
                        }}
                        ref={captchaRef}
                        theme="dark"
                    />
                    <p className="text-red">
                        {errors.hCaptchaToken
                            ? errors.hCaptchaToken.message
                            : null}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm">
                        I accept the{" "}
                        <a
                            href={sitemap.public
                                .staticContent({ slug: "tos" })
                                .toString()}
                            className="font-bold text-mango-500 hover:underline"
                        >
                            Terms of Use
                        </a>{" "}
                        and{" "}
                        <a
                            href={sitemap.public
                                .staticContent({ slug: "privacy" })
                                .toString()}
                            className="font-bold text-mango-500 hover:underline"
                        >
                            Privacy Notice
                        </a>
                        , and agree to abide by the{" "}
                        <a
                            href={sitemap.public
                                .staticContent({ slug: "community-guidelines" })
                                .toString()}
                            className="font-bold text-mango-500 hover:underline"
                        >
                            Community Guidelines
                        </a>
                        .
                    </p>
                    <AuthnButton type="submit" disabled={submitting}>
                        {t("common:sign-up")}
                    </AuthnButton>
                </div>
            </form>
        </NoSSR>
    );
};
