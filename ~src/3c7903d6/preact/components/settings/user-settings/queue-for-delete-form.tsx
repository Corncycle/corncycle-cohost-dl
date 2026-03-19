import { trpc } from "@/client/lib/trpc";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useCurrentProject } from "../../../hooks/data-loaders";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";
import { InfoBox, InfoBoxLevel } from "../../elements/info-box";
import { SettingsRow } from "../../elements/settings-row";
import { FormSubmitButtonRow } from "../form-submit-button-row";
import { DateTime } from "luxon";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import sitemap from "@/shared/sitemap";
import AuthHelpers from "@/client/lib/auth-helpers";
import { getVanillaClient } from "@/client/lib/trpc-vanilla";
import { values } from "lodash";
import { StyledInput } from "../../elements/styled-input";

type ScheduleDeletionInputs = {
    confirmEmail: string;
    password: string;
    otp: string;
};

const InnerScheduleForDeleteForm: FunctionComponent = () => {
    const userInfo = useUserInfo();
    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        control,
        watch,
    } = useForm<ScheduleDeletionInputs>({
        defaultValues: {
            confirmEmail: "",
            password: "",
            otp: "",
        },
    });
    const scheduleDeletionMutation = trpc.users.scheduleDelete.useMutation();
    const confirmEmail = watch("confirmEmail");

    const onSubmit: SubmitHandler<ScheduleDeletionInputs> = async (values) => {
        if (!userInfo.email) {
            throw new Error("e-mail is null?");
        }

        const email = userInfo.email;
        const saltResult = await getVanillaClient().login.getSalt.query({
            email,
        });
        const clientHash = await AuthHelpers.hashPasswordInWorker(
            email,
            saltResult.salt,
            values.password
        );

        await scheduleDeletionMutation.mutateAsync({
            confirmEmail: values.confirmEmail,
            clientHash: clientHash,
            twoFactorToken: values.otp,
        });
    };

    return (
        <div className={sectionBoxClasses}>
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h4 className={sectionTitleClasses}>delete account</h4>

                <p className="prose">
                    If you'd like to delete this account, fill out the
                    information below. We'll schedule its data to be permanently
                    deleted in 3 days &ndash; to give you a chance to change
                    your mind &ndash; but with no further action required from
                    you. If you need to delete it sooner than that, please
                    e-mail us at{" "}
                    <a href="mailto:support@cohost.org">support@cohost.org</a>{" "}
                    and we can help you.
                </p>

                <SettingsRow
                    bigLabel="confirm e-mail address"
                    inputElement={
                        <div className="flex flex-row items-center gap-2">
                            <StyledInput
                                trigger={trigger}
                                name="confirmEmail"
                                control={control}
                                type="email"
                                showValidity={true}
                            />
                        </div>
                    }
                />

                <SettingsRow
                    bigLabel="confirm your password"
                    disabled={confirmEmail === ""}
                    inputElement={
                        <StyledInput
                            trigger={trigger}
                            name="password"
                            control={control}
                            type="password"
                            showValidity={false}
                            disabled={confirmEmail === ""}
                        />
                    }
                />

                {userInfo.twoFactorActive ? (
                    <SettingsRow
                        bigLabel="confirm your 2fa code"
                        disabled={confirmEmail === ""}
                        inputElement={
                            <StyledInput
                                trigger={trigger}
                                name="otp"
                                control={control}
                                type="text"
                                showValidity={false}
                                disabled={confirmEmail === ""}
                            />
                        }
                    />
                ) : null}

                <FormSubmitButtonRow
                    submitMutation={scheduleDeletionMutation}
                    submitButtonLabel="schedule deletion"
                />
            </form>
        </div>
    );
};

type CancelScheduledDeletionInputs = {
    confirm: boolean;
};

const InnerCancelScheduledDeletionForm: FunctionComponent = () => {
    const { register, handleSubmit } = useForm<CancelScheduledDeletionInputs>(
        {}
    );
    const userInfo = useUserInfo();
    const cancelScheduledDeletionMutation =
        trpc.users.cancelScheduledDelete.useMutation();

    const onSubmit: SubmitHandler<CancelScheduledDeletionInputs> = async (
        values
    ) => {
        if (values.confirm) {
            await cancelScheduledDeletionMutation.mutateAsync();
        }
    };

    return userInfo.loggedIn ? (
        <div className={sectionBoxClasses}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <h4 className={sectionTitleClasses}>
                    cancel scheduled deletion
                </h4>

                <p className="prose">
                    Your account is currently scheduled for deletion. At{" "}
                    <strong>
                        {userInfo.deleteAfter!.toLocaleString(
                            DateTime.DATETIME_MED_WITH_WEEKDAY
                        )}
                    </strong>
                    , the waiting period will expire and at our next scheduled
                    maintenance less than 24 hours later, its data will be
                    permanently deleted. If you've changed your mind, or didn't
                    intend to request the account's deletion, you can cancel the
                    deletion here.
                </p>

                <SettingsRow
                    bigLabel="Please check this checkbox to confirm."
                    inputElement={
                        <input
                            type="checkbox"
                            {...register("confirm", {
                                required:
                                    "You must check the checkbox to confirm.",
                            })}
                            className="rounded-checkbox"
                        />
                    }
                />

                <FormSubmitButtonRow
                    submitMutation={cancelScheduledDeletionMutation}
                    submitButtonLabel="cancel deletion"
                />
            </form>
        </div>
    ) : null;
};

export const ScheduleForDeleteForm: FunctionComponent = () => {
    const userInfo = useUserInfo();

    if (userInfo.deleteAfter) {
        return <InnerCancelScheduledDeletionForm />;
    } else {
        return <InnerScheduleForDeleteForm />;
    }
};
