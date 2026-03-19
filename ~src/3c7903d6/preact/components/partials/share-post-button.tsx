import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap from "@/shared/sitemap";
import { WirePostViewModel } from "@/shared/types/wire-models";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentProject } from "../../hooks/data-loaders";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { useUserInfo } from "../../providers/user-info-provider";
import { useModalPostComposer } from "../modal-post-composer-context";

export const SharePostButton: FunctionComponent<{
    post: WirePostViewModel;
}> = ({ post }) => {
    const currentProject = useCurrentProject();
    const { t } = useTranslation();
    const quickSharePost = trpc.posts.quickShare.useMutation();
    const utils = trpc.useContext();
    const displayPrefs = useDisplayPrefs();
    const { activated } = useUserInfo();

    const modalPostComposer = useModalPostComposer();

    const onClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
        (e) => {
            if (!e.shiftKey) {
                if (displayPrefs.disableModalPostComposer) {
                    // user wants this to be a link
                    return;
                }
                if (!activated) {
                    // FIXME: the modal post composer doesn't support unactivated
                    // users, and just doesn't show up if you're unactivated.  for
                    // now, just redirect them to the post composer on its own page.
                    return;
                }
                if (e.ctrlKey || e.metaKey || e.button === 3) {
                    // ctrl/cmd/middle click: user wants this to open in a new
                    // tab, treat it as a link.
                    return;
                }
                console.log(modalPostComposer.hasBeenSetup, "hasBeenSetup");
                if (modalPostComposer.hasBeenSetup) {
                    // shift key not held down, check if we can pop a modal and
                    // if so Do It.
                    e.preventDefault();
                    // preload data so the modal can open instantly
                    utils.posts.singlePost.setData(
                        {
                            postId: post.postId,
                            handle: post.postingProject.handle,
                            skipComments: true,
                        },
                        {
                            comments: {},
                            post,
                        }
                    );
                    modalPostComposer.activate({
                        shareOf: {
                            postId: post.postId,
                            handle: post.postingProject.handle,
                        },
                    });
                }
                // can't pop a modal, just let the link do its thing.
                return;
            }

            e.preventDefault();

            quickSharePost
                .mutateAsync({ shareOfPostId: post.postId })
                .then((resp) => console.log("done!", resp.newPostId))
                .catch((err) => console.error(err));
        },
        [
            displayPrefs.disableModalPostComposer,
            modalPostComposer,
            post,
            quickSharePost,
            utils.posts.singlePost,
        ]
    );

    if (!currentProject?.handle) {
        return null;
    }

    return (
        <a
            onClick={onClick}
            href={sitemap.public.project
                .composePost({
                    projectHandle: currentProject.handle,
                    shareOfPostId: post.postId,
                })
                .toString()}
            title={t(
                "server:post-controls.share",
                "share this post as {{ activeProjectHandle }}",
                { activeProjectHandle: currentProject.handle }
            )}
        >
            <ArrowPathIcon
                className={`h-6 w-6 ${
                    quickSharePost.isSuccess
                        ? "text-green"
                        : quickSharePost.isError
                        ? "text-red"
                        : tw`co-action-button`
                } ${
                    quickSharePost.isLoading
                        ? "motion-safe:animate-spin motion-reduce:animate-pulse"
                        : ""
                }`}
            />
        </a>
    );
};
