import { trpc } from "@/client/lib/trpc";
import { Button } from "@/client/preact/components/elements/button";
import { ProjectId } from "@/shared/types/ids";
import loadable from "@loadable/component";
import React, { FunctionComponent, useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const DevTool = loadable(() => import("@hookform/devtools"), {
    resolveComponent: (components) => components.DevTool,
    ssr: false,
});

type Inputs = {
    startDate: Date;
    endDate: Date;
    startProjectId: number;
};

export const FillDashboardGaps: FunctionComponent = () => {
    const rebuildNotifications =
        trpc.moderation.maintenance.dashboard.fillGap.useMutation();

    const onSubmit = useCallback<SubmitHandler<Inputs>>(
        (values) => {
            rebuildNotifications.mutate({
                endDate: values.endDate.toISOString(),
                startDate: values.startDate.toISOString(),
                startingProjectId: values.startProjectId as ProjectId,
            });
        },
        [rebuildNotifications]
    );

    const { register, control, handleSubmit, formState } = useForm<Inputs>({
        defaultValues: {
            startProjectId: 0,
        },
    });

    return (
        <form
            className="not-prose flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
        >
            <fieldset className="flex flex-col gap-2">
                <label htmlFor="startDate" className="text-lg">
                    gap start date (local time)
                </label>
                <input
                    type="datetime-local"
                    {...register("startDate", {
                        required: true,
                        valueAsDate: true,
                    })}
                />
            </fieldset>
            <fieldset className="flex flex-col gap-2">
                <label htmlFor="endDate" className="text-lg">
                    gap end date (local time)
                </label>
                <input
                    type="datetime-local"
                    {...register("endDate", {
                        required: true,
                        valueAsDate: true,
                    })}
                />
            </fieldset>
            <fieldset className="flex flex-col gap-2">
                <label htmlFor="startProjectId" className="text-lg">
                    starting project ID (should be 0 in almost all cases)
                </label>
                <input
                    type="number"
                    step={1}
                    min={0}
                    {...register("startProjectId", {
                        required: true,
                        valueAsNumber: true,
                    })}
                />
            </fieldset>

            <div className="flex flex-row gap-2">
                <Button
                    type="submit"
                    buttonStyle="pill"
                    color="cherry"
                    className="w-fit"
                >
                    start gap fill
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
