import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, {
    FunctionComponent,
    Suspense,
    useEffect,
    useRef,
    useState,
} from "react";
import { useUserInfo } from "../providers/user-info-provider";
import type { PostComposerRef } from "./composer/api";
import { IconEgg } from "./icons/text-egg";
import { PostId } from "@/shared/types/ids";
import { useCallback } from "react";
import { trpc } from "@/client/lib/trpc";
import { useDisplayPrefs } from "../hooks/use-display-prefs";
import { Loading } from "./loading";
import sitemap from "@/shared/sitemap";
import { useCurrentProject } from "../hooks/data-loaders";
import { PostComposerContainer } from "./composer/container";
import { t } from "i18next";
import { SimpleNativeModalDialog } from "./elements/simple-modal-dialog";
import {
    ModalPostComposerProps,
    ModalPostComposerContext,
    SetupOpts,
    ActivateOpts,
    useModalPostComposer,
} from "./modal-post-composer-context";
import { useDynamicTheme } from "../hooks/dynamic-theme";

const ModalPostComposerButton: FunctionComponent<{
    hideWhenOpen?: boolean;
}> = ({ hideWhenOpen }) => {
    const { activate, isOpen, close, hasBeenSetup } = useModalPostComposer();
    const { activated } = useUserInfo();
    const currentProject = useCurrentProject();
    const displayPrefs = useDisplayPrefs();

    return activated && hasBeenSetup && currentProject?.handle ? (
        <div className="fixed bottom-4 right-4 z-20">
            {isOpen ? (
                !hideWhenOpen ? (
                    <IconEgg
                        className="cohost-shadow-light dark:cohost-shadow-dark inline-block h-8 cursor-pointer fill-composeButton text-text hover:fill-text hover:text-composeButton"
                        onClick={(e) => {
                            e.preventDefault();
                            close();
                        }}
                    >
                        <XMarkIcon />
                    </IconEgg>
                ) : null
            ) : (
                <a
                    href={sitemap.public.project
                        .composePost({
                            projectHandle: currentProject.handle,
                        })
                        .toString()}
                    onClick={(e) => {
                        console.log(displayPrefs);
                        if (displayPrefs.disableModalPostComposer) {
                            return;
                        }
                        e.preventDefault();
                        activate({});
                    }}
                >
                    <IconEgg className="cohost-shadow-light dark:cohost-shadow-dark inline-block h-8 cursor-pointer fill-composeButton text-text hover:fill-text hover:text-composeButton">
                        <PencilIcon />
                    </IconEgg>
                </a>
            )}
        </div>
    ) : null;
};

export const ModalPostComposer: FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => {
    const theme = useDynamicTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenSetup, setHasBeenSetup] = useState(false);
    const { activated } = useUserInfo();
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const onClose = useCallback(() => {
        const attemptClose = composerRef.current?.attemptClose();
        if (attemptClose === true) {
            close();
            return;
        }
        setShowDiscardWarning(true);
    }, [close]);

    const composerRef = useRef<PostComposerRef | null>(null);
    const providedOnPost = useRef<
        ((postId: PostId | undefined) => void) | null
    >(null);

    const [props, setProps] = useState<ModalPostComposerProps | null>(null);
    const postComposerSettings = trpc.posts.postComposerSettings.useQuery(
        {},
        {
            enabled: activated,
            suspense: true,
        }
    );

    const setup = useCallback(
        (props: SetupOpts) => {
            if (hasBeenSetup) {
                return;
            }
            setProps({
                cws: postComposerSettings.data?.defaultCws ?? [],
                initialAdultContent:
                    postComposerSettings.data?.defaultAdultContent ?? false,
                tags: postComposerSettings.data?.defaultTags ?? [],
                initialPost: undefined,
                isModal: true,
                onClose: close,
                shareOf: undefined,
                project: props.project,
                finishedRedirect: (postId) => {
                    close();

                    if (providedOnPost.current) {
                        providedOnPost.current(postId);
                    }
                },
            });
            setHasBeenSetup(true);
        },
        [close, hasBeenSetup, postComposerSettings.data]
    );
    const activate = useCallback(
        (opts: ActivateOpts) => {
            if (!props) {
                console.error("ModalPostComposer: setup hasn't been run");
                return;
            }

            const workingProps = { ...props };
            workingProps.shareOf = opts.shareOf;
            workingProps.responseToAskId = opts.responseToAskId;

            providedOnPost.current = opts.onPost ?? null;

            setProps(workingProps);

            setIsOpen(true);
        },
        [props]
    );

    const [dialogRef, setDialogRef] = useState<HTMLDialogElement | null>(null);

    useEffect(() => {
        if (isOpen && dialogRef?.open !== true) {
            dialogRef?.showModal();
        } else if (!isOpen && dialogRef?.open === true) {
            dialogRef?.close();
        }
    }, [dialogRef, isOpen]);

    const [showDiscardWarning, setShowDiscardWarning] = useState(false);

    const onDialogClick: React.MouseEventHandler = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <ModalPostComposerContext.Provider
            value={{
                setup,
                isOpen,
                activate,
                close,
                hasBeenSetup,
            }}
        >
            {children}
            {activated ? (
                <>
                    <ModalPostComposerButton hideWhenOpen />
                    {/* necessary to prevent errors here. click handler on the dialog is how we get backdrop click events, which we need for closing the dialog. */}
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
                    <dialog
                        ref={setDialogRef}
                        className="co-themed-box h-auto max-h-screen max-w-full flex-col items-start justify-stretch gap-6 bg-transparent px-0 py-12 text-inherit backdrop:bg-notBlack/90 open:flex lg:px-6"
                        onClick={onDialogClick}
                        //@ts-expect-error it's real, don't believe their lies
                        onCancel={(e: Event) => {
                            e.preventDefault();
                            onClose();
                        }}
                        data-theme={theme.current}
                    >
                        {props ? (
                            <Suspense
                                fallback={
                                    <Loading className="text-xl text-notWhite" />
                                }
                            >
                                {/* fully remove from the tree to get an effective reset on close */}
                                {isOpen ? (
                                    <PostComposerContainer
                                        {...props}
                                        isModal
                                        onClose={onClose}
                                    />
                                ) : null}
                            </Suspense>
                        ) : null}
                    </dialog>
                    <DiscardPostDialog
                        onDiscard={() => {
                            setShowDiscardWarning(false);
                            close();
                        }}
                        onCancel={() => {
                            setShowDiscardWarning(false);
                        }}
                        isOpen={showDiscardWarning}
                    />
                </>
            ) : null}
        </ModalPostComposerContext.Provider>
    );
};

const DiscardPostDialog: FunctionComponent<{
    onDiscard: () => void;
    onCancel: () => void;
    isOpen: boolean;
}> = ({ onDiscard, onCancel, isOpen }) => {
    return (
        <SimpleNativeModalDialog
            isOpen={isOpen}
            title={t(
                "client:post-composer.discard-title",
                "Discard this post?"
            )}
            body={t(
                "client:post-composer.discard-body",
                "Are you sure you want to discard this post? This cannot be undone."
            )}
            confirm={{
                label: t("client:post-composer.discard-button", "discard"),
                color: "destructive",
            }}
            cancel={{
                label: t(
                    "client:post-composer.discard-cancel-button",
                    "keep working on it"
                ),
            }}
            onConfirm={() => onDiscard()}
            onCancel={() => onCancel()}
        />
    );
};
