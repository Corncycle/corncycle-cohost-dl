import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { ProjectId } from "@/shared/types/ids";
import { Menu } from "@headlessui/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import React, {
    Fragment,
    FunctionComponent,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { BasicButton } from "../../elements/basic-button";
import { MeatballMenuItem } from "../../elements/meatball-menu-item";
import { SwitchButton } from "../../elements/switch-button";
import { PushpinIcon } from "../../icons/pushpin";
import { Loading } from "../../loading";
import { type ReaderProjectData } from "../../pages/cohost-reader";
import { PaginatedProfilePostFeed } from "../project-page/paginated-profile-post-feed";

type CohostReaderFeedPaneProps = {
    activeProject: ReaderProjectData | undefined;
};

const CohostReaderFeedPane: FunctionComponent<CohostReaderFeedPaneProps> = (
    props
) => {
    const [showShares, setShowShares] = useState(true);
    const [showReplies, setShowReplies] = useState(true);
    const [showAsks, setShowAsks] = useState(true);
    const [pinnedPostsAtTop, setPinnedPostsAtTop] = useState(false);

    // scroll back to the top of the feed pane when the active project changes.
    //
    // just using a plain useEffect() triggered on project change, and
    // a ref to the scrolling pane, doesn't work here because the useEffect()
    // resolves while the suspense fallback is up and the ref is null.
    //
    // use a solution patterned after https://stackoverflow.com/a/60476525 to
    // "arm" a scroll, and then fire it once the ref becomes non-null again
    const [waitingToScroll, setWaitingToScroll] = useState(false);

    useEffect(() => {
        setWaitingToScroll(true);
    }, [props.activeProject]);

    const scrollToTopIfPending = useCallback(
        (node: HTMLElement | null) => {
            if (waitingToScroll && node) {
                node.scrollTo(0, 0);
                setWaitingToScroll(false);
            }
        },
        [waitingToScroll]
    );

    const pinProject = trpc.projects.followedFeed.pinProject.useMutation();
    const unpinProject = trpc.projects.followedFeed.unpinProject.useMutation();
    const utils = trpc.useContext();

    const isPinned = trpc.projects.followedFeed.isPinned.useQuery(
        {
            projectId:
                props.activeProject?.project.projectId ?? (-99999 as ProjectId),
        },
        {
            enabled: !!props.activeProject,
            initialData: props.activeProject?.pinned,
        }
    );

    const onPin = async () => {
        if (!props.activeProject) return;

        await pinProject.mutateAsync({
            projectId: props.activeProject.project.projectId,
        });
        await utils.projects.followedFeed.query.invalidate();
        await utils.projects.followedFeed.isPinned.invalidate({
            projectId: props.activeProject.project.projectId,
        });
    };

    const onUnpin = async () => {
        if (!props.activeProject) return;

        await unpinProject.mutateAsync({
            projectId: props.activeProject.project.projectId,
        });
        await utils.projects.followedFeed.query.invalidate();
        await utils.projects.followedFeed.isPinned.invalidate({
            projectId: props.activeProject.project.projectId,
        });
    };

    const profileUrl = props.activeProject
        ? sitemap.public.project
              .mainAppProfile({
                  projectHandle: props.activeProject.project.handle,
              })
              .toString()
        : "";

    return (
        <div className="flex flex-grow flex-col [flex-basis:40%]">
            <Suspense fallback={<Loading className="mx-auto my-auto" />}>
                {props.activeProject ? (
                    <>
                        <div className="flex flex-row justify-end gap-3 p-4">
                            <SwitchButton
                                buttonSize="small"
                                label="pins at top"
                                onChange={(value) => setPinnedPostsAtTop(value)}
                                initial={pinnedPostsAtTop}
                            />

                            <SwitchButton
                                buttonSize="small"
                                label="show shares"
                                onChange={(value) => setShowShares(value)}
                                initial={showShares}
                            />

                            <SwitchButton
                                buttonSize="small"
                                label="show replies"
                                onChange={(value) => setShowReplies(value)}
                                initial={showReplies}
                            />

                            <SwitchButton
                                buttonSize="small"
                                label="show asks"
                                onChange={(value) => setShowAsks(value)}
                                initial={showAsks}
                            />

                            {props.activeProject.project.askSettings.enabled ? (
                                <BasicButton
                                    as="a"
                                    buttonColor="cherry"
                                    buttonSize="small"
                                    href={sitemap.public.project
                                        .ask({
                                            projectHandle:
                                                props.activeProject.project
                                                    .handle,
                                        })
                                        .toString()}
                                >
                                    ask
                                </BasicButton>
                            ) : null}

                            <Menu as="div" className="relative">
                                <Menu.Button as={Fragment}>
                                    {({ open }) => {
                                        const extraClasses = open
                                            ? "bg-cherry-700"
                                            : "";

                                        return (
                                            <BasicButton
                                                buttonColor="cherry"
                                                buttonSize="small"
                                                extraClasses={extraClasses}
                                            >
                                                manage
                                            </BasicButton>
                                        );
                                    }}
                                </Menu.Button>
                                <Menu.Items className="cohost-shadow-dark absolute right-0 top-12 z-30 flex min-w-max flex-col gap-3 rounded-lg bg-notWhite p-3 text-notBlack focus:!outline-none">
                                    {isPinned.data ? (
                                        <Menu.Item>
                                            <MeatballMenuItem
                                                ItemIcon={PushpinIcon}
                                                disabled={isPinned.isFetching}
                                                text="unpin from following view"
                                                onClick={onUnpin}
                                            />
                                        </Menu.Item>
                                    ) : (
                                        <Menu.Item>
                                            <MeatballMenuItem
                                                ItemIcon={PushpinIcon}
                                                disabled={isPinned.isFetching}
                                                text="pin to following view"
                                                onClick={onPin}
                                            />
                                        </Menu.Item>
                                    )}
                                    <Menu.Item>
                                        <MeatballMenuItem
                                            as="a"
                                            ItemIcon={ArrowRightOnRectangleIcon}
                                            text="go to profile"
                                            href={profileUrl}
                                        />
                                    </Menu.Item>
                                </Menu.Items>
                            </Menu>
                        </div>
                        <div
                            className="flex flex-col items-center overflow-y-auto"
                            ref={scrollToTopIfPending}
                        >
                            <PaginatedProfilePostFeed
                                handle={props.activeProject.project.handle}
                                pinnedPostsAtTop={pinnedPostsAtTop}
                                hideReplies={!showReplies}
                                hideShares={!showShares}
                                hideAsks={!showAsks}
                                keepPreviousData={false}
                            />
                        </div>
                    </>
                ) : null}
            </Suspense>
        </div>
    );
};

CohostReaderFeedPane.displayName = "CohostReaderFeedPane";

export default CohostReaderFeedPane;
