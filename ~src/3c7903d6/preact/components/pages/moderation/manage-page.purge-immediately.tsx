import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/client/preact/components/elements/button";
import { InfoBox } from "../../elements/info-box";
import { trpc } from "@/client/lib/trpc";
import { type ManagePageProps } from "./manage-page";

type Inputs = {
    confirmed: boolean;
};

export const PurgeImmediatelyForm: FunctionComponent<ManagePageProps> = ({
    project,
}) => {
    const { register, handleSubmit, watch } = useForm<Inputs>();
    const formState = watch();

    const purgePageMutation = trpc.moderation.project.purge.useMutation();

    const onSubmit = async () => {
        await purgePageMutation.mutateAsync({
            projectHandle: project.handle,
        });
    };

    return (
        <form
            className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h4 className="h4">purge page immediately</h4>
            <InfoBox level="warning" className="prose">
                <p>
                    <b>HEADS UP!</b> This will perform the following
                    irreverseable operations <b>immediately</b>:
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
                    Only use this form if you're doing it at user request, and
                    only if a deferred deletion is inappropriate for the
                    circumstances of the situation!
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
                purge page
            </Button>
        </form>
    );
};
