import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/client/preact/components/elements/button";
import { InfoBox } from "../../elements/info-box";
import { trpc } from "@/client/lib/trpc";
import { UserId } from "@/shared/types/ids";

type Inputs = {
    confirmed: boolean;
};

type Props = {
    email: string;
    userId: UserId;
};

export const PurgeUserForm: FunctionComponent<Props> = ({ email, userId }) => {
    const { register, handleSubmit, watch } = useForm<Inputs>();
    const formState = watch();

    const purgeUserMutation = trpc.moderation.user.purge.useMutation();
    const { data: hasActiveSubscription } =
        trpc.moderation.user.hasActiveSubscription.useQuery(
            { userId },
            { suspense: true }
        );

    const onSubmit = async () => {
        await purgeUserMutation.mutateAsync({
            userId,
        });
    };

    return (
        <form
            className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h4 className="h4">purge user</h4>

            {hasActiveSubscription ? (
                <InfoBox level="warning" className="prose">
                    <p>
                        This user ({email}) cannot currently be purged because
                        they have one or more active subscriptions. Cancel and
                        refund them manually first from the Stripe dashboard.
                    </p>
                </InfoBox>
            ) : (
                <>
                    <InfoBox level="warning" className="prose">
                        <p>
                            <b>HEADS UP!</b> This will perform the following
                            irreverseable operations:
                            <ul>
                                <li>purge this user's self-project;</li>
                                <li>
                                    purge all non-self projects for which this
                                    user is the sole editor;
                                </li>
                                <li>permanently delete this user</li>
                            </ul>
                        </p>
                        <p>
                            Only use this form if you're doing it at user
                            request!
                        </p>
                    </InfoBox>

                    <label>
                        I've read the warnings and I'm still gonna do it:
                    </label>
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
                        purge user
                    </Button>
                </>
            )}
        </form>
    );
};
