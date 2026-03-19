import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";

export const ActivationError: FunctionComponent<{
    errorMessage: string;
}> = ({ errorMessage }) => {
    return (
        <>
            <Helmet title="activation error" />
            <div>
                <h1>We couldn't activate your account</h1>
                <p>
                    Looks like there was a problem activating your account! If
                    you want, you can try clicking the invite link again, but if
                    things aren't working when you think they should be, email
                    us at{" "}
                    <a href="mailto:support@cohost.org">support@cohost.org</a>{" "}
                    and we'll see what we can do.
                </p>
                <p>
                    You can reference this error message:{" "}
                    <code>{errorMessage}</code>
                </p>
            </div>
        </>
    );
};

ActivationError.displayName = "activation-error";
export default ActivationError;
