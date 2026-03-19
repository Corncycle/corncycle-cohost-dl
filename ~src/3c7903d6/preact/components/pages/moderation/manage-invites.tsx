import sitemap from "@/shared/sitemap";
import { WireInviteModel } from "@/shared/types/wire-models";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { DateTime } from "luxon";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/client/preact/components/elements/button";

type ManageInvitesPageProps = {
    activeInvites: WireInviteModel[];
};

export const ManageInvites: FunctionComponent<ManageInvitesPageProps> = ({
    activeInvites,
}) => {
    return (
        <>
            <Helmet title="manage invites" />
            <div className="flex flex-col gap-4 prose-headings:m-0">
                <h1>invite management page</h1>
                <a href={sitemap.public.moderation.home().toString()}>
                    <ChevronLeftIcon className="inline h-6 w-6" />
                    back to moderation home
                </a>

                <form
                    className="flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3"
                    method="post"
                    action={sitemap.public.invites.create().toString()}
                >
                    <h2 className="text-xl">create a new invite</h2>

                    <div className="flex flex-row items-center gap-2">
                        <label htmlFor="nUserActivations">
                            number of user activations
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={999}
                            step={1}
                            defaultValue={1}
                            name="nUserActivations"
                        />
                    </div>
                    <Button type="submit" color="cherry" buttonStyle="pill">
                        create a new invite
                    </Button>
                </form>

                <h2 className="text-xl">active invites</h2>

                <table className="max-w-fit table-auto whitespace-nowrap text-center">
                    <thead className="border-b border-gray">
                        <tr>
                            <th className="p-3" scope="col">
                                invite ID
                            </th>
                            <th scope="col" className="p-3">
                                uses remaining
                            </th>
                            <th scope="col" className="p-3">
                                created at
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeInvites.map((invite) => {
                            const inviteLink = sitemap.public.invites.activate({
                                inviteId: invite.inviteId,
                            });

                            return (
                                <tr
                                    key={invite.inviteId}
                                    className="border-b border-gray"
                                >
                                    <td className="p-3">
                                        <a href={inviteLink.toString()}>
                                            {invite.inviteId}
                                        </a>
                                    </td>
                                    <td className="p-3">
                                        {invite.userActivationsRemaining}
                                    </td>
                                    <td className="p-3">
                                        {DateTime.fromISO(invite.createdAt)
                                            .toUTC()
                                            .toLocaleString({
                                                ...DateTime.DATETIME_MED,
                                                timeZoneName: "short",
                                            })}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

ManageInvites.displayName = "moderation/manage-invites";
export default ManageInvites;
