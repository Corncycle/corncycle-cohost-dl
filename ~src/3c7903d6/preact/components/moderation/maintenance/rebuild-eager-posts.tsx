import { trpc } from "@/client/lib/trpc";
import { Button } from "@/client/preact/components/elements/button";
import { PostId } from "@/shared/types/ids";
import React, { FunctionComponent, useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
    startAtPostId: number;
    batchSize: number;
    rebuildAll: boolean;
};

export const RebuildEagerPosts: FunctionComponent = () => {
    const rebuildEagerPosts =
        trpc.moderation.maintenance.rebuildEagerPosts.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        await rebuildEagerPosts.mutateAsync({
            startAtPostId: values.startAtPostId as PostId,
            batchSize: values.batchSize,
            rebuildAll: values.rebuildAll,
        });
    };

    const { register, handleSubmit, formState } = useForm<Inputs>({
        defaultValues: {
            startAtPostId: 1,
            batchSize: 50,
            rebuildAll: false,
        },
    });

    return (
        <form
            className="not-prose flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
        >
            <fieldset className="flex flex-col gap-2">
                <label className="text-lg">
                    starting post ID
                    <input
                        type="number"
                        min={1}
                        {...register("startAtPostId", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                </label>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
                <label className="text-lg">
                    batch size
                    <input
                        type="number"
                        min={1}
                        max={1000}
                        {...register("batchSize", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                </label>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <label className="text-lg">
                        rebuild posts older than yesterday?
                        <input type="checkbox" {...register("rebuildAll")} />
                    </label>
                </div>
            </fieldset>
            <div className="flex flex-row gap-2">
                <Button
                    type="submit"
                    buttonStyle="pill"
                    color="cherry"
                    className="w-fit"
                >
                    rebuild
                </Button>
                {formState.isSubmitSuccessful ? (
                    <span className="text-green">Submitted successfully!</span>
                ) : null}
            </div>
        </form>
    );
};
