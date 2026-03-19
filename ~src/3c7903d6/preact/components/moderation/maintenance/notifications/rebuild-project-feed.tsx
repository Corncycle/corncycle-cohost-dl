import { trpc } from "@/client/lib/trpc";
import { useSSR } from "@/client/preact/hooks/is-server";
import { useProjectSearch } from "@/client/preact/hooks/search";
import { ProjectHandle } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import React, {
    FunctionComponent,
    useTransition,
    useCallback,
    useId,
    useState,
} from "react";
import Autosuggest, {
    OnSuggestionsClearRequested,
    OnSuggestionSelected,
    RenderSuggestion,
    RenderSuggestionsContainer,
    SuggestionsFetchRequested,
} from "react-autosuggest";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/client/preact/components/elements/button";
import loadable from "@loadable/component";

const DevTool = loadable(() => import("@hookform/devtools"), {
    resolveComponent: (components) => components.DevTool,
    ssr: false,
});

type Inputs = {
    handle: string;
    priority: boolean;
};

const renderSuggestion: RenderSuggestion<WireProjectModel> = (
    suggestion,
    { isHighlighted }
) => (
    <div
        className={`${
            isHighlighted ? "bg-strawberry-200" : ""
        } px-3 leading-relaxed`}
    >
        {suggestion.handle}
    </div>
);

const renderSuggestionContainer: RenderSuggestionsContainer = ({
    containerProps,
    children,
}) => {
    const numChildren = React.Children.count(children);
    if (!numChildren) return null;
    return (
        <div
            {...containerProps}
            className="cohost-shadow-light not-prose cohost-shadow-light dark:cohost-shadow-dark absolute mt-3 w-fit rounded-lg bg-notWhite py-3"
        >
            {children}
        </div>
    );
};

export const RebuildProjectFeed: FunctionComponent = () => {
    const [isPending, startTransition] = useTransition();
    const [searchToken, setSearchToken] = useState<string>("");
    const { projects } = useProjectSearch(searchToken, { skipMinimum: true });
    const rebuildNotifications =
        trpc.moderation.maintenance.notifications.rebuildForProject.useMutation();
    const idPrefix = useId();

    const { isBrowser } = useSSR();

    const { register, control, setValue, handleSubmit, formState, reset } =
        useForm<Inputs>({
            defaultValues: {
                handle: "",
                priority: false,
            },
        });

    const onSuggestionSelected = useCallback<
        OnSuggestionSelected<WireProjectModel>
    >(
        (event, data) => {
            setValue("handle", data.suggestionValue);
        },
        [setValue]
    );

    const onSuggestionsFetchRequested = useCallback<SuggestionsFetchRequested>(
        ({ value }) => {
            startTransition(() => {
                setSearchToken(value);
            });
        },
        []
    );

    const onSuggestionsClearRequested =
        useCallback<OnSuggestionsClearRequested>(() => {
            startTransition(() => {
                setSearchToken("");
            });
        }, []);

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        await rebuildNotifications.mutateAsync({
            projectHandle: ProjectHandle.parse(values.handle),
            priority: values.priority,
        });
        reset();
    };

    return (
        <form
            className="not-prose flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
        >
            <fieldset className="flex flex-col gap-2">
                <label htmlFor={`${idPrefix}-handle`} className="text-lg">
                    project handle
                </label>
                <Controller
                    control={control}
                    name="handle"
                    rules={{
                        required: "Handle is required!",
                    }}
                    render={({ field }) => (
                        <Autosuggest
                            suggestions={projects ?? []}
                            getSuggestionValue={(project) => project.handle}
                            inputProps={{
                                ...field,
                                id: `${idPrefix}-handle`,
                                className: "focus:border-cherry",
                            }}
                            onSuggestionSelected={onSuggestionSelected}
                            onSuggestionsFetchRequested={
                                onSuggestionsFetchRequested
                            }
                            onSuggestionsClearRequested={
                                onSuggestionsClearRequested
                            }
                            renderSuggestion={renderSuggestion}
                            renderSuggestionsContainer={
                                renderSuggestionContainer
                            }
                        />
                    )}
                />
            </fieldset>
            <fieldset className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <label htmlFor={`${idPrefix}-priority`} className="text-lg">
                        run immediately?
                    </label>
                    <input
                        type="checkbox"
                        className="bg-notWhite text-cherry"
                        {...register("priority")}
                        id={`${idPrefix}-priority`}
                    />
                </div>
                <span className="text-sm italic">
                    creates the rebuild job with priority 1. use sparingly.
                </span>
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

            {isBrowser && process.env.NODE_ENV !== "production" ? (
                <DevTool control={control} />
            ) : null}
        </form>
    );
};
