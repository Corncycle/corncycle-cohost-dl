import { AccessResult } from "@/shared/types/access-result";
import { PostId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent } from "react";
import ProfileView from "../partials/profile-view";
import { SinglePostFeed } from "../partials/project-page/single-post-feed";

type SinglePostViewProps = {
    project: WireProjectModel;
    postId: PostId;
    nonce?: string;
};

export const SinglePostView: FunctionComponent<SinglePostViewProps> = ({
    project,
    postId,
    nonce,
}) => {
    return (
        <div className="container mx-auto flex flex-grow flex-col">
            <ProfileView
                project={project}
                canAccessPermissions={{
                    // these get overwritten by the post view model's access
                    // flags, so don't worry if they're less restrictive than
                    // they look like they should be
                    canRead: AccessResult.Allowed,
                    canEdit: AccessResult.NotAllowed,
                    canShare: AccessResult.Allowed,
                    canInteract: AccessResult.Allowed,
                }}
            >
                <SinglePostFeed
                    postId={postId}
                    nonce={nonce}
                    handle={project.handle}
                />
            </ProfileView>
        </div>
    );
};

export default SinglePostView;
SinglePostView.displayName = "single-post-view";
