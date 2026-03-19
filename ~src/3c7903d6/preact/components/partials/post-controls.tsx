import { tw } from "@/client/lib/tw-tagged-literal";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import sitemap from "@/shared/sitemap";
import { PostState } from "@/shared/types/posts";
import { WirePostViewModel } from "@/shared/types/wire-models";
import {
    ArrowRightOnRectangleIcon,
    PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React, { FunctionComponent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { DeletePostButton } from "./delete-post-button";
import { LikePostButton } from "./like-post-button";
import { PublishPostButton } from "./publish-post-button";
import { SharePostButton } from "./share-post-button";

type PostControlsProps = {
    viewModel: WirePostViewModel;
};

export const PostControls: FunctionComponent<PostControlsProps> = ({
    viewModel,
}) => {
    const userInfo = useUserInfo();
    const { t } = useTranslation();

    if (userInfo.loggedIn) {
        const deleteButtonText = t(
            "client:post-controls.delete",
            "delete this post"
        );
        const publishButtonText = t(
            "client:post-controls.publish",
            "publish this post"
        );
        const editButtonText = t("client:post-controls.edit", "edit this post");

        const published = viewModel.state === PostState.Published;

        return (
            <div className="flex items-center justify-end gap-3">
                {viewModel.isEditor ? (
                    <DeletePostButton
                        postId={viewModel.postId}
                        projectHandle={viewModel.postingProject.handle}
                        title={deleteButtonText}
                    />
                ) : null}

                {viewModel.isEditor && !published ? (
                    <PublishPostButton
                        post={viewModel}
                        className={tw`co-action-button h-6 w-6 disabled:cursor-not-allowed`}
                        disabled={!viewModel.canPublish}
                        title={publishButtonText}
                    />
                ) : null}

                {viewModel.isEditor ? (
                    <a
                        href={viewModel.postEditUrl.toString()}
                        className={tw`co-action-button h-6 w-6`}
                        title={editButtonText}
                    >
                        <PencilSquareIcon />
                    </a>
                ) : null}

                {published ? (
                    <>
                        {/* <ChatOutlineIcon className="w-6 h-6 text-notBlack" /> */}
                        {viewModel.canShare === true ? (
                            <SharePostButton post={viewModel} />
                        ) : null}
                        <LikePostButton
                            post={viewModel}
                            baseClasses="w-6 h-6 pointer"
                            likedClasses="text-cherry"
                            unlikedClasses={tw`co-action-button`}
                        />
                    </>
                ) : null}
            </div>
        );
    } else {
        return (
            <div className="flex justify-end gap-3">
                <a
                    href={sitemap.public.login().toString()}
                    className={tw`co-action-button h-6 w-6`}
                >
                    <ArrowRightOnRectangleIcon />
                </a>
            </div>
        );
    }
};

export default PostControls;
