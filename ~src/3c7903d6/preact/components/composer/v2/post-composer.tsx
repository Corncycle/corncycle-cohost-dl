import { Emoji } from "@/client/lib/emoji";
import { useEditedProjects } from "@/client/preact/hooks/use-edited-projects";
import { sitemap } from "@/shared/sitemap";
import { PostState } from "@/shared/types/posts";
import { WireProjectModel } from "@/shared/types/projects";
import { Listbox, Tab } from "@headlessui/react";
import {
    CheckIcon,
    ChevronDownIcon,
    ExclamationTriangleIcon,
    PaperClipIcon,
    QuestionMarkCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import React, {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { useHasCohostPlus } from "../../../hooks/data-loaders";
import { useDynamicTheme } from "../../../hooks/dynamic-theme";
import useBeforeUnload from "../../../hooks/use-before-unload";
import { SiteConfigProvider } from "../../../providers/site-config-provider";
import { useUserInfo } from "../../../providers/user-info-provider";
import { ErrorBoundary } from "../../error-boundary";
import { FilePicker } from "../../file-selector";
import LazyDnD from "../../lazy-dnd";
import { AuthnButton } from "../../partials/authn-button";
import { ProjectAvatar } from "../../partials/project-avatar";
import { EmojiButton } from "../emoji-button";
import { EditingPanel } from "./editing-panel";
import { PostComposerPreview } from "./preview";

import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import toast from "react-hot-toast";
import { PostComposerProps } from "../api";
import { AttachmentComposerContext } from "./attachment-composer-context";
import {
    abandon,
    initForEditing,
    initForNewPost,
    insertFile,
    insertNewTextAtSelection,
    selectAdultContent,
    selectCreatingTransparentShare,
    selectCwsButtonEnabled,
    selectDirty,
    selectEditingTransparentShare,
    selectErrors,
    selectHasErrors,
    selectHasPosted,
    selectIsEditing,
    selectMaxAttachmentsChosen,
    selectNewPostState,
    selectPostId,
    selectProjectHandle,
    setActiveProject,
    setAdultContent,
    setNewPostState,
    submit,
    toggleCwsInputOpen,
} from "./reducer";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { addAppListener } from "./store";
import { TagRecommendationBox } from "./tag-recommendation-box";
import { InfoBox } from "../../elements/info-box";

export const PostComposer: FunctionComponent<PostComposerProps> =
    React.forwardRef((props, ref) => {
        const {
            initialAdultContent,
            project: initialProject,
            shareOf,
            cws,
            tags,
            initialPost,
        } = props;
        const siteConfig = useContext(SiteConfigProvider);
        const hasCohostPlus = useHasCohostPlus();
        const { activated } = useUserInfo();

        const hasPosted = useAppSelector(selectHasPosted);
        const newPostState = useAppSelector(selectNewPostState);
        const projectHandle = useAppSelector(selectProjectHandle);
        const dirty = useAppSelector(selectDirty);
        const postId = useAppSelector(selectPostId);

        const dispatch = useAppDispatch();

        // FIXME: this is an island of redux code in an ocean of non-redux
        // code.  copy our props into redux at mount time and abandon the state
        // at unmount time.
        useEffect(() => {
            if (initialPost) {
                dispatch(
                    initForEditing({
                        handle: initialProject.handle,
                        isActivated: activated,
                        hasCohostPlus,
                        siteConfig,
                        post: initialPost,
                    })
                );
            } else {
                dispatch(
                    initForNewPost({
                        handle: initialProject.handle,
                        isActivated: activated,
                        hasCohostPlus,
                        siteConfig,
                        shareOf: shareOf ? shareOf.postId : null,
                        responseToAskId: props.responseToAskId ?? null,
                        tags,
                        cws,
                        adultContent: initialAdultContent,
                    })
                );
            }

            return () => {
                dispatch(abandon());
            };
            // we deliberately only run this at mount
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        useBeforeUnload(() => dirty);

        useImperativeHandle(
            ref,
            () => ({
                attemptClose() {
                    return !dirty;
                },
            }),
            [dirty]
        );

        useEffect(() => {
            if (hasPosted) {
                if (typeof props.finishedRedirect === "function") {
                    props.finishedRedirect(postId);
                    return;
                } else if (typeof props.finishedRedirect === "string") {
                    // if we were told somewhere specific to go, go there.
                    location.replace(props.finishedRedirect);
                } else if (newPostState === PostState.Unpublished) {
                    // if it's a draft, go to the drafts page
                    location.replace(sitemap.public.project.unpublishedPosts());
                } else {
                    // otherwise, back to where we came
                    location.replace(document.referrer);
                }
            }
        }, [
            props.finishedRedirect,
            hasPosted,
            newPostState,
            projectHandle,
            props,
            postId,
        ]);

        const postToast = useRef<string>();

        useEffect(() => {
            const unsubscribe = dispatch(
                addAppListener({
                    predicate: (_action, state) => {
                        return (
                            state.postComposer.state === "uploading" ||
                            state.postComposer.state === "finished" ||
                            state.postComposer.state === "failed"
                        );
                    },
                    effect: (action, listenerApi) => {
                        const state = listenerApi.getState();

                        if (
                            state.postComposer.state === "uploading" &&
                            !postToast.current
                        ) {
                            let message: string | undefined = undefined;

                            switch (newPostState) {
                                case PostState.Published:
                                    message = "Posting...";
                                    break;
                                case PostState.Unpublished:
                                    message = "Saving...";
                                    break;
                                default:
                                    break;
                            }

                            if (message) {
                                postToast.current = toast.loading(message);
                            }
                        }

                        if (state.postComposer.state === "finished") {
                            // depending on whether newPostState is Published or
                            // Unpublished, this post is now posted or saved as a draft
                            let message: string | undefined = undefined;

                            switch (newPostState) {
                                case PostState.Published:
                                    message = "Posted!";
                                    break;
                                case PostState.Unpublished:
                                    message = "Draft saved!";
                                    break;
                                default:
                                    break;
                            }

                            if (message) {
                                toast.success(message, {
                                    id: postToast.current,
                                });
                            }
                        }

                        if (state.postComposer.state === "failed") {
                            let message: string | undefined = undefined;

                            switch (newPostState) {
                                case PostState.Published:
                                    message = "Couldn't post :(";
                                    break;
                                case PostState.Unpublished:
                                    message = "Couldn't save :(";
                                    break;
                                default:
                                    break;
                            }

                            if (message) {
                                toast.error(message, {
                                    id: postToast.current,
                                });
                            }
                        }
                    },
                })
            );

            return () => {
                unsubscribe();
                postToast.current = undefined;
            };
        }, [newPostState]);

        const attachmentComposerRef = useRef(null);

        return activated ? (
            <AttachmentComposerContext.Provider value={attachmentComposerRef}>
                <PostComposerInner
                    project={initialProject}
                    isModal={props.isModal}
                    onClose={props.onClose}
                />
            </AttachmentComposerContext.Provider>
        ) : (
            <UnactivatedPostComposer isModal={props.isModal} />
        );
    });
PostComposer.displayName = "PostComposer";

const UnactivatedPostComposer: FunctionComponent<{ isModal?: boolean }> =
    React.memo(({ isModal = false }) => {
        const { t } = useTranslation();

        const dispatch = useAppDispatch();
        const isEditing = useAppSelector(selectIsEditing);

        return (
            <div className="cohost-shadow-light dark:cohost-shadow-dark prose mx-auto w-full max-w-full rounded-lg bg-notWhite p-3">
                <p>
                    Since your account isn't activated yet, you can share this
                    post but can't add anything to it. You can read more about
                    this on{" "}
                    <a
                        href="https://help.antisoftware.club/support/solutions/articles/62000224749-details-on-invites-and-the-restrictions-on-un-activated-accounts/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        our support site.
                    </a>
                </p>
                <AuthnButton
                    as="button"
                    onClick={() => dispatch(submit())}
                    disabled={!isEditing}
                >
                    share post
                </AuthnButton>
            </div>
        );
    });
UnactivatedPostComposer.displayName = "UnactivatedPostComposer";

const PostComposerInner: FunctionComponent<{
    project: WireProjectModel;
    isModal?: boolean;
    onClose?: () => void;
}> = React.memo(({ project: initialProject, isModal = false, onClose }) => {
    const { t } = useTranslation();

    const hasCohostPlus = useHasCohostPlus();

    const { projects } = useEditedProjects();
    const dispatch = useAppDispatch();
    const hasErrors = useAppSelector(selectHasErrors);
    const errors = useAppSelector(selectErrors);
    const isEditing = useAppSelector(selectIsEditing);
    const canCollapseCws = useAppSelector(selectCwsButtonEnabled);
    const maxAttachmentsChosen = useAppSelector(selectMaxAttachmentsChosen);
    const newPostState = useAppSelector(selectNewPostState);
    const projectHandle = useAppSelector(selectProjectHandle);
    const adultContent = useAppSelector(selectAdultContent);
    const isTransparentShare = useAppSelector(selectCreatingTransparentShare);
    const editingTransparentShare = useAppSelector(
        selectEditingTransparentShare
    );

    const currentProject = useMemo<WireProjectModel>(() => {
        const project = projects.find(
            (project) => project.handle === projectHandle
        );
        if (project) {
            return project;
        }
        return initialProject;
    }, [projectHandle, projects, initialProject]);
    const pinnedTags = currentProject.frequentlyUsedTags;
    const recentlyUsedTags = trpc.projects.listRecentlyUsedTags.useQuery({
        projectId: currentProject.projectId,
    });

    const toggleEditingCws = useCallback(() => {
        dispatch(toggleCwsInputOpen());
    }, [dispatch]);

    const onChangeNewPostState = useCallback(
        (newPostState: PostState) => {
            dispatch(setNewPostState(newPostState));
        },
        [dispatch]
    );

    const postStates = [
        {
            postState: PostState.Published,
            string: t("client:post-editor.post-now", "post now"),
        },
        {
            postState: PostState.Unpublished,
            string: t("client:post-editor.save-as-draft", "save draft"),
        },
    ];

    const dynamicTheme = useDynamicTheme();

    const onSelectEmoji = useCallback(
        (emoji: Emoji) => {
            dispatch(
                insertNewTextAtSelection(emoji.native ?? emoji.shortcodes!)
            );
        },
        [dispatch]
    );

    const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLElement>>(
        (ev) => {
            if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") {
                ev.preventDefault();
                void dispatch(submit());
            }
        },
        [dispatch]
    );

    return (
        // intentionally ignoring this one; just adding a keyboard shortcut for
        // submitting comments, which is accessible in other ways
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onKeyDown={onKeyDown}>
            <ErrorBoundary>
                <div className="mb-6 lg:pl-[5.5rem]">
                    <InfoBox
                        level="post-box-info"
                        className="max-w-prose"
                        // even though we reset back down to small immediately,
                        // we need this for the 65ch calculation for max-width
                        // to be the same as the section below.
                        textSize="base"
                    >
                        <div className="co-prose prose prose-sm">
                            <h4>welcome to the new post editor!</h4>
                            <p>
                                the new editor lets you drag and drop images and
                                audio attachments around to arrange your post
                                however you want without needing to use HTML!
                            </p>
                            <p>
                                it's currently in beta, so please let us know if
                                you run into any issues. if you'd like to turn
                                it off, you can do it under the "preview
                                features" section in{" "}
                                <a
                                    href={sitemap.public
                                        .userSettings()
                                        .toString()}
                                >
                                    your settings
                                </a>
                                .
                            </p>
                        </div>
                    </InfoBox>
                </div>
                {hasErrors ? (
                    <div className="mx-auto mb-6 max-w-lg border-2 border-red-700 bg-red-300 p-3 text-notBlack">
                        <h1 className="text-lg font-bold">
                            {t(
                                "client:post-editor.validation-errors",
                                "There were some errors:"
                            )}
                        </h1>
                        <ul className="list-inside list-disc">
                            {errors.map((error) => (
                                <li key={error}>{t(error)}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
                <div className="flex flex-row justify-center gap-6">
                    <ProjectAvatar project={currentProject} noLink={true} />
                    <div className="flex flex-1 flex-col gap-4">
                        {/* we use `w-screen` here to force the box to use
                                as much space as possible, fixing the issue where
                                it resizes while typing. `max-w-prose` prevents
                                it from overflowing. */}
                        <article
                            className="co-themed-box co-post-box co-post-composer"
                            data-theme={dynamicTheme.current}
                        >
                            <header className="co-thread-header">
                                <div className="flex flex-row items-center gap-2">
                                    <ProjectAvatar
                                        project={currentProject}
                                        hideLock={true}
                                        className="h-8 w-8 lg:hidden"
                                        noLink={true}
                                    />
                                    <span
                                        className={tw`co-ui-text relative font-atkinson font-bold`}
                                    >
                                        <Listbox
                                            value={currentProject.handle}
                                            onChange={(projectHandle) => {
                                                dispatch(
                                                    setActiveProject(
                                                        projectHandle
                                                    )
                                                );
                                            }}
                                        >
                                            <Listbox.Button className="font-atkinson font-bold">
                                                {({
                                                    open,
                                                }: {
                                                    open: boolean;
                                                }) => (
                                                    <>
                                                        {currentProject.handle}{" "}
                                                        <ChevronDownIcon
                                                            className={`inline-block h-4 w-4 transition-transform ${
                                                                open
                                                                    ? "rotate-180"
                                                                    : "rotate-0"
                                                            }`}
                                                        />
                                                    </>
                                                )}
                                            </Listbox.Button>
                                            <Listbox.Options className="cohost-shadow-light absolute left-0 top-full z-10 mt-1 flex min-w-max flex-col divide-y divide-foreground-400 rounded-lg font-normal leading-none text-notWhite">
                                                {projects.map((project) => (
                                                    <Listbox.Option
                                                        key={project.handle}
                                                        value={project.handle}
                                                        className={`relative cursor-default select-none bg-foreground py-2 pl-8 pr-2 first:rounded-t-lg last:rounded-b-lg hover:bg-foreground-600`}
                                                    >
                                                        {({
                                                            selected,
                                                        }: {
                                                            selected: boolean;
                                                        }) => (
                                                            <>
                                                                <span className="block">
                                                                    {
                                                                        project.handle
                                                                    }
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                                                                        <CheckIcon className="h-4 w-4" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Listbox>
                                    </span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <label className="flex flex-row items-center gap-2">
                                        <span
                                            className={tw`co-ui-text select-none`}
                                        >
                                            {t(
                                                "client:post-editor.adult-content",
                                                "18+ content?"
                                            )}
                                        </span>
                                        <input
                                            type="checkbox"
                                            name="adultContent"
                                            className={tw`rounded border-2 disabled:cursor-not-allowed`}
                                            // visually display false if
                                            // it's a transparent share,
                                            // since it will be processed in
                                            // that direction on the server.
                                            checked={
                                                !isTransparentShare &&
                                                adultContent
                                            }
                                            onChange={(e) =>
                                                dispatch(
                                                    setAdultContent(
                                                        e.currentTarget.checked
                                                    )
                                                )
                                            }
                                            disabled={
                                                isTransparentShare || !isEditing
                                            }
                                        />
                                    </label>
                                    {isModal ? (
                                        <XMarkIcon
                                            className={tw`co-link-button h-6 w-6 cursor-pointer`}
                                            onClick={onClose}
                                        />
                                    ) : null}

                                    {/* <EllipsisHorizontalIcon className="h-6 w-6 text-notBlack" /> */}
                                </div>
                            </header>
                            <hr className="co-hairline" />
                            <Tab.Group>
                                <Tab.Panels>
                                    <Tab.Panel unmount={false}>
                                        <EditingPanel />
                                    </Tab.Panel>
                                    <Tab.Panel>
                                        <PostComposerPreview />
                                    </Tab.Panel>
                                </Tab.Panels>
                                <hr className="co-hairline" />
                                <footer
                                    className={tw`co-thread-footer w-full max-w-full rounded-b-lg p-3`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <FilePicker
                                                onFilesPicked={(files) =>
                                                    dispatch(
                                                        insertFile({
                                                            file: files[0],
                                                            atPosition: -1,
                                                        })
                                                    )
                                                }
                                            >
                                                <button
                                                    disabled={
                                                        !isEditing ||
                                                        maxAttachmentsChosen ||
                                                        editingTransparentShare
                                                    }
                                                    className={tw`co-link-button disabled:cursor-not-allowed`}
                                                    title="attach images or audio"
                                                >
                                                    <PaperClipIcon className="inline-block h-6" />
                                                </button>
                                            </FilePicker>
                                            <button
                                                disabled={
                                                    isTransparentShare ||
                                                    !isEditing ||
                                                    !canCollapseCws
                                                }
                                                onClick={toggleEditingCws}
                                                className={tw`co-link-button disabled:cursor-not-allowed`}
                                                title="add a content warning"
                                            >
                                                <ExclamationTriangleIcon className="inline-block h-6" />
                                            </button>

                                            <EmojiButton
                                                onSelectEmoji={onSelectEmoji}
                                                disabled={!isEditing}
                                                hasCohostPlus={!!hasCohostPlus}
                                            />
                                            {/* markdown button */}
                                            <a
                                                href={sitemap.public
                                                    .staticContent({
                                                        slug: "markdown-reference",
                                                    })
                                                    .toString()}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={tw`co-link-button`}
                                                title="markdown reference"
                                            >
                                                <QuestionMarkCircleIcon className="inline-block h-6" />
                                            </a>
                                        </div>
                                        <Tab.List
                                            className={tw`co-tab-bar flex items-center rounded-lg text-sm leading-none`}
                                        >
                                            <Tab
                                                className={({ selected }) =>
                                                    selected
                                                        ? tw`co-tab-bar co-active rounded-lg px-2 py-2 md:px-3`
                                                        : `px-2 py-2 md:px-3`
                                                }
                                            >
                                                {t(
                                                    "client:post-editor.compose-tab",
                                                    "compose"
                                                )}
                                            </Tab>
                                            <Tab
                                                className={({ selected }) =>
                                                    selected
                                                        ? tw`co-tab-bar co-active rounded-lg px-2 py-2 md:px-3`
                                                        : `px-2 py-2 md:px-3`
                                                }
                                            >
                                                {t(
                                                    "client:post-editor.preview-tab",
                                                    "preview"
                                                )}
                                            </Tab>
                                        </Tab.List>
                                        <div className="relative inline-flex items-stretch rounded-lg text-sm text-text">
                                            <button
                                                className={tw`co-filled-button rounded-l-lg border-r border-r-gray-500 py-2 pl-2 pr-1 leading-none`}
                                                onClick={() =>
                                                    dispatch(submit())
                                                }
                                            >
                                                {newPostState ===
                                                PostState.Published
                                                    ? t(
                                                          "client:post-editor.post-now",
                                                          "post now"
                                                      )
                                                    : newPostState ===
                                                      PostState.Unpublished
                                                    ? t(
                                                          "client:post-editor.save-as-draft",
                                                          "save draft"
                                                      )
                                                    : null}
                                            </button>
                                            <Listbox
                                                value={newPostState}
                                                onChange={onChangeNewPostState}
                                            >
                                                <Listbox.Button>
                                                    {({
                                                        open,
                                                    }: {
                                                        open: boolean;
                                                    }) => (
                                                        <div
                                                            className={tw`co-filled-button rounded-r-lg py-2 pl-1 pr-2 leading-none`}
                                                        >
                                                            <ChevronDownIcon
                                                                className={`inline-block h-4 w-4 transition-transform ${
                                                                    open
                                                                        ? "rotate-180"
                                                                        : "rotate-0"
                                                                }`}
                                                            />
                                                        </div>
                                                    )}
                                                </Listbox.Button>
                                                <Listbox.Options className="cohost-shadow-light absolute right-0 top-full mt-1 flex min-w-max flex-col divide-y divide-foreground-400 rounded-lg leading-none">
                                                    {postStates.map(
                                                        ({
                                                            postState,
                                                            string,
                                                        }) => (
                                                            <Listbox.Option
                                                                key={postState}
                                                                value={
                                                                    postState
                                                                }
                                                                className={tw`co-filled-button relative cursor-default select-none py-2 pl-8 pr-2 first:rounded-t-lg last:rounded-b-lg`}
                                                            >
                                                                {({
                                                                    selected,
                                                                }: {
                                                                    selected: boolean;
                                                                }) => (
                                                                    <>
                                                                        <span className="block">
                                                                            {
                                                                                string
                                                                            }
                                                                        </span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                                                                                <CheckIcon className="h-4 w-4" />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        )
                                                    )}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                    </div>
                                </footer>
                            </Tab.Group>
                        </article>
                        {pinnedTags.length > 0 ? (
                            <TagRecommendationBox
                                categoryTitle="pinned tags"
                                stateId="pinned"
                                tags={pinnedTags}
                            />
                        ) : null}
                        {recentlyUsedTags.data?.tags ? (
                            <TagRecommendationBox
                                categoryTitle="recently used tags"
                                stateId="recently-used"
                                tags={recentlyUsedTags.data?.tags}
                            />
                        ) : null}
                        {hasCohostPlus ? (
                            <p className="max-w-prose">
                                As a cohost Plus! member, your attachment size
                                upload limit is now 10mb! Go crazy, but keep in
                                mind larger attachments might take a while to
                                upload.
                            </p>
                        ) : null}
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
});
PostComposerInner.displayName = "PostComposerInner";

export default PostComposer;
