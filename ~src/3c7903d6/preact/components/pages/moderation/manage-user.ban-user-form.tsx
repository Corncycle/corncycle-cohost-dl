import { trpc } from "@/client/lib/trpc";
import { UserId } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../elements/button";
import { InfoBox } from "../../elements/info-box";

type Inputs = {
    banReason: string;
};

export const BanUserForm: FunctionComponent<{ userId: UserId }> = ({
    userId,
}) => {
    const { register, handleSubmit } = useForm<Inputs>();
    const navigate = useNavigate();

    const banUserMutation = trpc.moderation.user.ban.useMutation();

    const onSubmit: SubmitHandler<Inputs> = (values) =>
        banUserMutation
            .mutateAsync({
                userId,
                banReason: values.banReason,
            })
            .then(() =>
                // reload the page
                navigate(0)
            );

    return (
        <form
            className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h4 className="h4">ban user</h4>
            <InfoBox level="warning" className="prose">
                <p>
                    <b>HEADS UP!</b> This will add the "suspended" permission to
                    the user as well as the "suspended" flag to their
                    self-project and all projcts which they are the sole editor
                    of.
                </p>
                <p>
                    This will also delete ALL POSTS AND COMMENTS from those
                    projects.
                </p>
                <p>
                    This last part is very difficult to undo, so ONLY RUN THIS
                    IF YOU ARE GOING SCORCHED EARTH!
                </p>
            </InfoBox>
            <label>reason for banning user:</label>
            <textarea {...register("banReason", { required: true })} />
            <Button
                type="submit"
                buttonStyle="pill"
                color="cherry"
                className="w-fit"
            >
                ban user
            </Button>
        </form>
    );
};
