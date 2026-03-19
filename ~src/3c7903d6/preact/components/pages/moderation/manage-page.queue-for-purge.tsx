import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/client/preact/components/elements/button";
import { InfoBox } from "../../elements/info-box";
import { trpc } from "@/client/lib/trpc";
import { type ManagePageProps } from "./manage-page";
import { DateTime } from "luxon";

type Inputs = {
    confirmed: boolean;
};

export const QueueForPurgeForm: FunctionComponent<ManagePageProps> = ({
    project,
}) => {
    const { register, handleSubmit, watch } = useForm<Inputs>();
    const formState = watch();

    const queueForPurgeMutation =
        trpc.moderation.project.queueForPurge.useMutation();

    const onSubmit = async () => {
        await queueForPurgeMutation.mutateAsync({
            projectId: project.projectId,
        });
    };

    return (
        <form
            className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h4 className="h4">queue page for purge</h4>
            <InfoBox level="warning" className="prose">
                <p>
                    <b>HEADS UP!</b> This will start a timer to perform the
                    following irreverseable operations, at some time within 24
                    hours of {DateTime.now().plus({ days: 3 }).toString()}:
                    <ul>
                        <li>
                            hard-delete all of this page's posts without shares;
                        </li>
                        <li>
                            transfer all of this page's posts with shares to
                            @deactivated and soft-delete them;
                        </li>
                        <li>
                            hard-delete all of this page's comments without
                            replies;
                        </li>
                        <li>
                            transfer all of this page's comments with replies to
                            @deactivated and soft-delete them;
                        </li>
                        <li>hard-delete this page and its relationships.</li>
                    </ul>
                </p>
                <p>
                    The editor(s) of this page will be able to cancel the queued
                    deletion, if it was mistaken or they change their mind.
                </p>
            </InfoBox>

            <label>I've read the warnings and I'm still gonna do it:</label>
            <input
                type="checkbox"
                {...register("confirmed", { required: true })}
            />
            <Button
                type="submit"
                buttonStyle="pill"
                color="cherry"
                className="w-fit"
                disabled={!formState.confirmed}
            >
                queue page for purge
            </Button>
        </form>
    );
};
