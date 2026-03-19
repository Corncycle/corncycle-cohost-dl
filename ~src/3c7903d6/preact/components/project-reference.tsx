import { tw } from "@/client/lib/tw-tagged-literal";
import { ProjectPrivacy } from "@/shared/types/projects";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import React, { FunctionComponent } from "react";
import sitemap from "../../../shared/sitemap";
import { WireProjectModel } from "../../../shared/types/projects";
import {
    ProjectAvatar,
    ProjectAvatarFilteredProject,
} from "./partials/project-avatar";

export interface ProjectReferenceProps {
    project: ProjectAvatarFilteredProject &
        Pick<WireProjectModel, "displayName" | "handle" | "privacy">;
    inline?: boolean;
}

export const ProjectReference: FunctionComponent<ProjectReferenceProps> = ({
    project,
    inline = false,
}) => {
    return (
        <>
            <ProjectAvatar
                project={project}
                noLink={true}
                className={`h-8 w-8 ${inline ? "" : "lg:hidden"} inline-block`}
                hideLock={true}
            />

            {project.displayName ? (
                <a
                    rel="author"
                    href={sitemap.public.project
                        .mainAppProfile({
                            projectHandle: project.handle,
                        })
                        .toString()}
                    className="co-project-display-name max-w-full flex-shrink truncate font-atkinson font-bold hover:underline"
                    title={project.displayName}
                >
                    {project.displayName}
                </a>
            ) : null}
            {project.privacy === ProjectPrivacy.Private ? (
                <LockClosedIcon className="co-project-display-name inline-block h-5 w-5" />
            ) : null}

            <a
                href={sitemap.public.project
                    .mainAppProfile({
                        projectHandle: project.handle,
                    })
                    .toString()}
                className={tw`co-project-handle font-atkinson font-normal hover:underline`}
            >
                @{project.handle}
            </a>
        </>
    );
};
