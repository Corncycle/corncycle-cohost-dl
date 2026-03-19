import { GetProjectListResp } from "@/shared/api-types/projects-v1";
import sitemap from "@/shared/sitemap";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import type { SWRInfiniteKeyLoader } from "swr/infinite";
import useSWRInfinite from "swr/infinite";
import { axiosFetcher } from "../../hooks/data-loaders";
import ProjectListPage from "./project-list";

type FollowersListPageProps = {
    initialProjects: WireProjectModel[];
};

const PAGE_SIZE = 10;

const getKey: SWRInfiniteKeyLoader = (
    pageIndex,
    previousPageData: GetProjectListResp | null
) => {
    if (previousPageData && previousPageData.projects.length < PAGE_SIZE)
        return null;

    return sitemap.public.apiV1.projects
        .followers({ offset: pageIndex * PAGE_SIZE, limit: PAGE_SIZE })
        .toString();
};

const FollowersListPage: FunctionComponent<FollowersListPageProps> = ({
    initialProjects,
}) => {
    const { t } = useTranslation();

    const emptyLabel = t(
        "client:followers.empty",
        "You don't currently have any followers."
    );
    const headerLabel = t("client:followers.header", "Followers");

    const { data, size, setSize } = useSWRInfinite<GetProjectListResp>(
        getKey,
        axiosFetcher,
        {
            fallbackData: [
                {
                    projects: initialProjects,
                },
            ],
        }
    );

    // get around a typing issue
    const pages = useMemo(
        () => data ?? [{ projects: initialProjects }],
        [data, initialProjects]
    );

    const projects = useMemo(
        () =>
            pages.reduce((collector, curr) => {
                return [...collector, ...curr.projects];
            }, [] as WireProjectModel[]),
        [pages]
    );

    const loadMore = useCallback(() => {
        void setSize(size + 1);
    }, [size, setSize]);
    const isLastPage = pages[pages.length - 1].projects.length < PAGE_SIZE;

    return (
        <>
            <Helmet title="followers" />
            <ProjectListPage
                projects={projects}
                emptyLabel={emptyLabel}
                headerLabel={headerLabel}
                loadMore={loadMore}
                isLastPage={isLastPage}
            />
        </>
    );
};

export default FollowersListPage;
