import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { CohostLogo } from "../icons/cohost-logo";
import { RequestPasswordResetForm } from "../request-password-reset-form";
import { ResetPasswordForm } from "../reset-password-form";

type ResetPasswordPageProps = {
    email?: string;
    resetNonce?: string;
};

export const ResetPasswordPage: FunctionComponent<ResetPasswordPageProps> = ({
    email,
    resetNonce,
}) => {
    return (
        <>
            <Helmet title="reset password" />
            <CohostLogo className="-ml-6 text-notWhite lg:-ml-12" />
            {email && resetNonce ? (
                <ResetPasswordForm email={email} resetNonce={resetNonce} />
            ) : (
                <RequestPasswordResetForm />
            )}
        </>
    );
};

ResetPasswordPage.displayName = "reset-password";
export default ResetPasswordPage;
