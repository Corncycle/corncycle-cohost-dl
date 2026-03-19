import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import { SimpleModalDialog } from "@/client/preact/components/elements/simple-modal-dialog";
import { PostId, ProjectHandle } from "@/shared/types/ids";
import { TrashIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

type DeletePostButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    postId: PostId;
    projectHandle: ProjectHandle;
};

// HACK: this is probably complex enough that we should be using a state machine
// for it, but colin didn't want to completely rewrite it under time pressure to
// fix a bug
export const DeletePostButton: FunctionComponent<DeletePostButtonProps> = ({
    projectHandle,
    postId,
    ...props
}) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isFinishedOpen, setIsFinishedOpen] = useState(false);
    const [error, setError] = useState("");
    const mutation = trpc.posts.delete.useMutation();

    async function deletePost() {
        try {
            await mutation.mutateAsync({
                projectHandle,
                postId,
            });

            setError("");
            setIsFinishedOpen(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsConfirmOpen(false);
        }
    }

    const { t } = useTranslation();

    return (
        <>
            <SimpleModalDialog
                isOpen={isConfirmOpen}
                title={t(
                    "client:delete-post.confirm-title",
                    "Delete this post"
                )}
                body={t(
                    "client:delete-post.confirm-message",
                    "Are you sure you want to delete this post? This cannot be undone."
                )}
                confirm={{
                    label: t("common:delete"),
                    color: "destructive",
                }}
                cancel={{
                    label: t("common:cancel"),
                }}
                onConfirm={deletePost}
                onCancel={() => setIsConfirmOpen(false)}
            />
            <SimpleModalDialog
                isOpen={isFinishedOpen}
                title={t(
                    "client:delete-post.finished-title",
                    "Post deleted successfully"
                )}
                body={t(
                    "client:delete-post.finished-message",
                    "(You may need to manually reload for it to disappear from your screen.)"
                )}
                cancel={{
                    label: t("common:close", "close"),
                }}
                confirm={{
                    label: t("common:reload", "reload"),
                }}
                onConfirm={() => location.reload()}
                onCancel={() => setIsFinishedOpen(false)}
            />
            <SimpleModalDialog
                isOpen={error !== ""}
                body={t("client:delete-post.error-message", {
                    defaultValue: "Error deleting post: {{error}}",
                    error,
                })}
                cancel={{
                    label: t("common:cancel", "cancel"),
                }}
                confirm={{
                    label: t("common:retry", "retry"),
                }}
                onConfirm={deletePost}
                onCancel={() => setError("")}
            />
            <button
                onClick={() => {
                    setIsConfirmOpen(true);
                }}
                {...props}
            >
                <TrashIcon className={tw`co-action-button h-6 w-6`} />
            </button>
        </>
    );
};
