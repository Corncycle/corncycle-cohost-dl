import { trpc } from "@/client/lib/trpc";
import * as BookmarksV1Types from "@/shared/api-types/bookmarks-v1";
import sitemap from "@/shared/sitemap";
import { ProjectPrivacy } from "@/shared/types/projects";
import { Menu } from "@headlessui/react";
import {
    ArrowLeftOnRectangleIcon,
    BellIcon as BellIConOutline,
    CogIcon as CogIconOutline,
    DocumentTextIcon as DocumentTextIconOutline,
    LifebuoyIcon as LifebuoyIconOutline,
    MagnifyingGlassIcon as MagnifyingGlassIconOutline,
    PencilIcon,
    TagIcon as TagIconOutline,
    UserCircleIcon as UserCircleIconOutline,
    UserGroupIcon as UserGroupIconOutline,
    UserPlusIcon as UserPlusIconOutline,
    UsersIcon as UsersIconOutline,
    HeartIcon as HeartIconOutline,
    InboxIcon as InboxIconOutline,
    NewspaperIcon as NewspaperIconOutline,
    PaintBrushIcon as PaintBrushIconOutline,
} from "@heroicons/react/24/outline";
import {
    Bars3Icon,
    BellIcon as BellIconSolid,
    CogIcon as CogIconSolid,
    DocumentTextIcon as DocumentTextIconSolid,
    LifebuoyIcon as LifebuoyIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid,
    UserCircleIcon as UserCircleIconSolid,
    UserGroupIcon as UserGroupIconSolid,
    UserPlusIcon as UserPlusIconSolid,
    UsersIcon as UsersIconSolid,
    HeartIcon as HeartIconSolid,
    InboxIcon as InboxIconSolid,
    NewspaperIcon as NewspaperIconSolid,
    PaintBrushIcon as PaintBrushIconSolid,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import React, {
    FunctionComponent,
    Suspense,
    useCallback,
    useState,
} from "react";
import {
    useBookmarkedTags,
    useCurrentProject,
    useFollowRequestCount,
    useHasCohostPlus,
    useNotificationCount,
    useUnreadAskCount,
} from "../hooks/data-loaders";
import { useSSR } from "../hooks/is-server";
import { useDisplayPrefs } from "../hooks/use-display-prefs";
import { useReqMutableStore } from "../providers/req-mutable-store";
import { useUserInfo } from "../providers/user-info-provider";
import { KikiOutline } from "./icons/kiki-outline";
import { TextEgg } from "./icons/text-egg";
import { isTruthy } from "@/shared/util/filter-null-undefined";
import { useFlag } from "@unleash/proxy-client-react";
import { FeatureFlag } from "@/shared/types/feature-flags";

export type NavItemProps = {
    label: React.ReactText | React.ReactElement;
    plainTextLabel?: string;
    Icon?: React.ComponentType<React.SVGAttributes<SVGElement>>;
    ActiveIcon?: React.ComponentType<React.SVGAttributes<SVGElement>>;
    href: string;
    displayIf?: boolean;
    eggCount?: number;
    narrowMode: boolean;
    render?: (isOpen: boolean) => React.ReactNode;
};

export interface SidebarMenuProps {
    additionalNavItems?: NavItemProps[];
    defaultBookmarkedTags?: string[];
    narrowMode?: boolean;
}

export const NavItem: FunctionComponent<NavItemProps & { active: boolean }> = ({
    label,
    plainTextLabel,
    Icon,
    ActiveIcon,
    href,
    active,
    eggCount,
    narrowMode,
    render,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { enableNotificationCount } = useDisplayPrefs();

    const onClick = useCallback<React.MouseEventHandler<HTMLElement>>(
        (e) => {
            if (render) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        },
        [render]
    );

    // dumb hack for the rotating "saved tags" icon
    let extraIconClasses = "";

    if (render) {
        extraIconClasses += "transition-transform ";

        if (isOpen) {
            extraIconClasses += "rotate-180";
        }
    }

    return (
        <>
            <a href={href} onClick={onClick}>
                <li
                    className={classNames(
                        `flex flex-row items-center
                        gap-2 rounded-lg border border-transparent px-1 py-3
                        hover:border-accent hover:text-accent
                        lg:hover:border-sidebarAccent lg:hover:text-sidebarAccent`,
                        {
                            "font-bold": active,
                            "text-cherry-500 dark:text-mango-400":
                                active && narrowMode,
                        }
                    )}
                    title={plainTextLabel ?? label.toString()}
                >
                    <div className="relative">
                        {active && ActiveIcon ? (
                            <ActiveIcon
                                className={classNames(
                                    "inline-block h-6",
                                    extraIconClasses
                                )}
                            />
                        ) : Icon ? (
                            <Icon
                                className={classNames(
                                    "inline-block h-6",
                                    extraIconClasses
                                )}
                            />
                        ) : null}
                        {/* narrow mode: superimpose the notification count egg on the icon */}
                        {narrowMode && eggCount ? (
                            <TextEgg className="absolute -right-1 top-1 h-2 fill-sidebarAccent" />
                        ) : null}
                    </div>
                    {!narrowMode ? label : null}
                    {/* wide mode: display the notification count egg on the right side of the menu */}
                    {!narrowMode && eggCount ? (
                        <TextEgg className="ml-auto h-6 fill-sidebarAccent text-sidebarBg">
                            {enableNotificationCount
                                ? eggCount > 99
                                    ? "99+"
                                    : eggCount
                                : ""}
                        </TextEgg>
                    ) : null}
                </li>
            </a>
            {render ? render(isOpen) : null}
        </>
    );
};

const BookmarkedTags: FunctionComponent<{
    bookmarkedTags: BookmarksV1Types.ListTagsResp;
}> = ({ bookmarkedTags }) => (
    <ul className="my-1 ml-10">
        {bookmarkedTags.tags.map((tag) => (
            <li
                key={tag}
                className="hover:text-accent lg:hover:text-sidebarAccent"
            >
                <a href={sitemap.public.tags({ tagSlug: tag }).toString()}>
                    #{tag}
                </a>
            </li>
        ))}
    </ul>
);

const InnerMenu: FunctionComponent<
    SidebarMenuProps & {
        className: string;
        static: boolean;
        children?: React.ReactNode;
    }
> = ({
    additionalNavItems = [],
    defaultBookmarkedTags,
    className,
    narrowMode = false,
    ...props
}) => {
    const userInfo = useUserInfo();
    const displayPrefs = useDisplayPrefs();
    const currentProject = useCurrentProject();
    const reqMutableStore = useReqMutableStore();
    const ssrUrl = reqMutableStore.get("ssrUrl");
    const navItems: Array<Omit<NavItemProps, "narrowMode"> | null> = [
        ...additionalNavItems,
    ];
    const { isBrowser } = useSSR();

    const notificationCount = useNotificationCount();
    const followReqCount = useFollowRequestCount();
    const unreadAskCount = useUnreadAskCount();

    const { data: bookmarkedTags } = useBookmarkedTags(defaultBookmarkedTags);
    const savedTags = bookmarkedTags ?? { tags: defaultBookmarkedTags ?? [] };

    const hasCohostPlus = useHasCohostPlus();

    const artistAlleyListings = useFlag(
        FeatureFlag.Enum["artist-alley-listings"]
    );
    const shouldShowArtistAlley = artistAlleyListings;

    if (userInfo.loggedIn && currentProject) {
        navItems.push(
            {
                label: "dashboard",
                Icon: NewspaperIconOutline,
                ActiveIcon: NewspaperIconSolid,
                href: sitemap.public.dashboard().toString(),
                displayIf: displayPrefs.homeView === "following",
            },
            {
                label: "notifications",
                Icon: BellIConOutline,
                ActiveIcon: BellIconSolid,
                href: sitemap.public.project.notifications().toString(),
                eggCount: notificationCount?.count,
            },
            {
                label: "bookmarked tags",
                href: narrowMode
                    ? sitemap.public.bookmarkedTagFeed().toString()
                    : "#",
                Icon: TagIconOutline,
                displayIf: savedTags.tags.length > 0,
                render: narrowMode
                    ? undefined
                    : (isOpen) =>
                          isOpen ? (
                              <BookmarkedTags bookmarkedTags={savedTags} />
                          ) : null,
            },
            {
                label: "posts you've liked",
                Icon: HeartIconOutline,
                ActiveIcon: HeartIconSolid,
                href: sitemap.public.likedPosts({}).toString(),
            },
            {
                label: "artist alley",
                Icon: PaintBrushIconOutline,
                ActiveIcon: PaintBrushIconSolid,
                href: sitemap.public.artistAlley.home().toString(),
                displayIf: shouldShowArtistAlley,
            },
            {
                label: "search",
                href: sitemap.public.search().toString(),
                Icon: MagnifyingGlassIconOutline,
                ActiveIcon: MagnifyingGlassIconSolid,
            },
            {
                label: "profile",
                Icon: UserCircleIconOutline,
                ActiveIcon: UserCircleIconSolid,
                href: sitemap.public.project
                    .mainAppProfile({
                        projectHandle: currentProject.handle,
                    })
                    .toString(),
            },
            {
                label: "inbox",
                Icon: InboxIconOutline,
                ActiveIcon: InboxIconSolid,
                href: sitemap.public.project.inbox().toString(),
                displayIf: currentProject?.askSettings.enabled,
                eggCount: unreadAskCount.count ?? 0,
            },
            {
                label: "drafts",
                Icon: DocumentTextIconOutline,
                ActiveIcon: DocumentTextIconSolid,
                href: sitemap.public.project.unpublishedPosts().toString(),
            },
            {
                label: "following",
                Icon: UsersIconOutline,
                ActiveIcon: UsersIconSolid,
                href: sitemap.public.project.following().toString(),
                displayIf: displayPrefs.homeView === "dashboard",
            },
            {
                label: "followers",
                Icon: UserGroupIconOutline,
                ActiveIcon: UserGroupIconSolid,
                href: sitemap.public.project.followers().toString(),
            },
            {
                label: "follow requests",
                Icon: UserPlusIconOutline,
                ActiveIcon: UserPlusIconSolid,
                href: sitemap.public.project
                    .followRequests({ projectHandle: currentProject.handle })
                    .toString(),
                eggCount: followReqCount?.count,
                displayIf: currentProject?.privacy === ProjectPrivacy.Private,
            },
            {
                label: "settings",
                Icon: CogIconOutline,
                ActiveIcon: CogIconSolid,
                href: sitemap.public.userSettings().toString(),
            },
            {
                label: "help / report a bug",
                Icon: LifebuoyIconOutline,
                ActiveIcon: LifebuoyIconSolid,
                href: "https://help.antisoftware.club/support/home",
            },
            {
                label: (
                    <>
                        get cohost <em>Plus!</em>
                    </>
                ),
                plainTextLabel: "get cohost Plus!",
                Icon: KikiOutline,
                href: sitemap.public.subscriptions.manage().toString(),
                displayIf: !hasCohostPlus,
            }
        );
    }

    return (
        <Menu.Items static={props.static} as="ul" className={className}>
            {props.children}
            {navItems
                .filter(isTruthy)
                // note: if item.displayIf is undefined, we display it
                .filter((item) => item.displayIf !== false)
                .map((props) => (
                    <Suspense key={`${props.href}-${props.label.toString()}`}>
                        <Menu.Item
                            as={NavItem}
                            key={`${props.href}-${props.label.toString()}`}
                            {...props}
                            narrowMode={narrowMode}
                            active={
                                isBrowser
                                    ? props.href === window.location.toString()
                                    : props.href === ssrUrl
                            }
                        />
                    </Suspense>
                ))}
        </Menu.Items>
    );
};

export const SidebarMenu: FunctionComponent<SidebarMenuProps> = (props) => {
    const userInfo = useUserInfo();
    return (
        <Menu>
            <InnerMenu
                static={true}
                className={classNames(
                    "hidden h-fit flex-col rounded-lg bg-sidebarBg p-6 text-sidebarText lg:flex",
                    {
                        "cohost-shadow-light dark:cohost-shadow-dark dark:border dark:border-gray-700":
                            !(props.narrowMode ?? false),
                    }
                )}
                {...props}
            >
                {!userInfo.loggedIn ? (
                    <>
                        <Menu.Item as="li">
                            <a
                                href={sitemap.public.login().toString()}
                                className="cohost-shadow-dark my-3 flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-accent px-10 py-2 text-notBlack"
                            >
                                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                                <span className="font-bold leading-none">
                                    log in
                                </span>
                            </a>
                        </Menu.Item>
                        <Menu.Item as="li">
                            <a
                                href={sitemap.public.signup().toString()}
                                className="cohost-shadow-dark my-3 flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-notWhite px-10 py-2 text-notBlack"
                            >
                                <UserPlusIconOutline className="h-6 w-6" />
                                <span className="font-bold leading-none">
                                    sign up
                                </span>
                            </a>
                        </Menu.Item>
                    </>
                ) : null}
            </InnerMenu>
        </Menu>
    );
};

export const NavBarMenu: FunctionComponent<SidebarMenuProps> = (props) => {
    const notificationCount = useNotificationCount();
    const followReqCount = useFollowRequestCount();
    const totalCount = notificationCount.count + followReqCount.count;
    const currentProject = useCurrentProject();

    return (
        <Menu as="div" className="lg:hidden">
            <Menu.Button className="relative text-notWhite transition-transform ui-open:rotate-90 lg:hidden">
                {totalCount ? (
                    <TextEgg className="cohost-shadow-dark absolute -right-1 top-1 h-2 fill-accent" />
                ) : null}
                <Bars3Icon className="h-6 w-6" />
            </Menu.Button>
            <InnerMenu
                static={false}
                className="fixed bottom-0 left-0 top-16 flex w-[61.8%] min-w-fit flex-col divide-y divide-foreground-500 overflow-y-auto bg-foreground p-2 text-notWhite !outline-none lg:hidden"
                {...props}
            >
                {currentProject?.handle ? (
                    <Menu.Item as="li">
                        <a
                            href={sitemap.public.project
                                .composePost({
                                    projectHandle: currentProject.handle,
                                })
                                .toString()}
                            className="cohost-shadow-dark my-3 flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-accent px-10 py-2 text-notBlack"
                        >
                            <PencilIcon className="h-6 w-6" />
                            <span className="font-bold leading-none">
                                post!
                            </span>
                        </a>
                    </Menu.Item>
                ) : (
                    <>
                        <Menu.Item as="li">
                            <a
                                href={sitemap.public.login().toString()}
                                className="cohost-shadow-dark my-3 flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-accent px-10 py-2 text-notBlack"
                            >
                                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                                <span className="font-bold leading-none">
                                    log in
                                </span>
                            </a>
                        </Menu.Item>
                        <Menu.Item as="li">
                            <a
                                href={sitemap.public.signup().toString()}
                                className="cohost-shadow-dark my-3 flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-notWhite px-10 py-2 text-notBlack"
                            >
                                <UserPlusIconOutline className="h-6 w-6" />
                                <span className="font-bold leading-none">
                                    sign up
                                </span>
                            </a>
                        </Menu.Item>
                    </>
                )}
            </InnerMenu>
        </Menu>
    );
};
