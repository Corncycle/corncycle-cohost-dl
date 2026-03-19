import sitemap from "@/shared/sitemap";
import { ProjectHandle, ProjectId } from "@/shared/types/ids";
import { AttachmentViewBlock } from "@/shared/types/post-blocks";
import { WireNotificationType } from "@/shared/types/wire-models";
import { Menu, Transition } from "@headlessui/react";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import {
    ArrowPathIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChevronDownIcon,
    ExclamationCircleIcon,
    HeartIcon,
    UserGroupIcon,
    UserPlusIcon,
} from "@heroicons/react/24/solid";
import React, { FunctionComponent, ReactNode, useMemo } from "react";
import { Trans } from "react-i18next";
import { ProjectAvatar, ProjectAvatarFilteredProject } from "../project-avatar";

export type NotificationCardType =
    | "followed-you"
    | "liked-your-post"
    | "liked-share-of-post"
    | "replied-to-comment"
    | "commented-on-post"
    | "shared-your-post"
    | "shared-and-added"
    | "shared-a-share"
    | "shared-a-share-and-added"
    | "group-liked-your-post"
    | "group-liked-share-of-post"
    | "group-followed-you"
    | "group-shared-your-post"
    | "group-shared-a-share";

export type NotificationCardProps = {
    key: string | number;
    projects: ProjectAvatarFilteredProject[];
    type: WireNotificationType;
    actionText: NotificationCardType;
    summary?: string;
    firstAttachment?: AttachmentViewBlock;
    body?: string;
    summaryUrl: string;
    expandedUrls?: Map<ProjectId, string>;
};

const ActorLink: FunctionComponent<{ handle: ProjectHandle }> = ({
    handle,
}) => (
    <a
        href={sitemap.public.project
            .mainAppProfile({
                projectHandle: handle,
            })
            .toString()}
        className="font-bold hover:underline"
        onClick={(e) => e.stopPropagation()} // Do not close menu
    >
        @{handle}
    </a>
);

const SubjectLink: FunctionComponent<{
    children: ReactNode;
    url: string | undefined;
}> = ({ children, url }) => (
    <a
        href={url}
        className="font-bold hover:underline"
        onClick={(e) => e.stopPropagation()} // Do not close menu
    >
        {children}
    </a>
);

const ExpandedGroupedShare: FunctionComponent<{
    project: ProjectAvatarFilteredProject;
    notificationType: NotificationCardType;
    expandedUrls: Map<ProjectId, string> | undefined;
}> = ({ project, notificationType, expandedUrls }) => {
    switch (notificationType) {
        case "group-shared-your-post":
            return (
                <div>
                    <Trans i18nKey="client:notifications.group-shared-your-post-expanded">
                        <ActorLink handle={project.handle} /> shared{" "}
                        <SubjectLink
                            url={
                                expandedUrls
                                    ? expandedUrls.get(project.projectId)
                                    : undefined
                            }
                        >
                            your post
                        </SubjectLink>
                    </Trans>
                </div>
            );
        case "group-shared-a-share":
            return (
                <div>
                    <Trans i18nKey="client:notifications.group-shared-a-share-expanded">
                        <ActorLink handle={project.handle} /> shared{" "}
                        <SubjectLink
                            url={
                                expandedUrls
                                    ? expandedUrls.get(project.projectId)
                                    : undefined
                            }
                        >
                            a share
                        </SubjectLink>{" "}
                        of your post
                    </Trans>
                </div>
            );
        default:
            return null;
    }
};

const ActionElement: FunctionComponent<{
    actorHandle: ProjectHandle;
    notificationType: NotificationCardType;
    url: string;
}> = ({ actorHandle, notificationType, url }) => {
    switch (notificationType) {
        case "followed-you":
            return (
                <Trans i18nKey="client:notifications.followed-you">
                    <ActorLink handle={actorHandle} /> followed you
                </Trans>
            );
        case "group-followed-you":
            return (
                <Trans i18nKey="client:notifications.group-followed-you">
                    Several pages followed you
                </Trans>
            );
        case "liked-your-post":
            return (
                <Trans i18nKey="client:notifications.liked-your-post">
                    <ActorLink handle={actorHandle} /> liked{" "}
                    <SubjectLink url={url}>your post</SubjectLink>
                </Trans>
            );
        case "liked-share-of-post":
            return (
                <Trans i18nKey="client:notifications.liked-share-of-post">
                    <ActorLink handle={actorHandle} /> liked{" "}
                    <SubjectLink url={url}>a share</SubjectLink> of your post
                </Trans>
            );
        case "group-liked-your-post":
            return (
                <Trans i18nKey="client:notifications.group-liked-your-post">
                    Several pages liked{" "}
                    <SubjectLink url={url}>your post</SubjectLink>
                </Trans>
            );
        case "group-liked-share-of-post":
            return (
                <Trans i18nKey="client:notifications.group-liked-share-of-post">
                    Several pages liked{" "}
                    <SubjectLink url={url}>a share</SubjectLink> of your post
                </Trans>
            );
        case "replied-to-comment":
            return (
                <Trans i18nKey="client:notifications.replied-to-comment">
                    <ActorLink handle={actorHandle} /> replied to{" "}
                    <SubjectLink url={url}>your comment</SubjectLink>
                </Trans>
            );
        case "commented-on-post":
            return (
                <Trans i18nKey="client:notifications.commented-on-post">
                    <ActorLink handle={actorHandle} /> left{" "}
                    <SubjectLink url={url}>a comment</SubjectLink> on your post
                </Trans>
            );
        case "shared-your-post":
            return (
                <Trans i18nKey="client:notifications.shared-your-post">
                    <ActorLink handle={actorHandle} /> shared{" "}
                    <SubjectLink url={url}>your post</SubjectLink>
                </Trans>
            );
        case "group-shared-your-post":
            return (
                <Trans i18nKey="client:notifications.group-shared-your-post">
                    Several pages shared{" "}
                    <SubjectLink url={url}>your post</SubjectLink>
                </Trans>
            );
        case "group-shared-a-share":
            return (
                <Trans i18nKey="client:notifications.group-shared-a-share">
                    Several pages shared{" "}
                    <SubjectLink url={url}>a share</SubjectLink> of your post
                </Trans>
            );
        case "shared-and-added":
            return (
                <Trans i18nKey="client:notifications.shared-and-added">
                    <ActorLink handle={actorHandle} /> shared{" "}
                    <SubjectLink url={url}>your post and added</SubjectLink>
                </Trans>
            );
        case "shared-a-share":
            return (
                <Trans i18nKey="client:notifications.shared-a-share">
                    <ActorLink handle={actorHandle} /> shared{" "}
                    <SubjectLink url={url}>a share</SubjectLink> of your post
                </Trans>
            );
        case "shared-a-share-and-added":
            return (
                <Trans i18nKey="client:notifications.shared-a-share-and-added">
                    <ActorLink handle={actorHandle} /> shared{" "}
                    <SubjectLink url={url}>
                        a share of your post and added
                    </SubjectLink>
                </Trans>
            );
    }
};

const AttachmentPreview: FunctionComponent<{
    attachment: AttachmentViewBlock;
}> = ({ attachment }) => {
    const processedImageUrl = useMemo(() => {
        const src = attachment.attachment.previewURL;

        const parsedSrc = new URL(src);
        // hardcode this to 2 because it doesn't matter that much from a size
        // standpoint and eliminates any flashing or double loading.
        parsedSrc.searchParams.append("dpr", "2");
        // hardcode width and height since we display at a fixed size
        parsedSrc.searchParams.append("width", "32");
        parsedSrc.searchParams.append("height", "32");
        parsedSrc.searchParams.append("fit", "cover");
        parsedSrc.searchParams.append("auto", "webp");

        return parsedSrc.toString();
    }, [attachment.attachment.previewURL]);

    switch (attachment.attachment.kind) {
        case "image": {
            return (
                <img
                    src={processedImageUrl}
                    alt={attachment.attachment.altText}
                    className="cohost-shadow-light aspect-square h-8 w-8 rounded-lg object-cover"
                />
            );
        }
        case "audio": {
            return (
                <div className="cohost-shadow-light flex h-8 w-8 flex-row items-center rounded-lg bg-cherry object-cover">
                    <SpeakerWaveIcon className="m-auto h-6 w-6 text-notWhite" />
                </div>
            );
        }
    }
};

export const NotificationCard: FunctionComponent<NotificationCardProps> = ({
    projects,
    actionText,
    summary,
    firstAttachment,
    body,
    type,
    summaryUrl,
    expandedUrls,
}) => {
    const Icon =
        type === "like"
            ? HeartIcon
            : type === "comment"
            ? ChatBubbleOvalLeftEllipsisIcon
            : type === "share" || type === "groupedShare"
            ? ArrowPathIcon
            : type === "follow"
            ? UserPlusIcon
            : type === "groupedLike"
            ? HeartIcon
            : type === "groupedFollow"
            ? UserGroupIcon
            : ExclamationCircleIcon; // error state
    return (
        <div className="co-notification-card flex flex-col p-3 last:rounded-b-lg">
            <div className="flex w-full flex-row flex-nowrap items-center gap-3 ">
                <Icon className="h-6 w-6 flex-none" />
                {projects.length === 1 ? (
                    <ProjectAvatar
                        project={projects[0]}
                        noLink={true}
                        hideLock={true}
                        className="h-8 w-8"
                    />
                ) : null}
                <div className="flex w-full flex-1 flex-row flex-wrap gap-3 overflow-auto lg:flex-nowrap">
                    <span className="flex-wrap">
                        <ActionElement
                            actorHandle={projects[0].handle}
                            notificationType={actionText}
                            url={summaryUrl}
                        />
                    </span>
                    {summary ? (
                        <span className="co-inline-quote flex-1 truncate before:content-['“'] after:content-['”']">
                            <a href={summaryUrl} className="hover:underline">
                                {summary}
                            </a>
                        </span>
                    ) : null}
                </div>
                {firstAttachment ? (
                    <AttachmentPreview attachment={firstAttachment} />
                ) : null}
            </div>
            {body ? (
                <p className="co-block-quote ml-20 whitespace-pre-line break-words border-l-2 pl-2 italic">
                    {body}
                </p>
            ) : null}
            {projects.length > 1 ? (
                <Menu as="div" className="flex flex-col gap-4">
                    <div className="mt-2 flex flex-row flex-nowrap items-center gap-3 overflow-hidden">
                        <Menu.Button>
                            <ChevronDownIcon className="h-6 w-6 transition-transform ui-open:rotate-180" />
                        </Menu.Button>
                        <div className="flex flex-row flex-nowrap items-center gap-2 overflow-hidden">
                            {projects.map((project) => (
                                <ProjectAvatar
                                    key={project.projectId}
                                    project={project}
                                    noLink={false}
                                    hideLock={true}
                                    className="h-8 w-8"
                                />
                            ))}
                        </div>
                    </div>
                    <Transition
                        enter="motion-reduce:transition-none transition-transform origin-top ease-out"
                        enterFrom="scale-y-0"
                        enterTo="scale-y-100"
                        leave="motion-reduce:transition-none transition-transform origin-top ease-out"
                        leaveTo="scale-y-0"
                        leaveFrom="scale-y-100"
                    >
                        <Menu.Items
                            as="div"
                            className="ml-9 flex flex-col gap-2"
                        >
                            {projects.map((project) => (
                                <Menu.Item
                                    key={project.handle}
                                    as="div"
                                    className="flex flex-row gap-4"
                                >
                                    <ProjectAvatar
                                        project={project}
                                        noLink={true}
                                        hideLock={true}
                                        className="h-8 w-8"
                                    />
                                    {type === "groupedShare" ? (
                                        <ExpandedGroupedShare
                                            project={project}
                                            notificationType={actionText}
                                            expandedUrls={expandedUrls}
                                        />
                                    ) : (
                                        <ActorLink handle={project.handle} />
                                    )}
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : null}
        </div>
    );
};
