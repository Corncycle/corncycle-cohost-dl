import ProfileView from "@/client/preact/components/partials/profile-view";
import { AccessResult } from "@/shared/types/access-result";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryState } from "../../hooks/use-query-state";
import { ProfileEditForm } from "../partials/profile-edit-form";
import ProfileViewFilterControls from "../partials/profile-view-filter-controls";
import { PaginatedProfilePostFeed } from "../partials/project-page/paginated-profile-post-feed";

type ProjectPageEditorProps = {
    project: WireProjectModel;
};

export const ProjectPageEditor: FunctionComponent<ProjectPageEditorProps> = ({
    project,
}) => {
    const [pendingProject, setPendingProject] =
        useState<WireProjectModel>(project);

    const updatePendingProject = (data: Partial<WireProjectModel>) => {
        setPendingProject({
            ...pendingProject,
            ...data,
        });
    };

    const [hideRepliesString, setHideReplies] = useQueryState(
        "hideReplies",
        false.toString()
    );
    const hideReplies = hideRepliesString === "true";
    const [hideSharesString, setHideShares] = useQueryState(
        "hideShares",
        false.toString()
    );
    const hideShares = hideSharesString === "true";
    const [hideAsksString, setHideAsks] = useQueryState(
        "hideAsks",
        false.toString()
    );
    const hideAsks = hideAsksString === "true";

    return (
        <>
            <Helmet title="edit profile" />
            <main className="grid flex-grow auto-cols-auto grid-flow-col">
                <ProfileEditForm
                    project={project}
                    updatePendingProject={updatePendingProject}
                />
                <div className="container hidden flex-col lg:flex">
                    <ProfileView
                        canAccessPermissions={{
                            canEdit: AccessResult.Allowed,
                            canShare: AccessResult.Allowed,
                            canInteract: AccessResult.Allowed,
                            canRead: AccessResult.Allowed,
                        }}
                        project={pendingProject}
                        previewMode={true}
                    >
                        <ProfileViewFilterControls
                            hideReplies={hideReplies}
                            hideShares={hideShares}
                            hideAsks={hideAsks}
                            setHideReplies={(value) =>
                                setHideReplies(value.toString())
                            }
                            setHideShares={(value) =>
                                setHideShares(value.toString())
                            }
                            setHideAsks={(value) =>
                                setHideAsks(value.toString())
                            }
                        />
                        <PaginatedProfilePostFeed
                            handle={project.handle}
                            pinnedPostsAtTop={true}
                            hideReplies={hideReplies}
                            hideShares={hideShares}
                            hideAsks={hideAsks}
                        />
                    </ProfileView>
                </div>
            </main>
        </>
    );
};

export default ProjectPageEditor;
ProjectPageEditor.displayName = "project-page-editor";
