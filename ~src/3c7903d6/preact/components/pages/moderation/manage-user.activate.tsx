import { trpc } from "@/client/lib/trpc";
import { UserId } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../elements/button";
import { InfoBox } from "../../elements/info-box";

export const ActivateUserForm: FunctionComponent<{ userId: UserId }> = ({
    userId,
}) => {
    const navigate = useNavigate();

    const { handleSubmit } = useForm();
    const activateUserMutation = trpc.moderation.user.activate.useMutation();

    const onSubmit = async () => {
        await activateUserMutation.mutateAsync({ userId });
        navigate(0);
    };

    return (
        <form
            className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h4 className="h4">activate user</h4>
            <InfoBox level="info" className="prose">
                this generates a new single-use invite and activates the user
                with it, sending them an email to let them know they can post
                now.
            </InfoBox>
            <Button
                type="submit"
                buttonStyle="pill"
                color="cherry"
                className="w-fit"
            >
                activate user
            </Button>
        </form>
    );
};
