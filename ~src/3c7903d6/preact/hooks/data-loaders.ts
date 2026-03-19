import { trpc } from "@/client/lib/trpc";
import { ProjectHandle } from "@/shared/types/ids";
import axios from "axios";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useUserInfo } from "../providers/user-info-provider";
import { useEditedProjects } from "./use-edited-projects";

/**
 * Generic swr fetcher using axios
 * @param url
 * @returns
 */
export const axiosFetcher = <T>(url: string) =>
    axios.get<T>(url).then((res) => res.data);

type DataLoaderReturn<T> = {
    isLoading: boolean;
    data: T | undefined;
};

export const useDataLoader = <T>(
    url: string,
    providedOnError?: (e: any) => void
): DataLoaderReturn<T> => {
    const [data, setData] = useState<T>();
    const isLoading = useRef(false);

    const onError = useCallback(
        (e: any) => {
            if (providedOnError) providedOnError(e);
            else throw e;
        },
        [providedOnError]
    );

    useEffect(() => {
        if (isLoading.current) return;

        isLoading.current = true;
        axios
            .get<T>(url)
            .then((resp) => {
                isLoading.current = false;
                setData(resp.data);
            })
            .catch(onError);
    }, [url, onError]);

    return {
        isLoading: isLoading.current,
        data,
    };
};

export const useNotificationCount = ({
    projectHandle,
}: { projectHandle?: ProjectHandle } = {}) => {
    const { loggedIn } = useUserInfo();
    const currentProject = useCurrentProject();
    const { data: notificationCount } = trpc.notifications.count.useQuery(
        { projectHandle: projectHandle ?? currentProject?.handle ?? undefined },
        {
            refetchInterval: 1000 * 30, // 30 seconds
            enabled: loggedIn,
            notifyOnChangeProps: ["data"],
            placeholderData: {
                count: 0,
            },
        }
    );
    return notificationCount ?? { count: 0 };
};

export const useFollowRequestCount = ({
    projectHandle,
}: { projectHandle?: ProjectHandle } = {}) => {
    const { loggedIn } = useUserInfo();
    const currentProject = useCurrentProject();
    const { data: followReqCount } =
        trpc.relationships.countFollowRequests.useQuery(
            {
                projectHandle:
                    projectHandle ?? currentProject?.handle ?? undefined,
            },
            {
                refetchInterval: 1000 * 30, // 30 seconds
                enabled: loggedIn,
                notifyOnChangeProps: ["data"],
                placeholderData: {
                    count: 0,
                },
            }
        );
    return followReqCount ?? { count: 0 };
};

export const useUnreadAskCount = ({
    projectHandle,
}: { projectHandle?: ProjectHandle } = {}) => {
    const { loggedIn } = useUserInfo();
    const currentProject = useCurrentProject();
    const { data: unreadCount } = trpc.asks.unreadCount.useQuery(
        {
            projectHandle: projectHandle ?? currentProject?.handle ?? undefined,
        },
        {
            refetchInterval: 1000 * 30, // 30 seconds
            enabled: loggedIn,
            notifyOnChangeProps: ["data"],
            placeholderData: {
                count: 0,
            },
        }
    );
    return unreadCount ?? { count: 0 };
};

export const useBookmarkedTags = (defaults?: string[], enabled = true) => {
    const { loggedIn } = useUserInfo();
    return trpc.bookmarks.tags.list.useQuery(undefined, {
        placeholderData: defaults ? { tags: defaults } : undefined,
        suspense: true,
        enabled: enabled && loggedIn,
    });
};

export const useCurrentProject = () => {
    const { projectId } = useUserInfo();
    const { projects } = useEditedProjects();
    const currentProject = useMemo(
        () => projects.find((project) => project.projectId === projectId),
        [projectId, projects]
    );
    return currentProject;
};

export const useHasCohostPlus = () => {
    return (
        trpc.subscriptions.hasActiveSubscription.useQuery(undefined, {
            suspense: true,
            notifyOnChangeProps: ["data", "error"],
        }).data ?? false
    );
};
