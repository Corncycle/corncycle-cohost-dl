import { Emoji } from "@/client/lib/emoji";
import { selectStateMatches } from "@/client/lib/xstate-helpers";
import { useEditedProjects } from "@/client/preact/hooks/use-edited-projects";
import { sitemap } from "@/shared/sitemap";
import { AttachmentState } from "@/shared/types/attachments";
import type { AskId, PostId, ProjectHandle } from "@/shared/types/ids";
import {
    isMarkdownStorageBlock,
    parseAttachmentViewBlocks,
} from "@/shared/types/post-blocks";
import { PostState } from "@/shared/types/posts";
import { WireProjectModel } from "@/shared/types/projects";
import { isDefined } from "@/shared/util/filter-null-undefined";
import { Listbox, Tab } from "@headlessui/react";
import {
    CheckIcon,
    ChevronDownIcon,
    ExclamationTriangleIcon,
    PaperClipIcon,
    QuestionMarkCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMachine, useSelector } from "@xstate/react";
import React, {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { StateFrom } from "xstate";
import { WirePostViewModel } from "../../../../../shared/types/wire-models";
import {
    Attachment,
    PostEditorContext,
    postEditorMachine,
} from "./post-editor-machine";
import { useHasCohostPlus } from "../../../hooks/data-loaders";
import useBeforeUnload from "../../../hooks/use-before-unload";
import { useSiteConfig } from "../../../providers/site-config-provider";
import { useUserInfo } from "../../../providers/user-info-provider";
import { ErrorBoundary } from "../../error-boundary";
import { FilePicker } from "../../file-selector";
import LazyDnD from "../../lazy-dnd";
import { AuthnButton } from "../../partials/authn-button";
import { ProjectAvatar } from "../../partials/project-avatar";
import { useDynamicTheme } from "../../../hooks/dynamic-theme";
import AttachmentComposer from "./attachment-composer";
import { AttachmentComposerContext } from "./attachment-composer-context";
import { EditingPanel } from "./editing-panel";
import { EmojiButton } from "../emoji-button";
import { PostComposerContext } from "./post-composer-context";
import { PostComposerPreview } from "./preview";

import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import { TagRecommendationBox } from "./tag-recommendation-box";
import { PostComposerProps } from "../api";
import { useFlag } from "@unleash/proxy-client-react";

// used to get around hook changing issues
const EMPTY_ARRAY: any[] = [];

const selectHasErrors = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.validationErrors.size > 0;
const selectErrors = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.validationErrors.size > 0
        ? Array.from(state.context.validationErrors)
        : (EMPTY_ARRAY as [string, string][]);
const selectHasPosted = selectStateMatches("posted");
const selectIsEditing = selectStateMatches("editing");
const selectCanCollapseCws = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.cws.length === 0;
const selectMaxAttachmentsChosen = selectStateMatches({
    editing: { attachments: "waitingForUpload" },
});
const selectNewPostState = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.newPostState;
const selectProjectHandle = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.projectHandle;
const selectAdultContent = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.adultContent;
const selectDirty = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.dirty;
const selectPostId = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.postId;

// no body, no attachments, no headline (tags excluded for now)
const selectIsTransparentShare = (state: StateFrom<typeof postEditorMachine>) =>
    !!state.context.shareOfPostId &&
    !state.context.headline &&
    !state.context.attachments.length &&
    !state.context.markdownBlocks.filter((block) => !!block.markdown.content)
        .length;

const selectEditingTransparentShare = (
    state: StateFrom<typeof postEditorMachine>
) => state.context.editingTransparentShare;

export type PostComposerRef = {
    attemptClose: () => boolean;
};

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
        const hasCohostPlus = useHasCohostPlus();
        const siteConfig = useSiteConfig();
        const sizeLimits = siteConfig.limits.attachmentSize;
        const { activated } = useUserInfo();

        const [context] = useState<Partial<PostEditorContext>>(() => {
            const context: Partial<PostEditorContext> = {
                projectHandle: initialProject.handle,
                isActivated: activated,
                hasCohostPlus,
                sizeLimits,
            };

            if (initialPost) {
                context.postId = initialPost.postId;
                context.currentPostState = initialPost.state;
                context.newPostState = initialPost.state;
                context.adultContent = initialPost.effectiveAdultContent;
                context.shareOfPostId = initialPost.shareOfPostId;

                context.headline = initialPost.headline;
                context.markdownBlocks = initialPost.blocks.filter(
                    isMarkdownStorageBlock
                );
                // TODO: attachments figure out a better way to make a fake file here
                context.attachments = parseAttachmentViewBlocks(
                    initialPost.blocks
                ).map<Attachment>((block) => {
                    switch (block.attachment.kind) {
                        case "audio":
                            return {
                                state: AttachmentState.Finished,
                                attachmentId: block.attachment.attachmentId,
                                kind: "audio",
                                metadata: {
                                    artist: block.attachment.artist ?? "",
                                    title: block.attachment.title ?? "",
                                },
                            };
                        case "image":
                            return {
                                state: AttachmentState.Finished,
                                attachmentId: block.attachment.attachmentId,
                                kind: "image",
                                metadata: {
                                    altText: block.attachment.altText ?? "",
                                    width: block.attachment.width ?? 0,
                                    height: block.attachment.height ?? 0,
                                },
                            };
                    }
                });

                // we need to know if the existing post is a transparent share so we
                // can adjust the rendered composer accordingly
                context.editingTransparentShare =
                    !!initialPost.transparentShareOfPostId;

                context.tags = initialPost.tags;
                context.cws = initialPost.cws;
                context.responseToAskId =
                    initialPost.responseToAskId ?? undefined;
            } else {
                if (shareOf) {
                    context.shareOfPostId = shareOf.postId;
                }

                if (props.responseToAskId) {
                    context.responseToAskId = props.responseToAskId;
                }

                if (tags.length) {
                    context.tags = tags;
                }

                if (cws.length) {
                    context.cws = cws;
                }

                context.adultContent = initialAdultContent;
            }

            return context;
        });

        const [, , service] = useMachine(postEditorMachine, {
            context,
            devTools: process.env.NODE_ENV === "development",
        });

        const hasPosted = useSelector(service, selectHasPosted);
        const newPostState = useSelector(service, selectNewPostState);
        const projectHandle = useSelector(service, selectProjectHandle);
        const dirty = useSelector(service, selectDirty);
        const postId = useSelector(service, selectPostId);

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
            const subscription = service.subscribe((state) => {
                // we have to be specific here to avoid creating multiple
                // toasts.
                if (
                    state.matches("posting.startingUpload") &&
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

                if (state.matches("posted")) {
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

                if (state.matches("postingFailed")) {
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
            });
            return () => {
                subscription.unsubscribe();
                postToast.current = undefined;
            };
        }, [service, newPostState]);

        const attachmentComposerRef = useRef(null);

        return (
            <PostComposerContext.Provider value={service}>
                {activated ? (
                    <AttachmentComposerContext.Provider
                        value={attachmentComposerRef}
                    >
                        <AttachmentComposer ref={attachmentComposerRef} />
                        <PostComposerInner
                            project={initialProject}
                            isModal={props.isModal}
                            onClose={props.onClose}
                        />
                    </AttachmentComposerContext.Provider>
                ) : (
                    <UnactivatedPostComposer isModal={props.isModal} />
                )}
            </PostComposerContext.Provider>
        );
    });
PostComposer.displayName = "PostComposer";

const UnactivatedPostComposer: FunctionComponent<{ isModal?: boolean }> =
    React.memo(({ isModal = false }) => {
        const { t } = useTranslation();

        const service = useContext(PostComposerContext);
        const { send } = service;

        const isEditing = useSelector(service, selectIsEditing);

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
                    onClick={() => send({ type: "SUBMIT_POST" })}
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
    const service = useContext(PostComposerContext);
    const { send } = service;

    const hasCohostPlus = useHasCohostPlus();

    const { projects } = useEditedProjects();

    const hasErrors = useSelector(service, selectHasErrors);
    const errors = useSelector(service, selectErrors);
    const isEditing = useSelector(service, selectIsEditing);
    const canCollapseCws = useSelector(service, selectCanCollapseCws);
    const maxAttachmentsChosen = useSelector(
        service,
        selectMaxAttachmentsChosen
    );
    const newPostState = useSelector(service, selectNewPostState);
    const projectHandle = useSelector(service, selectProjectHandle);
    const adultContent = useSelector(service, selectAdultContent);
    const isTransparentShare = useSelector(service, selectIsTransparentShare);
    const editingTransparentShare = useSelector(
        service,
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
        send({
            type: "TOGGLE_CWS_INPUT",
        });
    }, [send]);

    const setNewPostState = useCallback(
        (newPostState: PostState) => {
            send({
                type: "SET_POST_STATE",
                newPostState,
            });
        },
        [send]
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

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const dynamicTheme = useDynamicTheme();

    const onSelectEmoji = useCallback(
        (emoji: Emoji) => {
            console.log(textAreaRef.current);
            if (textAreaRef.current) {
                const [start, end] = [
                    textAreaRef.current.selectionStart,
                    textAreaRef.current.selectionEnd,
                ];

                console.log(emoji);

                textAreaRef.current.setRangeText(
                    emoji.native ?? emoji.shortcodes!,
                    start,
                    end,
                    "end"
                );

                send({
                    type: "BODY_INPUT",
                    body: textAreaRef.current.value,
                });
            }
        },
        [send]
    );

    const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLElement>>(
        (ev) => {
            if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") {
                ev.preventDefault();
                send({ type: "SUBMIT_POST" });
            }
        },
        [send]
    );

    const onPaste = useCallback(
        (ev: ClipboardEvent) => {
            const items = ev.clipboardData?.items ?? [];
            const file: File | undefined = Array.from(items)
                .filter((item) => item.type.indexOf("image") > -1)
                .map((item) => item.getAsFile())
                .filter(isDefined)[0];
            if (file) {
                console.log("file size:", file.size / 1024 / 1024, "MB");
                send({ type: "SELECT_FILE", file });
                ev.preventDefault();
                return;
            }
        },
        [send]
    );

    useEffect(() => {
        window.document.addEventListener("paste", onPaste);
        return () => {
            window.document.removeEventListener("paste", onPaste);
        };
    }, [onPaste]);

    return (
        // intentionally ignoring this one; just adding a keyboard shortcut for
        // submitting comments, which is accessible in other ways
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onKeyDown={onKeyDown}>
            <ErrorBoundary>
                <LazyDnD>
                    {hasErrors ? (
                        <div className="mx-auto mb-6 max-w-lg border-2 border-red-700 bg-red-300 p-3 text-notBlack">
                            <h1 className="text-lg font-bold">
                                {t(
                                    "client:post-editor.validation-errors",
                                    "There were some errors:"
                                )}
                            </h1>
                            <ul className="list-inside list-disc">
                                {errors.map(([, error]) => (
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
                                                    send({
                                                        type: "CHANGE_PROJECT",
                                                        projectHandle,
                                                    });
                                                }}
                                            >
                                                <Listbox.Button
                                                    className="font-atkinson font-bold"
                                                    data-testId="posting-as-project"
                                                >
                                                    {({
                                                        open,
                                                    }: {
                                                        open: boolean;
                                                    }) => (
                                                        <>
                                                            {
                                                                currentProject.handle
                                                            }{" "}
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
                                                            value={
                                                                project.handle
                                                            }
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
                                                    send({
                                                        type: "SET_ADULT_CONTENT",
                                                        adultContent:
                                                            e.currentTarget
                                                                .checked,
                                                    })
                                                }
                                                disabled={
                                                    isTransparentShare ||
                                                    !isEditing
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
                                        <Tab.Panel>
                                            <EditingPanel
                                                textAreaRef={textAreaRef}
                                            />
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
                                                        send({
                                                            type: "SELECT_FILE",
                                                            file: files[0],
                                                        })
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
                                                    onSelectEmoji={
                                                        onSelectEmoji
                                                    }
                                                    disabled={!isEditing}
                                                    hasCohostPlus={
                                                        !!hasCohostPlus
                                                    }
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
                                                        send({
                                                            type: "SUBMIT_POST",
                                                        })
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
                                                    onChange={setNewPostState}
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
                                                                    key={
                                                                        postState
                                                                    }
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
                                    As a cohost Plus! member, your attachment
                                    size upload limit is now 10mb! Go crazy, but
                                    keep in mind larger attachments might take a
                                    while to upload.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </LazyDnD>
            </ErrorBoundary>
        </div>
    );
});
PostComposerInner.displayName = "PostComposerInner";

export default PostComposer;
