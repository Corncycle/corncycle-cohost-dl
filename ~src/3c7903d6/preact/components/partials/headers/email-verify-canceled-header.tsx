import { patterns } from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { Trans } from "react-i18next";
import { useUserInfo } from "../../../providers/user-info-provider";
import { StandardHeader } from "./standard-header";

export const EmailVerifyCanceledHeader: FunctionComponent = () => {
    const { loggedIn, email, emailVerifyCanceled } = useUserInfo();

    return loggedIn && emailVerifyCanceled ? (
        <StandardHeader>
            <Trans
                parent="div"
                className="prose mx-auto"
                i18nKey="client:header-notice.email-verify-canceled"
            >
                <p>
                    <strong>Warning!</strong> The owner of the email address{" "}
                    <em>{{ email }}</em> told us that they didn't sign up for
                    cohost. Please verify that your email is set correctly and{" "}
                    <a href={patterns.public.settingsMain.toString()}>
                        change it
                    </a>{" "}
                    if it's incorrect.
                </p>
            </Trans>
        </StandardHeader>
    ) : null;
};
