import sitemap from "@/shared/sitemap";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { ProjectHandle } from "@/shared/types/ids";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { useFlag } from "@unleash/proxy-client-react";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { Trans } from "react-i18next";
import { CohostLogo } from "../icons/cohost-logo";
import { RegisterForm } from "../register-form";

type SignupPageProps = {
    inviteCode?: string;
};

export const Signup: FunctionComponent<SignupPageProps> = ({ inviteCode }) => {
    const registrationDisabled = useFlag(
        FeatureFlag.enum["disable-account-signup"]
    );
    return (
        <>
            <Helmet title="sign up" />
            <CohostLogo className="-ml-6 text-notWhite lg:-ml-12" />
            {registrationDisabled ? (
                <Trans
                    parent="p"
                    className="prose text-notWhite"
                    i18nKey="client:register.disabled"
                >
                    cohost will be entering read-only mode on October 1st and
                    will be shutting down at the end of 2024. we have disabled
                    sign-ups. please check{" "}
                    <a
                        href={sitemap.public.project
                            .mainAppProfile({
                                projectHandle: "staff" as ProjectHandle,
                            })
                            .toString()}
                    >
                        @staff
                    </a>{" "}
                    for more information.
                </Trans>
            ) : (
                <RegisterForm inviteCode={inviteCode} />
            )}
            <a
                href={sitemap.public.welcome().toString()}
                className="flex items-center gap-1 text-mango hover:underline"
            >
                <ChevronDoubleLeftIcon className="h-6 w-6" />
                Back
            </a>
        </>
    );
};

Signup.displayName = "signup";
export default Signup;
