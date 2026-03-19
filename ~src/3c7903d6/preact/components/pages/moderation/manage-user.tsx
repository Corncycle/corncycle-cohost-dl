import { trpc } from "@/client/lib/trpc";
import {
    Permission,
    WireAuditLogEntryTypes,
    WireUserModel,
} from "@/shared/types/wire-models";
import React, { FunctionComponent, useState } from "react";
import { ActivateUserForm } from "./manage-user.activate";
import { BanUserForm } from "./manage-user.ban-user-form";
import { ManagePermissionsForm } from "./manage-user.manage-permissions";
import { PurgeUserForm } from "./manage-user.purge-user";
import { sitemap } from "@/shared/sitemap";
import { BirthdateEditForm } from "./manage-user.birthdate-edit-form";
import { UserId } from "@/shared/types/ids";
import { useNavigate } from "react-router-dom";
import { Button } from "../../elements/button";
import { BasicButton } from "../../elements/basic-button";

export type ManageUserPageProps = {
    user: WireUserModel;
    moderationUserData: {
        stripeCustomerId: string | null;
        emailVerifyCanceled: boolean;
        birthdate: string;
        lastActivityTime: string | null;
    };
    permissions: Permission[];
    auditLog: (
        | WireAuditLogEntryTypes["grant_permission"]
        | WireAuditLogEntryTypes["revoke_permission"]
    )[];
    userLookup: { [userId: string]: WireUserModel };
    isActivated: boolean;
};

const Reset2FAButton: FunctionComponent<{ userId: UserId }> = ({ userId }) => {
    const navigate = useNavigate();

    const reset2FAMutation = trpc.moderation.user.reset2FA.useMutation();

    const onClick = () =>
        reset2FAMutation
            .mutateAsync({
                userId,
            })
            .then(() =>
                // reload the page
                navigate(0)
            );

    return (
        <Button
            buttonStyle="pill"
            color="cherry"
            className="w-fit"
            onClick={onClick}
        >
            reset 2FA
        </Button>
    );
};

export const ManageUser: FunctionComponent<ManageUserPageProps> = ({
    user,
    permissions,
    auditLog,
    userLookup,
    isActivated,
    moderationUserData,
}) => {
    const editedProjects = trpc.moderation.user.listEditedProjects.useQuery(
        { userId: user.userId },
        {
            suspense: true,
        }
    );
    const noSelfProject =
        !!editedProjects.data?.projects &&
        !editedProjects.data.projects.some((project) => project.isSelfProject);
    const [showBirthdateEditForm, setShowBirthdateEditForm] = useState(false);

    const recreateSelfProject =
        trpc.moderation.user.recreateSelfProject.useMutation();
    const utils = trpc.useContext();

    const onRecreateSelfProject = async () => {
        await recreateSelfProject.mutateAsync({ userId: user.userId });
        await utils.moderation.user.listEditedProjects.invalidate();
    };

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark container mx-auto mt-12 flex flex-col gap-4 rounded-lg bg-notWhite p-3 text-notBlack">
            <h1 className="text-4xl">manage user</h1>

            <div className="prose">
                <table>
                    <tbody>
                        <tr>
                            <td>e-mail address</td>
                            <td>
                                {user.email} (
                                {user.emailVerified
                                    ? "verified"
                                    : moderationUserData.emailVerifyCanceled
                                    ? "verification cancelled"
                                    : "not verified"}
                                )
                            </td>
                        </tr>
                        <tr>
                            <td>2fa enabled</td>
                            <td>
                                {user.twoFactorEnabled.toString()}

                                {user.twoFactorEnabled ? (
                                    <Reset2FAButton userId={user.userId} />
                                ) : null}
                            </td>
                        </tr>
                        <tr>
                            <td>is adult</td>
                            <td>
                                {user.isAdult ? "true" : "false"} (
                                <a
                                    onClick={() =>
                                        setShowBirthdateEditForm(true)
                                    }
                                    className="cursor-pointer"
                                >
                                    edit birthdate
                                </a>
                                )
                            </td>
                        </tr>
                        {showBirthdateEditForm ? (
                            <tr>
                                <td colSpan={2}>
                                    <BirthdateEditForm
                                        user={user}
                                        birthdate={moderationUserData.birthdate}
                                    />
                                </td>
                            </tr>
                        ) : null}
                        <tr>
                            <td>is activated</td>
                            <td>{isActivated.toString()}</td>
                        </tr>
                        <tr>
                            <td>stripe customer id</td>
                            <td>
                                {moderationUserData.stripeCustomerId ? (
                                    <a
                                        href={`https://dashboard.stripe.com/customers/${moderationUserData.stripeCustomerId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {moderationUserData.stripeCustomerId}
                                    </a>
                                ) : (
                                    "n/a"
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>last activity time</td>
                            <td>
                                {moderationUserData.lastActivityTime ?? "null"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="prose rounded-lg border border-mango p-3">
                <h2>edited projects</h2>
                <ul>
                    {editedProjects.data?.projects.map((project) => (
                        <li key={project.projectId}>
                            {project.displayName} (
                            <a
                                href={sitemap.public.project
                                    .mainAppProfile({
                                        projectHandle: project.handle,
                                    })
                                    .toString()}
                            >
                                @{project.handle}
                            </a>
                            ) -{" "}
                            <a
                                href={sitemap.public.moderation
                                    .manageProject({
                                        projectHandle: project.handle,
                                    })
                                    .toString()}
                            >
                                manage
                            </a>
                        </li>
                    ))}
                    {noSelfProject ? (
                        <>
                            this user appears to be missing a self project. you
                            can&nbsp;
                            <BasicButton
                                buttonSize="regular"
                                buttonColor="cherry"
                                type="button"
                                onClick={onRecreateSelfProject}
                            >
                                create one
                            </BasicButton>
                            &nbsp;for them.
                        </>
                    ) : null}
                </ul>
            </div>

            {isActivated ? null : <ActivateUserForm userId={user.userId} />}

            <ManagePermissionsForm user={user} permissions={permissions} />

            <h4 className="h4">permission audit log</h4>

            <table className="prose">
                <thead>
                    <tr>
                        <td>granted/revoked</td>
                        <td>permission</td>
                        <td>performed at</td>
                        <td>performed by user id (e-mail)</td>
                        <td>reason</td>
                    </tr>
                </thead>
                <tbody>
                    {auditLog.map((entry) => (
                        <tr key={entry.entryId}>
                            <td>
                                {entry.logType === "grant_permission"
                                    ? "granted"
                                    : "revoked"}
                            </td>
                            <td>{entry.permission}</td>
                            <td>{entry.loggedAt}</td>
                            <td>
                                {`${entry.changedBy} (${
                                    userLookup[entry.changedBy.toString()]
                                        ?.email ?? "undefined"
                                })`}
                            </td>
                            <td>{entry.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />
            <BanUserForm userId={user.userId} />
            <PurgeUserForm userId={user.userId} email={user.email} />
        </div>
    );
};

ManageUser.displayName = "moderation/manage-user";
export default ManageUser;
