import { trpc } from "@/client/lib/trpc";
import { AccessResult } from "@/shared/types/access-result";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import { InfoBox } from "../elements/info-box";
import ProfileView from "../partials/profile-view";
import { FrequentlyUsedTagsForm } from "../settings/project-settings/frequently-used-tags-form";
import { HandleChangeForm } from "../settings/project-settings/handle-change-form";
import { SilencedAndBlockedForm } from "../settings/project-settings/muted-and-blocked-form";
import { ProjectSettingsForm } from "../settings/project-settings/project-settings-form";
import { ScheduleForDeleteForm } from "../settings/project-settings/queue-for-delete-form";
import { useRequiresLogin } from "../../providers/user-info-provider";

const ProjectSettingsPage: FunctionComponent = () => {
    useRequiresLogin();

    const { data: project } = trpc.projects.currentProject.useQuery(undefined, {
        suspense: true,
    });
    const handle = project ? project.handle : "(unknown)";

    return (
        <div className="container mx-auto flex flex-grow flex-col">
            <Helmet title="page settings" />
            <ProfileView
                project={project!} // we're loading in a suspense so this will always be defined
                canAccessPermissions={{
                    canEdit: AccessResult.Allowed,
                    canInteract: AccessResult.Allowed,
                    canRead: AccessResult.Allowed,
                    canShare: AccessResult.Allowed,
                }}
            >
                <div className="mt-4 flex w-full flex-col gap-6 lg:mt-0">
                    <InfoBox
                        level="info"
                        textSize="base"
                        className="not-prose text-notBlack"
                    >
                        you can change settings which apply to @{handle} here.
                        you can also change settings for other pages you edit by
                        changing the active page in the menu.
                    </InfoBox>
                    <ProjectSettingsForm />
                    <FrequentlyUsedTagsForm />
                    <SilencedAndBlockedForm />
                    <HandleChangeForm />
                    <ScheduleForDeleteForm />
                </div>
            </ProfileView>
        </div>
    );
};

export default ProjectSettingsPage;
