import { useCurrentProject } from "@/client/preact/hooks/data-loaders";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import sitemap from "@/shared/sitemap";
import { WireUserModel } from "@/shared/types/wire-models";
import { FunctionComponent, default as React } from "react";
import { Helmet } from "react-helmet-async";
import { InfoBox } from "../elements/info-box";
import { sectionBoxClasses, sectionTitleClasses } from "../settings/shared";
import { ChangeEmailForm } from "../settings/user-settings/change-email-form";
import { ChangePasswordForm } from "../settings/user-settings/change-password-form";
import { CWFiltersForm } from "../settings/user-settings/cw-filters-form";
import { DisplaySettingsForm } from "../settings/user-settings/display-settings-form";
import { InvitesForm } from "../settings/user-settings/invites-form";
import { ModeratorSettingsForm } from "../settings/user-settings/moderator-settings-form";
import { PositionInQueue } from "../settings/user-settings/queue-display";
import { SubscriptionForm } from "../settings/user-settings/subscription-form";
import { TagFiltersForm } from "../settings/user-settings/tag-filters-form";
import { TwoFactorManagementForm } from "../settings/user-settings/two-factor-management";
import { SidebarMenu } from "../sidebar-menu";
import { ChangeSelfProjectForm } from "../settings/user-settings/change-self-project-form";
import { ScheduleForDeleteForm } from "../settings/user-settings/queue-for-delete-form";

type UserSettingsPageProps = {
    user: WireUserModel;
    hasModPermission: boolean;
    modMode: boolean;
};

export const UserSettingsMain: FunctionComponent<UserSettingsPageProps> = ({
    user,
    hasModPermission,
    modMode,
}) => {
    const { activated } = useUserInfo();
    const currentProject = useCurrentProject();
    const handle = currentProject ? currentProject.handle : "(unknown)";

    return (
        <>
            <Helmet title="settings" />
            <div className="container mx-auto mt-16 grid w-full grid-cols-1 gap-16 lg:grid-cols-4">
                <SidebarMenu />

                {/* settings table of contents */}
                <div className="cohost-shadow-light dark:cohost-shadow-dark prose invisible sticky top-32 order-3 mx-auto flex h-min w-full flex-col gap-4 rounded-lg bg-notWhite p-3 text-notBlack lg:visible">
                    <strong>what do you want to do?</strong>
                    <ul>
                        <li>
                            <a href="#cohost-plus">
                                manage my cohost plus subscription
                            </a>
                        </li>
                        <li>
                            <a href="#password-email">
                                change my password or e-mail address
                            </a>
                        </li>
                        <li>
                            <a href="#main-page">change my main page</a>
                        </li>
                        <li>
                            <a href="#post-visibility">
                                change what posts I see
                            </a>
                        </li>
                        <li>
                            <a href="#post-display">
                                change how content inside posts looks
                            </a>
                        </li>
                        <li>
                            <a href="#ui-display">
                                change how other parts of the site look
                            </a>
                        </li>
                        <li>
                            <a href="#invites-activation">
                                check activation queue/invites
                            </a>
                        </li>

                        {hasModPermission ? (
                            <li>
                                <a href="#staff-only">
                                    change staff-only settings
                                </a>
                            </li>
                        ) : null}
                    </ul>
                </div>

                {/* actual settings */}
                <div className="col-span-1 flex w-full flex-col gap-6 lg:col-span-2">
                    <InfoBox
                        level="info"
                        textSize="base"
                        className="not-prose text-notBlack"
                    >
                        you can change settings which apply to all your pages
                        here. some settings are specific to one page; you can
                        also&nbsp;
                        <a
                            href={sitemap.public.project.settings().toString()}
                            className="underline"
                        >
                            edit @{handle}'s per-page settings
                        </a>
                        .
                    </InfoBox>
                    <ChangePasswordForm />
                    <TwoFactorManagementForm />
                    <ChangeEmailForm />
                    <ChangeSelfProjectForm />
                    <CWFiltersForm />
                    <TagFiltersForm />
                    <div className={sectionBoxClasses}>
                        <h4 className={sectionTitleClasses}>silenced posts</h4>
                        <div className="prose">
                            <p>
                                <a
                                    href={sitemap.public
                                        .silencedPosts({})
                                        .toString()}
                                >
                                    manage your silenced posts
                                </a>
                            </p>
                        </div>
                    </div>
                    <DisplaySettingsForm user={user} />
                    <SubscriptionForm />
                    {activated ? <InvitesForm /> : <PositionInQueue />}
                    <ScheduleForDeleteForm />
                    {hasModPermission ? (
                        <ModeratorSettingsForm modMode={modMode} />
                    ) : null}
                </div>
            </div>
        </>
    );
};

UserSettingsMain.displayName = "settings-main/page";
export default UserSettingsMain;
