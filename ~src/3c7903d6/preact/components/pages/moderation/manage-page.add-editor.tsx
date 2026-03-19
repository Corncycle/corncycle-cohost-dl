import { useEmailSearch } from "@/client/preact/hooks/search";
import { GetUserListResp } from "@/shared/api-types/users-v1";
import { WireUserModel } from "@/shared/types/wire-models";
import React, { FunctionComponent, useCallback, useState } from "react";
import Autosuggest, {
    ChangeEvent,
    OnSuggestionsClearRequested,
    OnSuggestionSelected,
    RenderSuggestion,
    SuggestionsFetchRequested,
} from "react-autosuggest";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/client/preact/components/elements/button";

const renderSuggestion: RenderSuggestion<GetUserListResp["users"][0]> = (
    suggestion,
    { isHighlighted }
) => (
    <div key={`autocomplete-user-${suggestion.userId}`}>
        {suggestion.email} (user id {suggestion.userId})
    </div>
);

export type EditorOperationInputs = {
    action: "create" | "delete";
    userId: number;
    email?: string;
    reason?: string;
};

type AddEditorProps = {
    onSubmit: SubmitHandler<EditorOperationInputs>;
};

export const AddEditor: FunctionComponent<AddEditorProps> = ({ onSubmit }) => {
    const { register, handleSubmit, setValue } =
        useForm<EditorOperationInputs>();

    const [selectedEditorToAdd, setSelectedEditorToAdd] = useState<
        WireUserModel | undefined
    >(undefined);
    const [emailSearchToken, setEmailSearchToken] = useState<string>("");
    const { users: emailSearchUsers, invalidate: emailSearchInvalidate } =
        useEmailSearch(emailSearchToken);

    const onEmailSearchChange = useCallback(
        (event: React.FormEvent<HTMLElement>, { newValue }: ChangeEvent) => {
            setEmailSearchToken(newValue);
        },
        [setEmailSearchToken]
    );

    const onAddEditorDeselect = () => {
        void setSelectedEditorToAdd(undefined);
        setValue("userId", -1);
    };

    const onSuggestionsFetchRequested = useCallback<SuggestionsFetchRequested>(
        ({ value }) => {
            void emailSearchInvalidate(value);
        },
        [emailSearchInvalidate]
    );

    const onSuggestionsClearRequested =
        useCallback<OnSuggestionsClearRequested>(() => {
            void emailSearchInvalidate("");
        }, [emailSearchInvalidate]);

    const onSuggestionSelected = useCallback<
        OnSuggestionSelected<WireUserModel>
    >(
        (_event, { suggestion }) => {
            void setSelectedEditorToAdd(suggestion);
            setValue("userId", suggestion.userId);
        },
        [setSelectedEditorToAdd, setValue]
    );

    return (
        <>
            <form
                className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h4 className="h4">add editors</h4>

                <input type="hidden" value="create" {...register("action")} />

                <p />

                {selectedEditorToAdd ? (
                    <>
                        selected user:
                        {`${selectedEditorToAdd.email} (user id ${selectedEditorToAdd.userId})`}
                        <Button
                            buttonStyle="pill"
                            color="cherry"
                            className="w-1/4"
                            onClick={onAddEditorDeselect}
                        >
                            deselect
                        </Button>
                    </>
                ) : (
                    <>
                        search for the e-mail of an editor to add:
                        <Autosuggest
                            suggestions={emailSearchUsers ?? []}
                            getSuggestionValue={(suggestion) =>
                                suggestion.email
                            }
                            inputProps={{
                                onChange: onEmailSearchChange,
                                value: emailSearchToken,
                            }}
                            onSuggestionsFetchRequested={
                                onSuggestionsFetchRequested
                            }
                            onSuggestionsClearRequested={
                                onSuggestionsClearRequested
                            }
                            onSuggestionSelected={onSuggestionSelected}
                            renderSuggestion={renderSuggestion}
                            alwaysRenderSuggestions={true}
                        />
                    </>
                )}

                <p>
                    reason for adding editor:
                    <textarea {...register("reason", { required: true })} />
                </p>

                <Button
                    type="submit"
                    buttonStyle="pill"
                    color="cherry"
                    className="w-fit"
                >
                    add editor
                </Button>
            </form>
        </>
    );
};
