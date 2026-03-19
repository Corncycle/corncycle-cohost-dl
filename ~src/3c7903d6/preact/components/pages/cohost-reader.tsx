import sitemap from "@/shared/sitemap";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useCurrentProject } from "../../hooks/data-loaders";
import { useTailwindBreakpoint } from "../../hooks/use-tailwind-breakpoint";
import { useModalPostComposer } from "../modal-post-composer-context";
import CohostReaderFeedPane from "../partials/cohost-reader/feed-pane";
import CohostReaderProjectList from "../partials/cohost-reader/project-list";
import { SidebarMenu } from "../sidebar-menu";

export type ReaderProjectData = {
    project: WireProjectModel;
    pinned: boolean;
};

const CohostReaderPage: FunctionComponent<{ initialTimestamp: number }> = (
    props
) => {
    const currentProject = useCurrentProject();
    const modalPostComposer = useModalPostComposer();
    useEffect(() => {
        if (currentProject) {
            modalPostComposer.setup({
                project: currentProject,
            });
        }
    }, [modalPostComposer, currentProject]);

    const [activeProject, setActiveProject] = useState<
        ReaderProjectData | undefined
    >(undefined);

    const isTwoColumn = useTailwindBreakpoint("lg");

    const activateProject = (data: ReaderProjectData | undefined) => {
        if (data && !isTwoColumn) {
            // can't see the feed pane!  navigate "the hard way"
            document.location = sitemap.public.project
                .mainAppProfile({
                    projectHandle: data.project.handle,
                })
                .toString();
        } else {
            setActiveProject(data);
        }
    };

    return (
        <>
            <Helmet title="following" />
            <div className="styled-scrollbars-light dark:styled-scrollbars-dark container mx-auto flex w-full flex-row [height:calc(100vh-4rem)]">
                <SidebarMenu narrowMode={true} />
                <CohostReaderProjectList
                    activateProject={activateProject}
                    initialTimestamp={props.initialTimestamp}
                />
                {isTwoColumn ? (
                    <CohostReaderFeedPane activeProject={activeProject} />
                ) : null}
            </div>
        </>
    );
};

export default CohostReaderPage;
