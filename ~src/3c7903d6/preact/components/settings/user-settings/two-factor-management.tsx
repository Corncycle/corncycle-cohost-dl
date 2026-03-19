import {
    TwoFactorManagementContext,
    twoFactorManagementMachine,
} from "@/client/lib/2fa-management-machine";
import { useMachine, useSelector } from "@xstate/react";
import React, { FunctionComponent, ReactNode, useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { State } from "xstate";
import { Button } from "../../elements/button";
import { InfoBox } from "../../elements/info-box";
import { ErrorBoundary } from "../../error-boundary";
import {
    buttonRowClasses,
    sectionBoxClasses,
    sectionTitleClasses,
} from "../shared";

const insetClasses = "w-fit rounded-lg border-2 border-cherry py-1 px-3";

type InactiveIdleProps = {
    resetJustFinished: boolean;
};

const selectBaseSecret = (state: State<TwoFactorManagementContext>) =>
    state.context.baseSecret;
const selectBaseSecretDataUrl = (state: State<TwoFactorManagementContext>) =>
    state.context.baseSecretDataUrl;
const selectRetriesRemaining = (state: State<TwoFactorManagementContext>) =>
    state.context.retriesRemaining;
const selectRecoverySecret = (state: State<TwoFactorManagementContext>) =>
    state.context.recoverySecret;

const InactiveIdle: FunctionComponent<InactiveIdleProps> = (props) => {
    const context = useContext(TwoFactorManagementContext);

    return (
        <div id="two-factor-auth" className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>two-factor authentication</h4>

            <InfoBox level="warning" className="prose max-w-full">
                Your account has two-factor authentication disabled. You can
                help us keep your account secure by turning it on! Click the
                button below to start.
            </InfoBox>

            <div className={buttonRowClasses}>
                <Button
                    buttonStyle="authn"
                    color="authn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        context.send({
                            type: "SETUP_START",
                        });
                    }}
                    className="font-bold"
                >
                    enable 2FA (recommended)
                </Button>
            </div>
        </div>
    );
};

const SetupPromptingBaseSecret: FunctionComponent = () => {
    const context = useContext(TwoFactorManagementContext);
    const baseSecret = useSelector(context, selectBaseSecret);
    const baseSecretDataUrl = useSelector(context, selectBaseSecretDataUrl);

    return (
        <div className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>
                two-factor authentication setup
            </h4>

            <InfoBox level="info" className="prose max-w-full">
                If you don&apos;t already have one, you&apos;ll need to download
                a two-factor authenticator app. We recommend{" "}
                <a href="https://authy.com/">Authy</a>!
            </InfoBox>

            <div className="flex flex-col items-center gap-3">
                <div className="text-center font-bold">
                    Open your authenticator app and scan this QR code:
                </div>

                <img
                    className={insetClasses}
                    width="250"
                    height="250"
                    src={baseSecretDataUrl}
                    alt="QR code"
                />

                <div className="text-center font-bold">
                    If your authenticator app doesn&apos;t support QR, enter the
                    secret code below:
                </div>

                <div className={insetClasses}>{baseSecret}</div>
            </div>

            <InfoBox level="info" className="prose max-w-full">
                Once cohost is registered in your app, you should see a
                six-digit code and a countdown.
            </InfoBox>

            <div className="flex w-full flex-row items-center font-bold text-notWhite">
                <Button
                    buttonStyle="authn"
                    color="authn-other"
                    onClick={(e) => {
                        e.preventDefault();
                        context.send({ type: "CANCEL" });
                    }}
                    type="reset"
                    className="font-bold"
                >
                    cancel setup
                </Button>

                <div className="flex-1">&nbsp;</div>

                <Button
                    buttonStyle="authn"
                    color="authn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        context.send({ type: "ACKNOWLEDGE" });
                    }}
                    className="font-bold"
                    type="submit"
                >
                    continue
                </Button>
            </div>
        </div>
    );
};

type ConfirmingTokenProps = {
    mode: "setup" | "reset";
};

type ConfirmingTokenInputs = {
    token: string;
};

const ConfirmingToken: FunctionComponent<ConfirmingTokenProps> = ({ mode }) => {
    const context = useContext(TwoFactorManagementContext);
    const retriesRemaining = useSelector(context, selectRetriesRemaining);
    const { handleSubmit, register } = useForm<ConfirmingTokenInputs>({
        mode: "onTouched",
    });

    const onSubmit: SubmitHandler<ConfirmingTokenInputs> = (data) => {
        const type =
            mode === "setup" ? "SETUP_ENTER_TOKEN" : "RESET_ENTER_TOKEN";

        context.send({ type, token: data.token });
    };

    return (
        <div className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>
                two-factor authentication setup
            </h4>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col items-center gap-3"
            >
                {mode === "setup" ? (
                    <div className="text-center font-bold">
                        Enter the 6-digit code found in your authenticator app
                        below.
                    </div>
                ) : (
                    <div className="text-center font-bold">
                        Enter the 6-digit code found in your authenticator app
                        below. If you don&apos;t have access to your
                        authenticator, you can also enter your recovery code.
                    </div>
                )}

                <div>
                    <label htmlFor="token" className="font-bold">
                        your 6-digit code:
                    </label>

                    <input
                        className={`block rounded-lg border-2 border-gray-600
                            bg-transparent text-notBlack focus:border-notBlack`}
                        type="text"
                        autoComplete="one-time-code"
                        {...register("token", {
                            required: true,
                        })}
                    />

                    {retriesRemaining ? (
                        <div className="text-sm text-gray-600">
                            incorrect code. retries left: {retriesRemaining}.
                        </div>
                    ) : null}
                </div>

                <div className="flex w-full flex-row items-center font-bold text-notWhite">
                    <Button
                        buttonStyle="authn"
                        color="authn-other"
                        onClick={(e) => {
                            e.preventDefault();
                            context.send({ type: "CANCEL" });
                        }}
                        className="font-bold"
                        type="reset"
                    >
                        cancel
                    </Button>

                    <div className="flex-1">&nbsp;</div>

                    <Button
                        buttonStyle="authn"
                        color="authn-primary"
                        type="submit"
                        className="font-bold"
                    >
                        continue
                    </Button>
                </div>
            </form>
        </div>
    );
};

type ActiveIdleProps = {
    setupJustFinished: boolean;
};

const ActiveIdle: FunctionComponent<ActiveIdleProps> = ({
    setupJustFinished,
}) => {
    const context = useContext(TwoFactorManagementContext);
    const recoverySecret = useSelector(context, selectRecoverySecret);

    return (
        <div className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>
                {setupJustFinished
                    ? "two-factor authentication setup"
                    : "two-factor authentication"}
            </h4>

            <InfoBox level="done">
                <p className="font-bold text-green-800">
                    Two-factor authentication is enabled!
                </p>
                Thanks for helping us keep your account secure.
            </InfoBox>

            {setupJustFinished ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="text-center font-bold">
                        If you lose access to your authenticator for any
                        reason&mdash;e.g. your phone gets factory reset or you
                        lose it&mdash;you can use the code below to recover your
                        account.
                    </div>

                    <div className={insetClasses}>{recoverySecret}</div>

                    <div className="text-center font-bold">
                        You can enter it in place of the 6-digit code when
                        logging in to disable 2FA. We won&apos;t show you this
                        code again, so save it in a secure place now.
                    </div>

                    <Button
                        buttonStyle="authn"
                        color="authn-primary"
                        onClick={(e) => {
                            e.preventDefault();
                            context.send({ type: "ACKNOWLEDGE" });
                        }}
                        className="font-bold text-notWhite"
                    >
                        finish
                    </Button>
                </div>
            ) : (
                <div className={buttonRowClasses}>
                    <Button
                        buttonStyle="authn"
                        color="authn-other"
                        onClick={(e) => {
                            e.preventDefault();
                            context.send({
                                type: "RESET_START",
                            });
                        }}
                        className="font-bold"
                    >
                        disable 2FA (not recommended)
                    </Button>
                </div>
            )}
        </div>
    );
};

const SetupError: FunctionComponent = () => {
    const context = useContext(TwoFactorManagementContext);

    return (
        <div className={sectionBoxClasses}>
            There was an unexpected error setting up two-factor authentication
            for you, and your settings are unchanged. Try setting it up again
            later, or get in touch with us at support@cohost.org if the issue
            persists.
            <button
                onClick={(e) => {
                    e.preventDefault();
                    context.send({ type: "ACKNOWLEDGE" });
                }}
            >
                OK
            </button>
        </div>
    );
};

const ResetError: FunctionComponent = () => {
    const context = useContext(TwoFactorManagementContext);

    return (
        <div className={sectionBoxClasses}>
            There was an error disabling two-factor authentication on your
            account. It may or may not be disabled, so try reloading to check
            before you delete data from your authenticator.
            <button
                onClick={(e) => {
                    e.preventDefault();
                    context.send({ type: "ACKNOWLEDGE" });
                }}
            >
                reload
            </button>
        </div>
    );
};

export const TwoFactorManagementForm: FunctionComponent = () => {
    const [state, , twoFactorManagementService] = useMachine(
        twoFactorManagementMachine,
        { devTools: process.env.NODE_ENV === "development" }
    );
    let body: ReactNode;

    switch (true) {
        case state.matches("disabled.idle"):
            body = <InactiveIdle resetJustFinished={false} />;
            break;
        case state.matches("disabled.setup.promptingBaseSecret"):
            body = <SetupPromptingBaseSecret />;
            break;
        case state.matches("disabled.setup.confirmingToken"):
            body = <ConfirmingToken mode="setup" />;
            break;
        case state.matches("disabled.setupDone"):
            body = <ActiveIdle setupJustFinished={true} />;
            break;
        case state.matches("disabled.setupError"):
            body = <SetupError />;
            break;
        case state.matches("enabled.idle"):
            body = <ActiveIdle setupJustFinished={false} />;
            break;
        case state.matches("enabled.reset.confirmingToken"):
            body = <ConfirmingToken mode="reset" />;
            break;
        case state.matches("enabled.resetDone"):
            body = <InactiveIdle resetJustFinished={true} />;
            break;
        case state.matches("enabled.resetError"):
            body = <ResetError />;
            break;
        default:
            body = <>loading...</>;
            break;
    }

    return (
        <ErrorBoundary>
            <TwoFactorManagementContext.Provider
                value={twoFactorManagementService}
            >
                {body}
            </TwoFactorManagementContext.Provider>
        </ErrorBoundary>
    );
};
