import { trpc } from "@/client/lib/trpc";
import { ProjectId } from "@/shared/types/ids";
import { t } from "i18next";
import React, { FunctionComponent, useCallback } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ExpandingTextArea } from "../expanding-text-area";
import { useUserInfo } from "../../providers/user-info-provider";

type Inputs = {
    contents: string;
};

export const UserNote: FunctionComponent<{ projectId: ProjectId }> = ({
    projectId,
}) => {
    const { loggedIn } = useUserInfo();
    const initialContents = trpc.projects.userNote.query.useQuery(
        { describedProjectId: projectId },
        {
            suspense: true,
            refetchInterval: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            enabled: loggedIn,
        }
    ).data?.contents;

    const userNoteMutation = trpc.projects.userNote.mutate.useMutation();
    const onSubmit = useCallback<SubmitHandler<Inputs>>(
        async ({ contents }) => {
            await userNoteMutation.mutateAsync({
                describedProjectId: projectId,
                contents: contents,
            });
        },
        [projectId, userNoteMutation]
    );

    const { handleSubmit, control } = useForm<Inputs>({
        defaultValues: {
            contents: initialContents || "",
        },
        mode: "all",
    });

    if (!loggedIn) {
        return null;
    }

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark flex flex-col divide-y divide-gray-300 rounded-lg bg-white lg:max-w-sm">
            <div className="flex flex-row items-center rounded-t-lg bg-longan p-3 uppercase text-notBlack">
                Private Note
            </div>
            <div className="flex flex-col gap-2 px-3 py-2 text-notBlack">
                <div>
                    <em>Only you can see this</em>
                </div>
                <form
                    className="flex flex-col gap-3"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <Controller
                        control={control}
                        name="contents"
                        render={({ field: { ref, onChange, ...field } }) => (
                            <ExpandingTextArea
                                {...field}
                                className="border-cherry"
                                onInput={onChange}
                                ref={ref}
                                minRows={1}
                                autoComplete="off"
                                placeholder={t(
                                    "client:private-note.placeholder",
                                    {
                                        defaultValue: "add note",
                                    }
                                )}
                            />
                        )}
                    />
                    <div className="flex w-full flex-row items-center justify-end gap-4">
                        {userNoteMutation.isSuccess ? (
                            <p className="font-bold text-green">Note saved!</p>
                        ) : null}
                        {userNoteMutation.isError ? (
                            <p className="text-red">{`Sorry, we couldn't save your note. ${userNoteMutation.error.message}`}</p>
                        ) : null}
                        <button
                            className={`rounded-lg bg-cherry py-2 px-4 text-sm font-bold text-notWhite
                        hover:bg-cherry-600 active:bg-cherry-700 disabled:bg-cherry-200`}
                        >
                            {t("client:new-comment.save", {
                                defaultValue: "save",
                            })}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
