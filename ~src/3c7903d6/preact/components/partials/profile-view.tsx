import _ from "lodash";
import { trpc } from "@/client/lib/trpc";
import { Button, LinkButton } from "@/client/preact/components/elements/button";
import { UserNote } from "@/client/preact/components/partials/user-note";
import { SilenceIcon } from "@/client/preact/components/icons/silence";
import { ReportingUIContext } from "@/client/reporting/machine";
import { sitemap } from "@/shared/sitemap";
import { AccessFlags, AccessResult } from "@/shared/types/access-result";
import { ProjectFlag, ProjectPrivacy } from "@/shared/types/projects";
import { WireProjectModel } from "@/shared/types/projects";
import { Menu } from "@headlessui/react";
import {
    NoSymbolIcon,
    ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import {
    CheckBadgeIcon,
    ChevronDownIcon,
    EllipsisHorizontalIcon,
    LinkIcon,
    UserIcon,
} from "@heroicons/react/24/solid";
import { CogIcon, HashtagIcon } from "@heroicons/react/20/solid";
import React, {
    FunctionComponent,
    ReactNode,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { useUserInfo } from "../../providers/user-info-provider";
import { FollowButton } from "./follow-button";
import { ProjectAvatar } from "./project-avatar";
import { renderMarkdownReactNoHTML } from "@/client/lib/markdown/other-rendering";
import { useModalPostComposer } from "../modal-post-composer-context";
import { useCurrentProject } from "../../hooks/data-loaders";
import { ContactInfoCard } from "@/client/preact/components/partials/project-page/contact-info-card";
import { SimpleModalDialog } from "../elements/simple-modal-dialog";

function displayURL(url: URL): string {
    return url.toString().split("://")[1];
}

export type ProfileViewProps = {
    project: WireProjectModel;
    canAccessPermissions: AccessFlags;
    previewMode?: boolean;
};

const ErrorBox: FunctionComponent<
    React.PropsWithChildren<{ header: string; body: string }>
> = ({ header, body, children }) => (
    <div className="cohost-shadow-light mt-4 rounded-lg bg-foreground p-3">
        <h1 className="text-xl font-bold">{header}</h1>

        <p>{body}</p>
        {children}
    </div>
);

export const ProfileView: FunctionComponent<
    React.PropsWithChildren<ProfileViewProps>
> = ({ project, canAccessPermissions, previewMode = false, children }) => {
    const { t } = useTranslation();
    const displayPrefs = useDisplayPrefs();
    const animate = previewMode || !displayPrefs.pauseProfileGifs;
    let postFeed: ReactNode;

    const { data: isReaderMuting } = trpc.projects.isReaderMuting.useQuery(
        {
            projectHandle: project.handle,
        },
        { suspense: true }
    );

    const { data: isReaderBlocking } = trpc.projects.isReaderBlocking.useQuery(
        {
            projectHandle: project.handle,
        },
        { suspense: true }
    );

    const userInfo = useUserInfo();
    const activeProjectId = userInfo.loggedIn ? userInfo.projectId : null;
    const [mutedCollapsed, setMutedCollapsed] = useState(true);
    const shouldMuteCollapse = isReaderMuting && mutedCollapsed;
    const [blockedCollapsed, setBlockedCollapsed] = useState(true);
    const shouldBlockCollapse = isReaderBlocking && blockedCollapsed;

    // modal post composer setup
    const currentProject = useCurrentProject();
    const modalPostComposer = useModalPostComposer();
    useEffect(() => {
        if (currentProject) {
            modalPostComposer.setup({
                project: currentProject,
            });
        }
    }, [currentProject, modalPostComposer]);

    const flags = useMemo(
        () => new Set<ProjectFlag>(project.flags),
        [project.flags]
    );

    const renderedDescription = useMemo(
        () =>
            renderMarkdownReactNoHTML(project.description, new Date(), {
                renderingContext: "profile",
                hasCohostPlus: false,
                disableEmbeds: false,
                externalLinksInNewTab: displayPrefs.externalLinksInNewTab,
            }),
        [displayPrefs.externalLinksInNewTab, project.description]
    );

    const reportingUIContext = useContext(ReportingUIContext);

    const utils = trpc.useContext();

    const silencingMutationArgs = {
        onSettled: async () => {
            return Promise.all([
                utils.posts.profilePosts.invalidate(),
                utils.projects.isReaderMuting.invalidate({
                    projectHandle: project.handle,
                }),
            ]);
        },
    };
    const silenceProjectMutation = trpc.relationships.mute.useMutation(
        silencingMutationArgs
    );
    const unsilenceProjectMutation = trpc.relationships.unmute.useMutation(
        silencingMutationArgs
    );

    const [silenceConfirmOpen, setSilenceConfirmOpen] = useState(false);

    const onClickSilencing = useCallback(async () => {
        if (!userInfo.loggedIn) {
            throw new Error("Not logged in");
        }

        const mutateArgs = {
            fromProjectId: userInfo.projectId,
            toProjectId: project.projectId,
        };
        if (isReaderMuting)
            await unsilenceProjectMutation.mutateAsync(mutateArgs);
        else setSilenceConfirmOpen(true);
    }, [
        isReaderMuting,
        project.projectId,
        unsilenceProjectMutation,
        userInfo.loggedIn,
        userInfo.projectId,
    ]);

    const onConfirmSilencing = useCallback(async () => {
        if (!userInfo.loggedIn) {
            throw new Error("Not logged in");
        }

        const mutateArgs = {
            fromProjectId: userInfo.projectId,
            toProjectId: project.projectId,
        };

        await silenceProjectMutation.mutateAsync(mutateArgs);
        setSilenceConfirmOpen(false);
    }, [
        project.projectId,
        silenceProjectMutation,
        userInfo.loggedIn,
        userInfo.projectId,
    ]);

    const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

    const blockingMutationArgs = {
        onSettled: async () => {
            return Promise.all([
                utils.posts.profilePosts.invalidate(),
                utils.projects.isReaderBlocking.invalidate({
                    projectHandle: project.handle,
                }),
            ]);
        },
    };
    const blockProjectMutation =
        trpc.relationships.block.useMutation(blockingMutationArgs);
    const unblockProjectMutation =
        trpc.relationships.unblock.useMutation(blockingMutationArgs);

    const onClickBlocking = useCallback(async () => {
        if (!userInfo.loggedIn) {
            throw new Error("Not logged in");
        }

        const mutateArgs = {
            fromProjectId: userInfo.projectId,
            toProjectId: project.projectId,
        };
        if (isReaderBlocking)
            await unblockProjectMutation.mutateAsync(mutateArgs);
        else setBlockConfirmOpen(true);
    }, [
        isReaderBlocking,
        project.projectId,
        unblockProjectMutation,
        userInfo.loggedIn,
        userInfo.projectId,
    ]);

    const onConfirmBlocking = useCallback(async () => {
        if (!userInfo.loggedIn) {
            throw new Error("Not logged in");
        }

        const mutateArgs = {
            fromProjectId: userInfo.projectId,
            toProjectId: project.projectId,
        };

        await blockProjectMutation.mutateAsync(mutateArgs);
        setBlockConfirmOpen(false);
    }, [
        blockProjectMutation,
        project.projectId,
        userInfo.loggedIn,
        userInfo.projectId,
    ]);

    if (canAccessPermissions.canRead === AccessResult.Blocked) {
        postFeed = (
            <ErrorBox
                header={t(
                    "server:project-page.blocked-headline",
                    "you're blocked by this page"
                )}
                body={t(
                    "server:project-page.blocked-detail-text",
                    "they don't want you reading any of their posts"
                )}
            />
        );
    } else if (canAccessPermissions.canRead === AccessResult.LogInFirst) {
        if (project.loggedOutPostVisibility === "none") {
            postFeed = (
                <ErrorBox
                    header={t(
                        "server:project-page.none-logged-out-headline",
                        "this page is not viewable by logged-out users"
                    )}
                    body={t(
                        "server:project-page.none-logged-out-detail-text",
                        "you can view it if you're logged in"
                    )}
                />
            );
        }
    } else if (canAccessPermissions.canRead === AccessResult.NotAllowed) {
        if (project.privacy === ProjectPrivacy.Private) {
            if (userInfo.loggedIn) {
                postFeed = (
                    <ErrorBox
                        header={t(
                            "server:project-page.private-headline",
                            "this page is private"
                        )}
                        body={t(
                            "server:project-page.unfollowed-private-detail-text",
                            "you can only see posts from them if you follow them"
                        )}
                    />
                );
            } else {
                postFeed = (
                    <ErrorBox
                        header={t(
                            "server:project-page.private-headline",
                            "this page is private"
                        )}
                        body={t(
                            "server:project-page.log-in-private-detail-text",
                            "you might be able to see posts from them if you log in"
                        )}
                    />
                );
            }
        }
    } else if (canAccessPermissions.canRead === AccessResult.Allowed) {
        // explicitly verify we can read to avoid issues if new states get added
        if (flags.has("suspended")) {
            postFeed = (
                <div>
                    <ErrorBox
                        header={t(
                            "client:project-page.user-banned-headline",
                            "this page has been banned from cohost"
                        )}
                        body={t(
                            "client:project-page.user-banned-body",
                            "due to community guidelines violations, we have banned this page and its operator."
                        )}
                    />
                </div>
            );
        } else if (shouldMuteCollapse && shouldBlockCollapse) {
            postFeed = (
                <div>
                    <ErrorBox
                        header={t(
                            "client:project-page.muted-and-blocked-headline",
                            "this page is silenced AND blocked"
                        )}
                        body={t(
                            "client:project-page.muted-and-blocked-body",
                            "if you really want to, you can view their posts temporarily"
                        )}
                    >
                        <div className="mt-4 flex flex-row justify-center">
                            <Button
                                buttonStyle="pill"
                                color="accent"
                                onClick={() => {
                                    setMutedCollapsed(false);
                                    setBlockedCollapsed(false);
                                }}
                            >
                                {t(
                                    "client:project-page.muted-temporary-view",
                                    "view temporarily"
                                )}
                            </Button>
                        </div>
                    </ErrorBox>
                </div>
            );
        } else if (shouldMuteCollapse) {
            postFeed = (
                <div>
                    <ErrorBox
                        header={t(
                            "client:project-page.muted-headline",
                            "this page is silenced"
                        )}
                        body={t(
                            "client:project-page.muted-body",
                            "you can either unsilence them or view their posts temporarily"
                        )}
                    >
                        <div className="mt-4 flex flex-row justify-center">
                            <Button
                                buttonStyle="pill"
                                color="accent"
                                onClick={() => setMutedCollapsed(false)}
                            >
                                {t(
                                    "client:project-page.muted-temporary-view",
                                    "view temporarily"
                                )}
                            </Button>
                        </div>
                    </ErrorBox>
                </div>
            );
        } else if (shouldBlockCollapse) {
            postFeed = (
                <div>
                    <ErrorBox
                        header={t(
                            "client:project-page.reader-blocking-headline",
                            "this page is blocked"
                        )}
                        body={t(
                            "client:project-page.reader-blocking-body",
                            "you can either unblock them or view their posts temporarily"
                        )}
                    >
                        <div className="mt-4 flex flex-row justify-center">
                            <Button
                                buttonStyle="pill"
                                color="accent"
                                onClick={() => setBlockedCollapsed(false)}
                            >
                                {t(
                                    "client:project-page.muted-temporary-view",
                                    "view temporarily"
                                )}
                            </Button>
                        </div>
                    </ErrorBox>
                </div>
            );
        } else {
            postFeed = <Suspense>{children}</Suspense>;
        }
    } else {
        postFeed = (
            <div>unknown permission state: {canAccessPermissions.canRead}</div>
        );
    }
    return (
        <>
            <SimpleModalDialog
                isOpen={silenceConfirmOpen}
                title={t("client:silence-page.confirm-title", {
                    defaultValue: "Silence this page?",
                })}
                body={t("client:silence-page.confirm-body", {
                    defaultValue: "Are you sure you want to silence this page?",
                })}
                confirm={{
                    label: t("common:silence", "silence"),
                }}
                cancel={{
                    label: t("common:cancel", "cancel"),
                }}
                onConfirm={onConfirmSilencing}
                onCancel={() => setSilenceConfirmOpen(false)}
            />
            <SimpleModalDialog
                isOpen={blockConfirmOpen}
                title={t("client:block-page.confirm-title", {
                    defaultValue: "Block this page?",
                })}
                body={t("client:block-page.confirm-body", {
                    defaultValue: "Are you sure you want to block this page?",
                })}
                confirm={{
                    label: t("common:block", "block"),
                    color: "destructive",
                }}
                cancel={{
                    label: t("common:cancel", "cancel"),
                }}
                onConfirm={onConfirmBlocking}
                onCancel={() => setBlockConfirmOpen(false)}
            />
            {project.headerURL ? (
                <img
                    src={
                        animate ? project.headerURL : project.headerPreviewURL!
                    }
                    className="aspect-[44/9] w-full object-cover"
                    alt=""
                />
            ) : null}
            <div className="grid w-full min-w-0 flex-grow grid-cols-1 gap-6 lg:grid-cols-4">
                {/* PROFILE SIDEBAR */}
                <div className="relative col-span-1 flex w-full min-w-0 flex-col break-words bg-foreground p-3 pt-0 lg:items-center">
                    <div className="relative flex w-full min-w-0 flex-wrap gap-2 break-words lg:items-center lg:gap-0">
                        <div className="lg:w-full lg:flex-grow">
                            <ProjectAvatar
                                noLink={true}
                                project={project}
                                className={`cohost-shadow-light dark:cohost-shadow-dark mx-auto h-20 w-20 lg:h-36 lg:w-36 ${
                                    project.headerURL
                                        ? "-mt-8 lg:-mt-20"
                                        : "mt-4"
                                }`}
                                forceAnimate={previewMode}
                            />
                        </div>
                        <div className="flex min-w-0 flex-col break-words lg:flex-grow">
                            <div className="flex flex-col gap-2 break-words lg:gap-0">
                                <h1 className="min-w-0 break-words font-atkinson text-2xl font-bold text-text lg:relative lg:mt-4 lg:text-center">
                                    {flags.has("parody") ? (
                                        <div className="group  inline">
                                            <CheckBadgeIcon className="mr-2 inline h-6 w-6 -scale-y-100" />
                                            <div className="cohost-shadow-light prose invisible absolute left-0 top-8 z-20 w-max max-w-full rounded-lg bg-notWhite p-3 text-center text-sm font-normal text-notBlack group-hover:visible lg:bottom-8 lg:top-auto">
                                                <p>
                                                    cohost staff has verified
                                                    that this account is{" "}
                                                    <b>not</b> an official
                                                    representative of the entity
                                                    in its display name.
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <a
                                        href={sitemap.public.project
                                            .mainAppProfile({
                                                projectHandle: project.handle,
                                            })
                                            .toString()}
                                        className="hover:underline"
                                    >
                                        {project.displayName}
                                    </a>
                                </h1>
                                <h2 className="font-atkinson text-text lg:min-w-full lg:text-center">
                                    <a
                                        href={sitemap.public.project
                                            .mainAppProfile({
                                                projectHandle: project.handle,
                                            })
                                            .toString()}
                                        className="hover:underline"
                                    >
                                        @{project.handle}
                                    </a>
                                </h2>
                            </div>
                            <h3 className="font-atkinson text-text lg:text-center">
                                {project.dek}
                            </h3>
                        </div>
                    </div>
                    {userInfo.loggedIn &&
                    userInfo.projectId !== project.projectId ? (
                        <div className="absolute right-4 top-4">
                            <Menu as="div" className="relative">
                                <Menu.Button className="absolute right-0 top-0">
                                    <EllipsisHorizontalIcon className="h-6 w-6 text-text transition-transform ui-open:rotate-90" />
                                </Menu.Button>
                                <Menu.Items className="cohost-shadow-dark absolute right-0 top-8 z-30 flex min-w-max flex-col gap-3 rounded-lg bg-notWhite p-3 text-notBlack focus:!outline-none">
                                    <Menu.Item>
                                        <button
                                            className="flex flex-row gap-2 hover:underline"
                                            onClick={onClickSilencing}
                                        >
                                            <SilenceIcon className="h-6" />
                                            {isReaderMuting
                                                ? t(
                                                      "client:unsilence-handle-button",
                                                      {
                                                          defaultValue:
                                                              "unsilence @{{projectHandle}}",
                                                          projectHandle:
                                                              project.handle,
                                                      }
                                                  )
                                                : t(
                                                      "client:silence-handle-button",
                                                      {
                                                          defaultValue:
                                                              "silence @{{projectHandle}}",
                                                          projectHandle:
                                                              project.handle,
                                                      }
                                                  )}
                                        </button>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <button
                                            className="flex flex-row gap-2 hover:underline"
                                            onClick={onClickBlocking}
                                        >
                                            <NoSymbolIcon className="h-6 scale-x-[-1]" />
                                            {isReaderBlocking
                                                ? t(
                                                      "client:unblock-handle-button",
                                                      {
                                                          defaultValue:
                                                              "unblock @{{projectHandle}}",
                                                          projectHandle:
                                                              project.handle,
                                                      }
                                                  )
                                                : t(
                                                      "client:block-handle-button",
                                                      {
                                                          defaultValue:
                                                              "block @{{projectHandle}}",
                                                          projectHandle:
                                                              project.handle,
                                                      }
                                                  )}
                                        </button>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <button
                                            className="flex flex-row gap-2 hover:underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                reportingUIContext.send({
                                                    type: "START_REPORT",
                                                    projectId:
                                                        project.projectId,
                                                });
                                            }}
                                        >
                                            <ShieldExclamationIcon className="h-6" />
                                            {t("client:report-handle-button", {
                                                defaultValue:
                                                    "report @{{projectHandle}}",
                                                projectHandle: project.handle,
                                            })}
                                        </button>
                                    </Menu.Item>
                                    {userInfo.modMode ? (
                                        <Menu.Item>
                                            <a
                                                className="flex flex-row gap-2 hover:underline"
                                                href={sitemap.public.moderation
                                                    .manageProject({
                                                        projectHandle:
                                                            project.handle,
                                                    })
                                                    .toString()}
                                            >
                                                <CogIcon className="h-6" />
                                                manage project
                                            </a>
                                        </Menu.Item>
                                    ) : null}
                                </Menu.Items>
                            </Menu>
                        </div>
                    ) : null}
                    {project.pronouns || project.url ? (
                        <ul className="break-word mb-2 mt-2 flex min-w-0 flex-col justify-around gap-4 text-sm lg:flex-row">
                            {project.pronouns ? (
                                <li>
                                    <UserIcon className="inline-block h-4 text-accent" />{" "}
                                    {project.pronouns}
                                </li>
                            ) : null}
                            {project.url ? (
                                <li>
                                    <LinkIcon className="inline-block h-4 text-accent" />{" "}
                                    {/* it's complaining about the possibility that href="#"; since this is in a profile preview, I'm marking this wontfix for now */}
                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                    <a
                                        href={
                                            previewMode
                                                ? "#"
                                                : new URL(
                                                      project.url
                                                  ).toString()
                                        }
                                        rel="me nofollow noopener"
                                        target="_blank"
                                        className="break-all text-accent hover:underline"
                                    >
                                        {previewMode
                                            ? project.url
                                            : displayURL(new URL(project.url))}
                                    </a>
                                </li>
                            ) : null}
                        </ul>
                    ) : null}
                    <div className="prose-invert prose-stone min-w-0 max-w-full overflow-hidden break-words prose-a:text-accent lg:text-center">
                        {renderedDescription}
                    </div>
                    <div className="mt-4 flex flex-row items-center gap-4">
                        {canAccessPermissions.canRead !==
                            AccessResult.Blocked &&
                        activeProjectId !== project.projectId ? (
                            <FollowButton project={project} color="accent" />
                        ) : null}

                        {activeProjectId === project.projectId &&
                        !previewMode ? (
                            <>
                                <LinkButton
                                    buttonStyle="pill"
                                    color="accent"
                                    href={sitemap.public.project
                                        .profileEdit()
                                        .toString()}
                                >
                                    {t(
                                        "client:profile-page.edit-profile-button",
                                        "Edit profile"
                                    )}
                                </LinkButton>
                                <LinkButton
                                    buttonStyle="pill"
                                    color="accent"
                                    href={sitemap.public.project
                                        .settings()
                                        .toString()}
                                >
                                    <CogIcon className="h-4" />
                                </LinkButton>
                            </>
                        ) : null}
                        {project.askSettings.enabled ? (
                            <LinkButton
                                buttonStyle="pill"
                                color="accent"
                                href={sitemap.public.project
                                    .ask({ projectHandle: project.handle })
                                    .toString()}
                            >
                                ask
                            </LinkButton>
                        ) : null}
                    </div>

                    <ContactInfoCard project={project} />
                </div>
                <div className="order-3 col-span-1 mb-16 lg:order-none lg:col-span-2">
                    {postFeed}
                </div>
                {/* frequently used tags */}
                <div className="order-2 col-span-1 mt-4 w-full lg:order-none lg:mb-16">
                    <div className="flex flex-col gap-5">
                        {project.frequentlyUsedTags.length ? (
                            <div className="cohost-shadow-light dark:cohost-shadow-dark flex flex-col divide-y divide-gray-300 rounded-lg bg-white lg:max-w-sm">
                                <div className="flex flex-row items-center rounded-t-lg bg-longan p-3 uppercase text-notBlack">
                                    Pinned Tags
                                </div>
                                <ul className="flex flex-row flex-wrap items-center gap-x-2.5 gap-y-3 p-3">
                                    {project.frequentlyUsedTags.map((tag) => (
                                        <li
                                            key={tag}
                                            className="cursor-pointer select-none"
                                        >
                                            <a
                                                href={sitemap.public.project
                                                    .tags({
                                                        tagSlug: tag,
                                                        projectHandle:
                                                            project.handle,
                                                    })
                                                    .toString()}
                                                className="flex items-center justify-start gap-1 rounded-full bg-foreground px-2 py-1 leading-none text-text hover:bg-foreground-700"
                                            >
                                                <HashtagIcon className="inline-block h-3.5" />
                                                <span className="block">
                                                    {tag}
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {userInfo.loggedIn &&
                        userInfo.projectId !== project.projectId ? (
                            <UserNote projectId={project.projectId} />
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileView;
