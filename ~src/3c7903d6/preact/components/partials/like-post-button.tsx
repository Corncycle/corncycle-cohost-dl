import { trpc } from "@/client/lib/trpc";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import { sitemap } from "@/shared/sitemap";
import { WirePostViewModel } from "@/shared/types/wire-models";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import axios from "axios";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentProject } from "../../hooks/data-loaders";

type LikePostButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    post: WirePostViewModel;
    baseClasses: string;
    unlikedClasses: string;
    likedClasses: string;
};

export const LikePostButton: FunctionComponent<LikePostButtonProps> = ({
    post,
    baseClasses,
    unlikedClasses,
    likedClasses,
}) => {
    const utils = trpc.useContext();
    const { data: isLiked } = trpc.posts.isLiked.useQuery(
        post.transparentShareOfPostId ?? post.postId,
        { initialData: post.isLiked }
    );

    const userInfo = useUserInfo();
    const currentProject = useCurrentProject();
    const { t } = useTranslation();

    const title = isLiked
        ? t(
              "server:post-controls.unlike",
              "unlike this post as {{ activeProjectHandle }}",
              { activeProjectHandle: currentProject?.handle }
          )
        : t(
              "server:post-controls.like",
              "like this post as {{ activeProjectHandle }}",
              { activeProjectHandle: currentProject?.handle }
          );

    const createMutationArgs = () => {
        return {
            onError: async () => {
                await utils.posts.isLiked.invalidate(
                    post.transparentShareOfPostId ?? post.postId
                );
            },
        };
    };
    const likeMutation = trpc.relationships.like.useMutation(
        createMutationArgs()
    );
    const unlikeMutation = trpc.relationships.unlike.useMutation(
        createMutationArgs()
    );
    const likePost = useCallback(async () => {
        if (!userInfo.loggedIn) {
            return;
        }
        // assume it will work, revert if it doesn't
        utils.posts.isLiked.setData(
            post.transparentShareOfPostId ?? post.postId,
            (oldIsLiked) => !oldIsLiked
        );
        if (isLiked) {
            await unlikeMutation.mutateAsync({
                fromProjectId: userInfo.projectId,
                toPostId: post.transparentShareOfPostId ?? post.postId,
            });
        } else {
            await likeMutation.mutateAsync({
                fromProjectId: userInfo.projectId,
                toPostId: post.transparentShareOfPostId ?? post.postId,
            });
        }
    }, [
        userInfo.loggedIn,
        userInfo.projectId,
        utils.posts.isLiked,
        post.transparentShareOfPostId,
        post.postId,
        isLiked,
        likeMutation,
        unlikeMutation,
    ]);

    if (!userInfo.loggedIn) {
        return null;
    }

    return (
        <button
            onClick={likePost}
            className={`${baseClasses} relative`}
            title={title}
        >
            <HeartIconSolid
                className={`${baseClasses} absolute top-0 left-0 ${likedClasses} ${
                    isLiked ? "visible" : "invisible"
                }`}
            />
            <HeartIconOutline
                className={`${baseClasses} absolute top-0 left-0 ${unlikedClasses} ${
                    !isLiked ? "visible" : "invisible"
                }`}
            />
        </button>
    );
};
