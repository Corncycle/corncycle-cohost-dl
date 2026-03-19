import { ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import React, { Fragment, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentProject } from "../../hooks/data-loaders";
import { useEditedProjects } from "../../hooks/use-edited-projects";
import { ProjectAvatar } from "../partials/project-avatar";
import _ from "lodash";

// a ProjectSwitcher-styled project listbox, but without all the added
// complications of that component (special mobile view, notification counts,
// new/sign out options, etc.)

const ProjectChooserOption: FunctionComponent<{
    project: WireProjectModel;
}> = ({ project }) => {
    return (
        <Listbox.Option
            key={project.projectId}
            value={project}
            className="flex h-10 cursor-pointer flex-row items-center gap-3 px-2 py-1 hover:bg-foreground-100 hover:text-foreground-800 lg:first-of-type:rounded-t-lg lg:last-of-type:rounded-b-lg"
        >
            <ProjectAvatar
                project={project}
                noLink={true}
                className="h-8 w-8"
            />
            <span>@{project.handle}</span>
        </Listbox.Option>
    );
};

type ProjectChooserProps = {
    selectedProjectId: ProjectId;
    onChange: (projectId: ProjectId) => void;
};

export const ProjectChooser: FunctionComponent<ProjectChooserProps> = (
    props
) => {
    const { t } = useTranslation();

    const { projects } = useEditedProjects();
    const selectedProject = _.find(
        projects,
        (project) => project.projectId === props.selectedProjectId
    );

    if (!selectedProject) return null;

    const onChange = (val: WireProjectModel) => {
        props.onChange(val.projectId);
    };

    return (
        <Listbox value={selectedProject} by="projectId" onChange={onChange}>
            <div className="relative">
                <Listbox.Button className="group flex flex-row items-center gap-1">
                    <div className="flex flex-row items-center gap-3 rounded-l-lg px-2 py-1 group-hover:bg-foreground-600 group-hover:text-notWhite ui-open:bg-foreground-700 ui-open:text-notWhite">
                        <ProjectAvatar
                            project={selectedProject}
                            noLink={true}
                            className="h-8 w-8"
                        />
                        <span>@{selectedProject?.handle}</span>
                    </div>
                    <div className="block rounded-r-lg p-2 text-notBlack group-hover:bg-foreground-600 group-hover:text-notWhite ui-open:bg-foreground-700 ui-open:text-notWhite">
                        <ChevronDownIcon className="h-6 w-6 transition-transform ui-open:rotate-180" />
                    </div>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="lg:transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options
                        className={`lg:cohost-shadow-light dark:lg:cohost-shadow-dark
                        fixed bottom-0 right-0 top-16 z-10 max-w-xs divide-y divide-foreground-500
                        !overflow-y-auto truncate bg-foreground text-notWhite !outline-none
                        lg:absolute lg:bottom-auto lg:right-auto lg:top-auto lg:mt-6
                        lg:max-h-[calc(100vh_-_100px)] lg:divide-none lg:rounded-lg lg:bg-notWhite lg:text-notBlack`}
                    >
                        {projects.map((project) => (
                            <ProjectChooserOption
                                project={project}
                                key={project.projectId}
                            />
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};
