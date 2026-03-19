import { trpc } from "@/client/lib/trpc";
import { Button } from "@/client/preact/components/elements/button";
import { ProjectHandle } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { type ManagePageProps } from "./manage-page";

const useModFlags = (projectHandle: ProjectHandle) => {
    const results = trpc.projects.modFlags.query.useQuery({ projectHandle });
    return {
        isFetched: results.isFetched,
        projectId: results.data?.projectId,
        adultContent: results.data?.adultContent,
        adultContentOverride: results.data?.adultContentOverride,
    };
};

type ModFlagOperation =
    | "clear-adult-content"
    | "set-adult-content"
    | "clear-adult-content-override"
    | "set-adult-content-override";
type Inputs = {
    reason: string;
    operation: ModFlagOperation;
};

export const ModFlags: FunctionComponent<ManagePageProps> = ({ project }) => {
    const { register, handleSubmit, setValue } = useForm<Inputs>();
    const modFlags = useModFlags(project.handle);
    const mutation = trpc.projects.modFlags.mutate.useMutation();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        try {
            const payload: {
                projectHandle: ProjectHandle;
                reason: string;
                adultContent?: boolean;
                adultContentOverride?: boolean;
            } = {
                reason: data.reason,
                projectHandle: project.handle,
            };

            switch (data.operation) {
                case "clear-adult-content":
                    payload.adultContent = false;
                    break;
                case "set-adult-content":
                    payload.adultContent = true;
                    break;
                case "set-adult-content-override":
                    payload.adultContentOverride = true;
                    break;
                case "clear-adult-content-override":
                    payload.adultContentOverride = false;
                    break;
            }

            mutation.mutate(payload);
        } finally {
            location.reload();
        }
    };

    const onButtonClicked = (operation: ModFlagOperation) => {
        setValue("operation", operation);
        handleSubmit(onSubmit);
    };

    return (
        <div className="max-w-fit gap-2 rounded-lg border border-accent p-3">
            <h4 className="h4">moderation flags</h4>

            {modFlags.isFetched ? (
                <form
                    className="flex flex-col"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <p>
                        adult content:{" "}
                        {modFlags.adultContent?.toString() ?? "loading..."}
                    </p>

                    <p>
                        adult content override:{" "}
                        {modFlags.adultContentOverride?.toString() ??
                            "loading..."}
                    </p>

                    {modFlags.adultContent ? (
                        <Button
                            buttonStyle="pill"
                            color="cherry"
                            onClick={() =>
                                onButtonClicked("clear-adult-content")
                            }
                            className="w-fit"
                        >
                            set adult content flag to false
                        </Button>
                    ) : (
                        <Button
                            buttonStyle="pill"
                            color="cherry"
                            onClick={() => onButtonClicked("set-adult-content")}
                            className="w-fit"
                        >
                            set adult content flag to true
                        </Button>
                    )}
                    {modFlags.adultContentOverride ? (
                        <Button
                            buttonStyle="pill"
                            color="cherry"
                            onClick={() =>
                                onButtonClicked("clear-adult-content-override")
                            }
                            className="w-fit"
                        >
                            set adult content override to false
                        </Button>
                    ) : (
                        <Button
                            buttonStyle="pill"
                            color="cherry"
                            onClick={() =>
                                onButtonClicked("set-adult-content-override")
                            }
                            className="w-fit"
                        >
                            set adult content override to true
                        </Button>
                    )}

                    <p>
                        reason for making change:
                        <textarea {...register("reason", { required: true })} />
                    </p>
                </form>
            ) : (
                <>(loading current state)</>
            )}
        </div>
    );
};
