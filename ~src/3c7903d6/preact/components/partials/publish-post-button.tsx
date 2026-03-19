import sitemap from "@/shared/sitemap";
import { WirePostViewModel } from "@/shared/types/wire-models";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent, useCallback, useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { SimpleModalDialog } from "../elements/simple-modal-dialog";
import { t } from "i18next";

type PublishPostButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    post: WirePostViewModel;
};

export const PublishPostButton: FunctionComponent<PublishPostButtonProps> = ({
    post,
    className,
    ...props
}) => {
    const changePostState = trpc.posts.changePostState.useMutation();
    const publishPost = useCallback(async () => {
        try {
            await changePostState.mutateAsync({
                projectHandle: post.postingProject.handle,
                postId: post.postId,
                operation: "publish",
            });

            location.assign(sitemap.public.home());
        } catch (e) {
            console.error(e);
        }
    }, [changePostState, post.postId, post.postingProject.handle]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    return (
        <>
            <SimpleModalDialog
                isOpen={isConfirmOpen}
                title={t(
                    "client:publish-post.confirm-title",
                    "Publish this draft?"
                )}
                body={t(
                    "client:publish-post.confirm-body",
                    "Are you sure you want to publish this draft?  It will become visible to others."
                )}
                confirm={{
                    label: t("common:publish", "publish"),
                }}
                cancel={{
                    label: t("common:cancel", "cancel"),
                }}
                onConfirm={publishPost}
                onCancel={() => setIsConfirmOpen(false)}
            />
            <button
                onClick={() => setIsConfirmOpen(true)}
                className={`${className ?? ""} relative`}
                {...props}
            >
                <ArrowUpTrayIcon className="absolute left-0 top-0" />
            </button>
        </>
    );
};
