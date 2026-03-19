import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import { AuthnButton } from "../partials/authn-button";
import { ProjectCard } from "../partials/project-card";
import { SidebarMenu } from "../sidebar-menu";

type ProjectListPageProps = {
    projects: WireProjectModel[];
    headerLabel: string;
    emptyLabel: string;
    loadMore?: () => void;
    isLastPage?: boolean;
};

export const ProjectListPage: FunctionComponent<ProjectListPageProps> = ({
    projects,
    headerLabel,
    emptyLabel,
    loadMore,
    isLastPage,
}) => {
    return (
        <div className="container mx-auto mb-16 mt-16 grid w-full grid-cols-1 gap-16 lg:grid-cols-4">
            <SidebarMenu />
            <div
                // FIXME: theme forced to light here because we haven't rethemed the rest of the site yet
                data-theme="light"
                className="co-themed-box cohost-shadow-light dark:cohost-shadow-dark col-span-2 mx-auto w-full max-w-prose rounded-lg bg-notWhite p-3 text-notBlack"
            >
                <h1 className="text-2xl font-bold">{headerLabel}</h1>
                <div className="mt-6 flex flex-col gap-4">
                    {projects.length ? (
                        projects.map((project) => (
                            <ProjectCard
                                key={project.projectId}
                                project={project}
                            />
                        ))
                    ) : (
                        <p>{emptyLabel}</p>
                    )}
                </div>
                {loadMore ? (
                    <AuthnButton
                        disabled={isLastPage}
                        onClick={loadMore}
                        className="mt-8"
                    >
                        load more
                    </AuthnButton>
                ) : null}
            </div>
        </div>
    );
};

export default ProjectListPage;
