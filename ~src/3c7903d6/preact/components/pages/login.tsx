import sitemap from "@/shared/sitemap";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { CohostLogo } from "../icons/cohost-logo";
import LoginForm from "../login-form";

type LoginPageProps = {
    redirectTo?: string;
};

export type LoginFormProps = {
    redirectTo?: string;
};

export const Login: FunctionComponent<LoginPageProps> = ({ redirectTo }) => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet title="login" />
            <CohostLogo className="-ml-6 text-notWhite lg:-ml-12" />
            <LoginForm redirectTo={redirectTo} />
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

Login.displayName = "login";
export default Login;
