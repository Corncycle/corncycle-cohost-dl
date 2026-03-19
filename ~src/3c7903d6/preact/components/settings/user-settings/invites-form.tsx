import { trpc } from "@/client/lib/trpc";
import { useRollbar } from "@/client/preact/providers/rollbar";
import sitemap from "@/shared/sitemap";
import { InviteId } from "@/shared/types/ids";
import React, { FunctionComponent, MouseEventHandler, ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";

export const InvitesForm: FunctionComponent = () => {
    const rollbar = useRollbar();
    const { t } = useTranslation();
    let body: ReactNode;

    const invites = trpc.invites.getActiveInvites.useQuery(undefined, {
        suspense: true,
    });

    if (invites.data?.totalRemainingUses) {
        const copyActivateLinkToClipboard =
            (inviteId: InviteId): MouseEventHandler =>
            (e) => {
                e.preventDefault();

                const activateLink = sitemap.public.invites
                    .activate({ inviteId })
                    .toString();

                navigator.clipboard.writeText(activateLink).catch((_err) => {
                    // this should never happen, since we only do it on user
                    // interaction
                    if (rollbar) {
                        rollbar.error(
                            "invites form doesn't have clipboard permission!"
                        );
                    }
                });
            };

        body = (
            <div id="invites-activation" className="prose">
                <Trans
                    i18nKey="client:invites.youve-got-em"
                    values={{
                        nInvitesAvailable: invites.data.totalRemainingUses,
                    }}
                    count={invites.data.totalRemainingUses}
                >
                    <p>
                        {`you can invite <0>{{nInvitesAvailable}}</0> people to cohost right now.`}
                    </p>

                    <p>
                        if you'd like to invite someone to cohost, you can click
                        any of the links below and we'll copy it to your
                        clipboard. (you can also right click and copy the link
                        directly if you prefer)
                    </p>

                    <p>thanks for spreading the word!</p>
                </Trans>
                <table className="overflow-x-scroll">
                    <thead>
                        <th>invite ID</th>
                        <th>remaining uses</th>
                    </thead>
                    <tbody>
                        {invites.data.invites.map((invite) => (
                            <tr key={invite.inviteId}>
                                <td>
                                    <a
                                        onClick={copyActivateLinkToClipboard(
                                            invite.inviteId
                                        )}
                                        href={sitemap.public.invites
                                            .activate({
                                                inviteId: invite.inviteId,
                                            })
                                            .toString()}
                                    >
                                        {invite.inviteId}
                                    </a>
                                </td>
                                <td>{invite.userActivationsRemaining}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } else {
        body = (
            <div className="prose">
                <p>
                    {t("client:invites.no-invites-yet", {
                        defaultValue: `you don't have any invites available right now. we'll 
                            send more out as we're able to hire additional help to 
                            develop and moderate cohost, and we'll let you know when 
                            we do!`,
                    })}
                </p>
            </div>
        );
    }

    return (
        <div className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>invite people to cohost</h4>

            {body}
        </div>
    );
};
