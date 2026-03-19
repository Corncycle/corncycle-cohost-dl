import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { WireProjectModel } from "@/shared/types/projects";
import { Listbox, Transition } from "@headlessui/react";
import {
    ArrowRightOnRectangleIcon,
    DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import React, { Fragment, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
    useCurrentProject,
    useFollowRequestCount,
    useNotificationCount,
    useUnreadAskCount,
} from "../hooks/data-loaders";
import { useDisplayPrefs } from "../hooks/use-display-prefs";
import { useEditedProjects } from "../hooks/use-edited-projects";
import { TextEgg } from "./icons/text-egg";
import { ProjectAvatar } from "./partials/project-avatar";

type SENTINEL_VALUE = "new" | "sign_out";

type CombinedType =
    | WireProjectModel
    | {
          projectId: SENTINEL_VALUE;
      };

const ProjectSwitcherOption: FunctionComponent<{
    project: WireProjectModel;
}> = ({ project }) => {
    const { enableNotificationCount } = useDisplayPrefs();
    const notificationCount = useNotificationCount({
        projectHandle: project.handle,
    });
    const followReqCount = useFollowRequestCount({
        projectHandle: project.handle,
    });
    const unreadAskCount = useUnreadAskCount({
        projectHandle: project.handle,
    });

    const totalCount =
        notificationCount.count + followReqCount.count + unreadAskCount.count;

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
            {totalCount ? (
                <TextEgg className="ml-auto h-6 fill-sidebarAccent text-sidebarBg">
                    {enableNotificationCount
                        ? totalCount > 99
                            ? "99+"
                            : totalCount
                        : ""}
                </TextEgg>
            ) : null}
        </Listbox.Option>
    );
};

export const ProjectSwitcher: FunctionComponent = () => {
    const { t } = useTranslation();

    const { projects } = useEditedProjects();
    const currentProject = useCurrentProject();
    const switchProject = trpc.projects.switchProject.useMutation();
    const logout = trpc.login.logout.useMutation();

    if (!currentProject) return null;

    const onChange = async (val: CombinedType) => {
        if (val.projectId === "new") {
            // the "create a new project" option is handled special
            location.assign(sitemap.public.createProject());
        } else if (val.projectId === "sign_out") {
            // sign out!
            await logout.mutateAsync();
            location.assign("/");
        } else {
            await switchProject.mutateAsync({ projectId: val.projectId });
            location.reload();
        }
    };

    return (
        <Listbox value={currentProject} by="projectId" onChange={onChange}>
            <div className="relative">
                <Listbox.Button className="group flex flex-row items-center gap-1">
                    {/* mobile */}
                    <ProjectAvatar
                        project={currentProject}
                        noLink={true}
                        className="h-8 w-8 lg:hidden"
                    />
                    {/* desktop */}
                    <div className="hidden flex-row items-center gap-3 rounded-l-lg px-2 py-1 group-hover:bg-foreground-600 ui-open:bg-foreground-700 lg:flex">
                        <ProjectAvatar
                            project={currentProject}
                            noLink={true}
                            className="h-8 w-8"
                        />
                        <span>@{currentProject?.handle}</span>
                    </div>
                    <div className="hidden rounded-r-lg p-2 text-notWhite group-hover:bg-foreground-600 ui-open:bg-foreground-700 lg:block">
                        <ChevronDownIcon className="h-6 w-6 text-notWhite transition-transform ui-open:rotate-180" />
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
                        fixed bottom-0 right-0 top-16 max-w-xs divide-y divide-foreground-500 !overflow-y-auto
                        truncate bg-foreground text-notWhite !outline-none lg:absolute
                        lg:bottom-auto lg:right-auto lg:top-auto lg:mt-6 lg:max-h-[calc(100vh_-_100px)]
                        lg:divide-none lg:rounded-lg lg:bg-notWhite lg:text-notBlack`}
                    >
                        {projects.map((project) => (
                            <ProjectSwitcherOption
                                project={project}
                                key={project.projectId}
                            />
                        ))}
                        <Listbox.Option
                            key="new"
                            value={{ projectId: "new" }}
                            className="flex h-10 cursor-pointer flex-row items-center gap-3 px-2 py-1 hover:bg-foreground-100 hover:text-foreground-800 lg:first-of-type:rounded-t-lg lg:last-of-type:rounded-b-lg"
                        >
                            <DocumentPlusIcon className="h-6 w-8" />
                            <span>create a new page</span>
                        </Listbox.Option>
                        <Listbox.Option
                            key="sign_out"
                            value={{ projectId: "sign_out" }}
                            className="flex h-10 cursor-pointer flex-row items-center gap-3 px-2 py-1 hover:bg-foreground-100 hover:text-foreground-800 lg:first-of-type:rounded-t-lg lg:last-of-type:rounded-b-lg"
                        >
                            <ArrowRightOnRectangleIcon className="h-6 w-8" />
                            <span>sign out</span>
                        </Listbox.Option>
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};
