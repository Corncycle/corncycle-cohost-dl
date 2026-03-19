import { Button } from "@/client/preact/components/elements/button";
import { GrantOrRevokePermissionReq } from "@/shared/api-types/moderation-v1";
import sitemap from "@/shared/sitemap";
import { Permission, WireUserModel } from "@/shared/types/wire-models";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
    action: "grant" | "revoke";
    permission: Permission;
    reason: string;
};

export const ManagePermissionsForm: FunctionComponent<{
    user: WireUserModel;
    permissions: Permission[];
}> = ({ permissions, user }) => {
    const { register: registerGrant, handleSubmit: handleSubmitGrant } =
        useForm<Inputs>();
    const { register: registerRevoke, handleSubmit: handleSubmitRevoke } =
        useForm<Inputs>();
    const ungrantedPermissions = Permission.options.filter(
        (p) => permissions.indexOf(p) === -1
    );

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            const reqData: GrantOrRevokePermissionReq = {
                userId: user.userId,
                ...data,
            };

            if (data.action === "grant") {
                await axios.post<
                    any,
                    AxiosResponse<any>,
                    GrantOrRevokePermissionReq
                >(
                    sitemap.public.apiV1.moderation
                        .grantOrRevokePermission()
                        .toString(),
                    reqData
                );
            } else {
                await axios.delete<
                    any,
                    AxiosResponse<any>,
                    GrantOrRevokePermissionReq
                >(
                    sitemap.public.apiV1.moderation
                        .grantOrRevokePermission()
                        .toString(),
                    { data: reqData }
                );
            }
        } finally {
            window.location.reload();
        }
    };

    return (
        <>
            <form
                className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
                onSubmit={handleSubmitGrant(onSubmit)}
            >
                <h4 className="h4">grant permissions</h4>
                <input
                    type="hidden"
                    value="grant"
                    {...registerGrant("action")}
                />
                permission to grant:
                {ungrantedPermissions.map((permission) => (
                    <div key={permission}>
                        <input
                            type="radio"
                            id={`grant-permission-${permission}`}
                            value={permission}
                            {...registerGrant("permission", { required: true })}
                        />
                        <label htmlFor={`permission-${permission}`}>
                            {permission}
                        </label>
                    </div>
                ))}
                reason for granting permission:
                <textarea {...registerGrant("reason", { required: true })} />
                <Button
                    type="submit"
                    buttonStyle="pill"
                    color="cherry"
                    className="w-fit"
                >
                    grant permission
                </Button>
            </form>
            <form
                className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
                onSubmit={handleSubmitRevoke(onSubmit)}
            >
                <h4 className="h4">revoke permissions</h4>
                <input
                    type="hidden"
                    value="revoke"
                    {...registerRevoke("action")}
                />
                permission to revoke:
                {permissions.map((permission) => (
                    <div key={permission}>
                        <input
                            type="radio"
                            id={`revoke-permission-${permission}`}
                            value={permission}
                            {...registerRevoke("permission", {
                                required: true,
                            })}
                        />
                        <label htmlFor={`permission-${permission}`}>
                            {permission}
                        </label>
                    </div>
                ))}
                reason for revoking permission:
                <textarea {...registerRevoke("reason", { required: true })} />
                <Button
                    type="submit"
                    buttonStyle="pill"
                    color="cherry"
                    className="w-fit"
                >
                    revoke permission
                </Button>
            </form>
        </>
    );
};
