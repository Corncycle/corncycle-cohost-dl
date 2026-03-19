import { trpc } from "@/client/lib/trpc";
import { Button } from "@/client/preact/components/elements/button";
import { ProjectId } from "@/shared/types/ids";
import { DevTool } from "@hookform/devtools";
import React, { FunctionComponent, useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
    projectId: ProjectId;
};

export const RebuildDashboardForm: FunctionComponent = () => {
    const rebuildDashboardMutation =
        trpc.moderation.maintenance.dashboard.rebuildForProject.useMutation();

    const onSubmit = useCallback<SubmitHandler<Inputs>>(
        (values) => {
            rebuildDashboardMutation.mutate({
                projectId: values.projectId as ProjectId,
            });
        },
        [rebuildDashboardMutation]
    );

    const { register, control, handleSubmit, formState } = useForm<Inputs>({
        defaultValues: {
            projectId: 0 as ProjectId,
        },
    });

    return (
        <form
            className="not-prose flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
        >
            <fieldset className="flex flex-col gap-2">
                <label className="text-lg">
                    project id:
                    <input
                        type="number"
                        step={1}
                        min={0}
                        {...register("projectId", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                </label>
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
                    <span className="text-green">
                        Job scheduled successfully!
                    </span>
                ) : null}
            </div>

            {process.env.NODE_ENV !== "production" ? (
                <DevTool control={control} />
            ) : null}
        </form>
    );
};
