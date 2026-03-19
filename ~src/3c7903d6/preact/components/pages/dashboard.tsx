import { useModalPostComposer } from "@/client/preact/components/modal-post-composer-context";
import { PostPreview } from "@/client/preact/components/posts/post-preview";
import { SidebarMenu } from "@/client/preact/components/sidebar-menu";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import sitemap from "@/shared/sitemap";
import { PostId } from "@/shared/types/ids";
import { DashboardWireFormat } from "@/shared/types/live-dashboard";
import { WireProjectModel } from "@/shared/types/projects";
import { WirePostViewModel } from "@/shared/types/wire-models";
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Helmet } from "react-helmet-async";
import RenderIfVisible from "react-render-if-visible";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { TextEgg } from "../icons/text-egg";
import { CohostCorner } from "../partials/cohost-corner";
import { PaginationEggs } from "../partials/pagination-eggs";
import { SuggestedFollows } from "../partials/suggested-follows";
import { TimelineSwitch } from "../partials/timeline-switch";

export interface DashboardProps {
    posts: WirePostViewModel[];
    project: WireProjectModel;
    staffProjects: WireProjectModel[];
    refTimestamp: number;
}

const ENDPOINT = "/rc/dashboard/event-stream";

type PostDisplayData = {
    post: WirePostViewModel;
    displayed: boolean;
};

export const Dashboard: FunctionComponent<DashboardProps> = ({
    posts: initialPosts,
    staffProjects,
    project,
    refTimestamp,
}) => {
    const displayPrefs = useDisplayPrefs();
    const userInfo = useUserInfo();

    const [hiddenPostCountButton, setHiddenPostCountButton] =
        useState<HTMLElement | null>(null);

    const [posts, setPosts] = useState(
        new Map<PostId, PostDisplayData>(
            initialPosts.map((post) => [post.postId, { post, displayed: true }])
        )
    );
    const eventSource = useRef<EventSource>();

    useEffect(() => {
        eventSource.current = new EventSource(ENDPOINT);
    }, []);

    const oldestPostTimestamp = useMemo(
        () =>
            [...posts.values()].reduce((accum, pdd) => {
                if (!pdd.post.publishedAt) return accum;

                const thisPDDTimestamp = new Date(
                    pdd.post.publishedAt
                ).getTime();

                return thisPDDTimestamp < accum ? thisPDDTimestamp : accum;
            }, Date.now()),
        [posts]
    );

    const addPost = useCallback(
        (postData: WirePostViewModel) => {
            if (!postData.publishedAt) return;

            // we get add-post notifications for edits of posts on the TL
            // regardless of when they were originally posted; to reduce the
            // ghost post issue, silently drop add-post notifications if the
            // post is older than the oldest visible post
            if (
                new Date(postData.publishedAt).getTime() < oldestPostTimestamp
            ) {
                return;
            }

            const existingPDD = posts.get(postData.postId);

            setPosts(
                new Map(
                    posts.set(postData.postId, {
                        post: postData,
                        displayed: existingPDD ? existingPDD.displayed : false,
                    })
                )
            );
        },
        [posts, setPosts, oldestPostTimestamp]
    );

    const removePost = useCallback(
        (postId: PostId) => {
            setPosts((posts) => {
                if (!posts.delete(postId)) {
                    console.warn(`couldn't find post ${postId} to delete`);
                }

                return new Map(posts);
            });
        },
        [setPosts]
    );

    const handleShowPostsClicked = () => {
        const newPosts: Map<PostId, PostDisplayData> = new Map();

        for (const pdd of posts.values()) {
            newPosts.set(pdd.post.postId, { post: pdd.post, displayed: true });
        }

        setPosts(newPosts);
    };

    const postTimeline = useMemo(
        () =>
            [...posts.values()]
                .filter((pdd) => pdd.displayed)
                .sort(
                    (pdd1, pdd2) =>
                        new Date(pdd2.post.publishedAt ?? 0).getTime() -
                        new Date(pdd1.post.publishedAt ?? 0).getTime()
                )
                .map((pdd) => pdd.post),
        [posts]
    );

    const hiddenPostCount = useMemo(
        () => [...posts.values()].filter((pdd) => !pdd.displayed).length,
        [posts]
    );

    const handleMessage = useCallback(
        (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data) as DashboardWireFormat;

            if (data.clear) {
                setPosts(new Map());
            }

            for (const postData of data.add) {
                addPost(postData);
            }

            for (const postId of data.remove) {
                removePost(postId);
            }
        },
        [addPost, removePost]
    );

    useEffect(() => {
        eventSource.current?.addEventListener("message", handleMessage);

        return () =>
            eventSource.current?.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    const modalPostComposer = useModalPostComposer();
    useEffect(() => {
        modalPostComposer.setup({
            project,
        });
    }, [modalPostComposer, project]);

    useEffect(() => {
        // maintain relative scroll position when the "load post" button is added
        const hiddenPostCountHeight = hiddenPostCountButton?.offsetHeight ?? 0;

        window.scrollBy(0, -hiddenPostCountHeight);
    }, [hiddenPostCountButton?.offsetHeight]);

    return (
        <>
            <Helmet title="home" />
            <main className="w-full lg:pt-16">
                <div className="container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                    <SidebarMenu />
                    <section
                        id="live-dashboard"
                        data-endpoint={ENDPOINT}
                        className="col-span-1 flex flex-col lg:col-span-2"
                    >
                        <div className="mb-2 flex flex-row items-center">
                            {/* avatar spacer on desktop */}
                            <span className="hidden w-[5.5em] lg:block" />
                            <TimelineSwitch
                                tabs={[
                                    {
                                        label: "latest posts",
                                        href: sitemap.public
                                            .dashboard()
                                            .toString(),
                                        active: true,
                                    },
                                    {
                                        label: "bookmarked tags",
                                        href: sitemap.public
                                            .bookmarkedTagFeed()
                                            .toString(),
                                    },
                                ]}
                            />
                        </div>

                        <div className="flex flex-col gap-12">
                            {hiddenPostCount > 0 ? (
                                <button
                                    className="cohost-shadow-light flex w-full flex-row items-center rounded-lg bg-longan-300 p-3 text-notBlack"
                                    onClick={handleShowPostsClicked}
                                    ref={setHiddenPostCountButton}
                                >
                                    <TextEgg className="mr-3 w-10 fill-cherry text-notWhite">
                                        {hiddenPostCount}
                                    </TextEgg>
                                    new posts! click here to view them.
                                </button>
                            ) : null}

                            {postTimeline.length
                                ? postTimeline.map((post, index) => (
                                      <RenderIfVisible
                                          key={post.postId}
                                          initialVisible={index < 4}
                                          stayRendered={true}
                                      >
                                          <PostPreview
                                              viewModel={post}
                                              highlightedTags={[]}
                                              displayPrefs={displayPrefs}
                                          />
                                      </RenderIfVisible>
                                  ))
                                : null}
                            {!displayPrefs.suggestedFollowsDismissed ? (
                                <SuggestedFollows
                                    noPosts={!postTimeline.length}
                                    staffProjects={staffProjects}
                                />
                            ) : null}
                            <PaginationEggs
                                backLink={undefined}
                                forwardLink={sitemap.public
                                    .dashboard({ refTimestamp, skipPosts: 0 })
                                    .toString()}
                            />
                        </div>
                    </section>
                    <CohostCorner />
                </div>
            </main>
        </>
    );
};

Dashboard.displayName = "dashboard";
export default Dashboard;
