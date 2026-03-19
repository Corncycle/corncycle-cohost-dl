import { renderPostSummary } from "@/client/lib/markdown/post-rendering";
import { trpc } from "@/client/lib/trpc";
import { FriendlyTimestamp } from "@/client/preact/components/friendly-timestamp";
import { ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import {
    FollowedProjectFeedSortOrder,
    WirePostViewModel,
} from "@/shared/types/wire-models";
import { Listbox } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import _ from "lodash";
import { default as React, FunctionComponent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BasicButton } from "../../elements/basic-button";
import { PushpinIcon } from "../../icons/pushpin";
import { SolidEgg } from "../../icons/solid-egg";
import { type ReaderProjectData } from "../../pages/cohost-reader";
import { ProjectAvatar } from "../project-avatar";

type CohostReaderProjectListProps = {
    activateProject: (project: ReaderProjectData) => void;
    initialTimestamp: number;
};

const sortOrderOptions = new Map<FollowedProjectFeedSortOrder, string>([
    ["recently-posted", "sort by last post"],
    ["followed-asc", "sort by follow date (old\u2013new)"],
    ["followed-desc", "sort by follow date (new\u2013old)"],
    ["alpha-asc", "sort by handle (A\u2013Z)"],
    ["alpha-desc", "sort by handle (Z\u2013A)"],
]);

const CohostReaderProjectListItem: FunctionComponent<{
    project: WireProjectModel;
    pinned: boolean;
    selected: boolean;
    latestPost: WirePostViewModel | null;
    onClick: () => void;
}> = (props) => {
    const { t } = useTranslation();
    const summary = useMemo(() => {
        if (!props.latestPost) return "";

        const rawSummary =
            renderPostSummary(props.latestPost, {
                myPost: false,
            }) || t("client:notifications.empty-post-summary", "[no text]");

        return rawSummary.length > 60 ? rawSummary.slice(0, 60) : rawSummary;
    }, [props.latestPost, t]);

    return (
        <button
            type="button"
            className={classNames(
                {
                    "bg-longan-300 dark:bg-cherry-700": props.selected,
                },
                "flex w-full flex-row items-center gap-1 py-3 pl-3 pr-1 text-left"
            )}
            onClick={props.onClick}
        >
            <ProjectAvatar
                className="cohost-shadow-light dark:cohost-shadow-dark mx-[0.75rem] block h-[3.75rem] w-[3.75rem]"
                project={props.project}
                noLink={true}
            />
            <div className="items-left flex flex-1 flex-col overflow-hidden whitespace-nowrap text-notBlack dark:text-notWhite">
                <div className="overflow-hidden overflow-ellipsis font-bold">
                    {props.project.displayName}
                </div>
                <div className="overflow-hidden overflow-ellipsis">
                    @{props.project.handle}
                </div>
                {props.latestPost ? (
                    <div className="overflow-hidden overflow-ellipsis">
                        {props.latestPost.publishedAt ? (
                            <span className="font-bold text-cherry-600 dark:text-mango-400">
                                <FriendlyTimestamp
                                    dateISO={props.latestPost.publishedAt}
                                    className="font-bold text-cherry-600 dark:text-mango-400"
                                />
                                :&nbsp;
                            </span>
                        ) : null}
                        {summary}
                    </div>
                ) : null}
            </div>
            {props.pinned ? (
                <PushpinIcon className="h-6 w-6 self-start" />
            ) : null}
        </button>
    );
};

const CohostReaderProjectList: FunctionComponent<
    CohostReaderProjectListProps
> = (props) => {
    const { t } = useTranslation();
    const [selectedProjectId, setSelectedProjectId] =
        useState<ProjectId | null>(null);
    const [sortOrder, setSortOrder] =
        useState<FollowedProjectFeedSortOrder>("recently-posted");
    const [asOfTimestamp, setAsOfTimestamp] = useState<number>(
        props.initialTimestamp
    );
    const feedQuery = trpc.projects.followedFeed.query.useInfiniteQuery(
        {
            sortOrder,
            limit: 20,
            beforeTimestamp: asOfTimestamp,
        },
        {
            suspense: true,
            staleTime: Infinity,
            keepPreviousData: true,
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        }
    );

    // only need to check for live updates if the feed is in recently posted
    // mode
    const feedHasUpdated = trpc.projects.followedFeed.hasUpdated.useQuery(
        {
            timestamp: asOfTimestamp,
        },
        { enabled: sortOrder === "recently-posted" }
    );

    const refreshList = () => {
        // changing this parameter automatically invalidates the feedQuery +
        // feedHasUpdated queries, so no need to do that
        setAsOfTimestamp(Date.now());
    };

    const projects = feedQuery.data
        ? _.concat(...feedQuery.data.pages.map((group) => group.projects))
        : [];

    const emptyLabel = t(
        "client:following.empty",
        "You're not currently following any pages."
    );

    const dropDownClasses =
        "bg-longan-300 dark:bg-cherry-700 group-hover:bg-longan-400 ui-open:bg-longan-500 dark:group-hover:bg-cherry-600 dark:ui-open:bg-cherry-600 text-notBlack dark:text-notWhite";

    return (
        <div className="relative flex w-full flex-grow flex-col overflow-y-auto bg-notWhite [flex-basis:20%] [scrollbar-gutter:stable] dark:bg-notBlack">
            <div className="flex flex-row items-center p-4">
                {/* only show the refresh button if the user is in recently posted mode */}
                {sortOrder === "recently-posted" ? (
                    <BasicButton
                        buttonSize="regular"
                        buttonColor="theme-sensitive-1"
                        disabled={feedQuery.isFetching}
                        onClick={refreshList}
                        extraClasses="relative"
                    >
                        refresh
                        {feedHasUpdated.data ? (
                            <SolidEgg className="absolute -right-1 -top-1 h-4 w-4 text-cherry dark:text-mango" />
                        ) : null}
                    </BasicButton>
                ) : null}

                <div className="flex-1">&nbsp;</div>

                <Listbox
                    value={sortOrder}
                    onChange={(value) =>
                        setSortOrder(value as FollowedProjectFeedSortOrder)
                    }
                >
                    <Listbox.Button className="group flex flex-row items-center gap-1 self-end">
                        <div
                            className={classNames(
                                "flex h-10 flex-row items-center gap-3 rounded-l-lg px-2",
                                dropDownClasses
                            )}
                        >
                            {sortOrderOptions.get(sortOrder)}
                        </div>
                        <div
                            className={classNames(
                                "block rounded-r-lg p-2",
                                dropDownClasses
                            )}
                        >
                            <ChevronDownIcon className="h-6 w-6 transition-transform ui-open:rotate-180" />
                        </div>
                    </Listbox.Button>

                    <Listbox.Options className="cohost-shadow-light dark:cohost-shadow-dark absolute right-4 top-16 w-fit rounded-lg bg-notWhite text-notBlack">
                        {Array.from(sortOrderOptions, ([id, uiText]) => (
                            <Listbox.Option
                                className="rounded-lg px-2 py-1 hover:bg-longan-300"
                                key={id}
                                value={id}
                            >
                                <button>{uiText}</button>
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Listbox>
            </div>

            {feedQuery.isSuccess && projects.length === 0 ? (
                <div className="text-center">{emptyLabel}</div>
            ) : (
                <ul>
                    {projects.map((item) => {
                        return (
                            <li key={item.project.projectId}>
                                <CohostReaderProjectListItem
                                    project={item.project}
                                    pinned={item.projectPinned}
                                    selected={
                                        item.project.projectId ===
                                        selectedProjectId
                                    }
                                    latestPost={item.latestPost}
                                    onClick={() => {
                                        setSelectedProjectId(
                                            item.project.projectId
                                        );
                                        props.activateProject({
                                            project: item.project,
                                            pinned: item.projectPinned,
                                        });
                                    }}
                                />
                            </li>
                        );
                    })}

                    {feedQuery.hasNextPage && !feedQuery.isFetching ? (
                        <li className="flex flex-row justify-center">
                            <button
                                className="flex flex-row gap-3 p-3 font-bold text-notBlack dark:text-notWhite"
                                type="button"
                                onClick={() => feedQuery.fetchNextPage()}
                            >
                                <PlusIcon className="h-6 w-6" />
                                load more
                            </button>
                        </li>
                    ) : null}
                </ul>
            )}
        </div>
    );
};

export default CohostReaderProjectList;
