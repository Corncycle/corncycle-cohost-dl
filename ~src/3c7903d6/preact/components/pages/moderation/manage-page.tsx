import { trpc } from "@/client/lib/trpc";
import { Button } from "@/client/preact/components/elements/button";
import sitemap from "@/shared/sitemap";
import { UserId } from "@/shared/types/ids";
import {
    ProjectFlag,
    WireProjectModelModeratorExtensions,
} from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ModeratorHandleChangeForm } from "../../partials/manage-page.moderator-handle-change-form";
import { AddEditor, EditorOperationInputs } from "./manage-page.add-editor";
import { EditProfileForm } from "./manage-page.edit-profile-form";
import { EditProjectFlagsForm } from "./manage-page.edit-project-flags-form";
import { ModFlags } from "./manage-page.mod-flags";
import { PurgeImmediatelyForm } from "./manage-page.purge-immediately";
import { ActiveArtistAlleyListings } from "./manage-page.active-listings";
import { QueueForPurgeForm } from "./manage-page.queue-for-purge";
import { ModWireArtistAlley } from "@/shared/types/artist-alley";
import {
    WireAuditLogEntryTypes,
    WireUserModel,
} from "@/shared/types/wire-models";

export type ManagePageProps = {
    project: WireProjectModelModeratorExtensions;
    modFlagAuditLog: WireAuditLogEntryTypes["edit_project_mod_flags"][];
    projectFlagAuditLog: WireAuditLogEntryTypes["edit_project_flags"][];
    selfUser: WireUserModel | undefined;
    editors: WireUserModel[];
    editorAuditLog: (
        | WireAuditLogEntryTypes["add_editor"]
        | WireAuditLogEntryTypes["remove_editor"]
    )[];
    userLookup: { [userId: string]: WireUserModel };
    listings: ModWireArtistAlley[];
};

const DescribeFlagChange: FunctionComponent<{
    oldValue: boolean;
    newValue: boolean;
}> = ({ oldValue, newValue }) => {
    if (oldValue !== newValue) {
        return (
            <strong>
                {oldValue.toString()} &rarr; {newValue.toString()}
            </strong>
        );
    } else {
        return <>{oldValue.toString()}</>;
    }
};

const DescribeProjectFlagsChange: FunctionComponent<{
    oldValue: ProjectFlag[];
    newValue: ProjectFlag[];
}> = ({ oldValue, newValue }) => {
    if (oldValue !== newValue) {
        return (
            <>
                {JSON.stringify(oldValue)} &rarr; {JSON.stringify(newValue)}
            </>
        );
    } else {
        return <>{JSON.stringify(oldValue)}</>;
    }
};

export const ManagePage: FunctionComponent<ManagePageProps> = (props) => {
    const { project, selfUser, editors, editorAuditLog, userLookup } = props;
    const {
        register: registerRemoveEditor,
        handleSubmit: handleSubmitRemoveEditor,
    } = useForm<EditorOperationInputs>();

    const addEditorMutation = trpc.moderation.project.addEditor.useMutation();
    const removeEditorMutation =
        trpc.moderation.project.removeEditor.useMutation();
    const onSubmit: SubmitHandler<EditorOperationInputs> = async (data) => {
        const mutationArgs = {
            fromUserId: data.userId as UserId,
            toProjectId: project.projectId,
            reason: data.reason ?? "",
        };

        try {
            if (data.action === "create") {
                await addEditorMutation.mutateAsync(mutationArgs);
            } else {
                await removeEditorMutation.mutateAsync(mutationArgs);
            }
        } finally {
            window.location.reload();
        }
    };

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark container mx-auto mt-12 flex flex-col gap-4 rounded-lg bg-notWhite p-3 text-notBlack">
            <h1 className="text-4xl">manage page</h1>

            <EditProfileForm project={project} selfUser={selfUser} />

            <ModeratorHandleChangeForm project={project} />

            <ModFlags {...props} />

            <h4 className="h4">moderation flag changes</h4>

            <table className="prose">
                <thead>
                    <tr>
                        <td>adult content flag</td>
                        <td>adult content override</td>
                        <td>performed at</td>
                        <td>performed by user id (e-mail)</td>
                        <td>reason</td>
                    </tr>
                </thead>
                <tbody>
                    {props.modFlagAuditLog.map((entry) => (
                        <tr key={entry.entryId}>
                            <td>
                                <DescribeFlagChange
                                    oldValue={entry.oldAdultContent}
                                    newValue={entry.newAdultContent}
                                />
                            </td>
                            <td>
                                <DescribeFlagChange
                                    oldValue={entry.oldAdultContentOverride}
                                    newValue={entry.newAdultContentOverride}
                                />
                            </td>
                            <td>{entry.loggedAt}</td>
                            <td>{`${entry.changedBy} (${
                                userLookup[entry.changedBy.toString()].email
                            })`}</td>
                            <td>{entry.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 className="h4">edit project flags</h4>
            <EditProjectFlagsForm
                currentFlags={project.flags}
                projectId={project.projectId}
            />

            <h4 className="h4">project flag changes</h4>

            <table className="prose">
                <thead>
                    <tr>
                        <th>flags</th>
                        <th>performed at</th>
                        <th>performed by user id (e-mail)</th>
                        <th>reason</th>
                    </tr>
                </thead>
                <tbody>
                    {props.projectFlagAuditLog.map((entry) => (
                        <tr key={entry.entryId}>
                            <td>
                                <DescribeProjectFlagsChange
                                    oldValue={entry.oldFlags}
                                    newValue={entry.newFlags}
                                />
                            </td>
                            <td>{entry.loggedAt}</td>
                            <td>
                                {`${entry.changedBy} (${
                                    userLookup[entry.changedBy.toString()].email
                                })`}
                            </td>
                            <td>{entry.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 className="h4">current editors</h4>

            <ul>
                {editors.map((editor) => (
                    <li key={editor.userId}>
                        {editor.email} (user id {editor.userId}){" "}
                        <a
                            href={sitemap.public.moderation
                                .manageUser({ userId: editor.userId })
                                .toString()}
                        >
                            (manage)
                        </a>
                    </li>
                ))}
            </ul>

            <AddEditor onSubmit={onSubmit} />

            <form
                className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
                onSubmit={handleSubmitRemoveEditor(onSubmit)}
            >
                <h4 className="h4">remove editors</h4>

                <input
                    type="hidden"
                    value="remove"
                    {...registerRemoveEditor("action")}
                />

                <p>
                    <label htmlFor="remove-userId">editor to remove:</label>
                    <select
                        id="remove-userId"
                        {...registerRemoveEditor("userId", {
                            valueAsNumber: true,
                        })}
                    >
                        {editors.map((editor) => (
                            <option key={editor.userId} value={editor.userId}>
                                {editor.email} (user id {editor.userId})
                            </option>
                        ))}
                    </select>
                </p>

                <p>
                    reason for removing editor:
                    <textarea
                        {...registerRemoveEditor("reason", { required: true })}
                    />
                </p>

                <Button
                    type="submit"
                    buttonStyle="pill"
                    color="cherry"
                    className="w-fit"
                >
                    remove editor
                </Button>
            </form>

            <h4 className="h4">editorship changes</h4>

            <table className="prose">
                <thead>
                    <tr>
                        <td>added/removed</td>
                        <td>user id (e-mail)</td>
                        <td>performed at</td>
                        <td>performed by user id (e-mail)</td>
                        <td>reason</td>
                    </tr>
                </thead>
                <tbody>
                    {editorAuditLog.map((entry) => (
                        <tr key={entry.entryId}>
                            <td>
                                {entry.logType === "add_editor"
                                    ? "added"
                                    : "removed"}
                            </td>
                            <td>{`${entry.userId} (${
                                userLookup[entry.userId.toString()].email
                            })`}</td>
                            <td>{entry.loggedAt}</td>
                            <td>{`${entry.changedBy} (${
                                userLookup[entry.changedBy.toString()].email
                            })`}</td>
                            <td>{entry.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ActiveArtistAlleyListings {...props} />
            <QueueForPurgeForm {...props} />
            <PurgeImmediatelyForm {...props} />
        </div>
    );
};

ManagePage.displayName = "moderation/manage-page";
export default ManagePage;
