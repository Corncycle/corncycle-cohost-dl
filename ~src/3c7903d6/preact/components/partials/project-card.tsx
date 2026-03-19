import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import { ProjectReference } from "../project-reference";
import { FollowButton } from "./follow-button";
import { FollowRequestButtons } from "./follow-request-buttons";
import { ProjectAvatar } from "./project-avatar";

type ProjectCardProps = {
    project: WireProjectModel;
    isFollowRequest?: boolean;
};

export const ProjectCard: FunctionComponent<ProjectCardProps> = ({
    project,
    isFollowRequest = false,
}) => {
    return (
        <div className="flex flex-row items-center gap-1">
            <ProjectAvatar project={project} />
            <div className="min-w-0 flex-shrink justify-center gap-0 lg:flex-row">
                <div className="items-left flex flex-shrink flex-row gap-1 lg:flex-col">
                    <ProjectReference project={project} />
                </div>
                <p>{project.dek}</p>
            </div>
            <div className="flex-grow" />
            {isFollowRequest ? (
                <FollowRequestButtons requester={project} />
            ) : (
                <FollowButton project={project} color="cherry" />
            )}
        </div>
    );
};
