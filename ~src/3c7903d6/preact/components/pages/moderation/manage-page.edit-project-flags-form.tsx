import React, { FunctionComponent } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { trpc } from "@/client/lib/trpc";
import { ProjectFlag } from "@/shared/types/projects";
import { ProjectId } from "@/shared/types/ids";
import { Listbox } from "@headlessui/react";
import { DevTool } from "@hookform/devtools";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { Button } from "@/client/preact/components/elements/button";

type Inputs = {
    projectFlags: ProjectFlag[];
    reason: string;
};

export const EditProjectFlagsForm: FunctionComponent<{
    currentFlags: ProjectFlag[];
    projectId: ProjectId;
}> = ({ currentFlags, projectId }) => {
    const editProjectFlags = trpc.moderation.project.updateFlags.useMutation();

    const onSubmit: SubmitHandler<Inputs> = (inputs) => {
        return editProjectFlags.mutateAsync({
            projectId,
            newFlags: inputs.projectFlags,
            reason: inputs.reason,
        });
    };

    const { register, handleSubmit, control, formState } = useForm<Inputs>({
        defaultValues: {
            projectFlags: currentFlags,
            reason: "",
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="my-6 flex max-w-prose flex-col gap-4"
        >
            <div className="max-w-prose">
                <label>flags</label>
                <Controller
                    control={control}
                    name="projectFlags"
                    render={({ field }) => (
                        <Listbox
                            multiple
                            value={field.value}
                            onChange={field.onChange}
                        >
                            <div className="relative mt-1">
                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-notWhite py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-cherry focus-visible:ring-2 focus-visible:ring-notWhite focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-mango-300">
                                    <span className="block truncate">
                                        {field.value.join(", ")}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-notWhite py-1 text-base shadow-lg ring-1 ring-notBlack ring-opacity-5 focus:outline-none">
                                    {ProjectFlag.options.map((flag) => (
                                        <Listbox.Option
                                            key={flag}
                                            value={flag}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                    active
                                                        ? "bg-cherry-100 text-cherry-900"
                                                        : "text-gray-900"
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    {" "}
                                                    <span
                                                        className={`block truncate ${
                                                            selected
                                                                ? "font-medium"
                                                                : "font-normal"
                                                        }`}
                                                    >
                                                        {flag}
                                                    </span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-mango-600">
                                                            <CheckIcon
                                                                className="h-5 w-5"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    )}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label>change reason</label>
                {formState.errors.reason ? (
                    <span className="font-bold text-red">
                        {formState.errors.reason.message}
                    </span>
                ) : null}
                <textarea
                    className="w-full"
                    {...register("reason", {
                        required: "You must provide a reason!",
                    })}
                />
            </div>
            <Button
                type="submit"
                buttonStyle="pill"
                color="cherry"
                className="max-w-max"
            >
                submit
            </Button>
            {formState.isSubmitSuccessful ? (
                <span className="font-bold text-green">Submit successful!</span>
            ) : null}
            {process.env.NODE_ENV === "development" ? (
                <DevTool control={control} />
            ) : null}
        </form>
    );
};
