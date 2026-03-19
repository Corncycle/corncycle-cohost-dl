import { sitemap } from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";
import PaginationEggs from "../partials/pagination-eggs";

type RefTimestampOffsetLimitPaginationMode = {
    mode: "refTimestampOffsetLimit";
    refTimestamp: number;
    currentSkip: number;
    morePagesForward: boolean;
    morePagesBackward: boolean;
    idealPageStride: number;
    pageUrlFactoryName: string;
    tagSlug?: string;
    projectHandle?: ProjectHandle;
};
type BeforeAfterLimitPaginationMode = {
    mode: "beforeAfterLimit";
    beforeTime: number | undefined;
    afterTime: number | undefined;
    pageUrlFactoryName: string;
    tagSlug?: string;
    projectHandle?: ProjectHandle;
};

export type PaginationMode =
    | { mode: false }
    | RefTimestampOffsetLimitPaginationMode
    | BeforeAfterLimitPaginationMode;

type PageUrlFactory<TOtherQueryParams = Record<string, never>> = (
    args?: {
        refTimestamp: number | undefined;
        skipPosts: number | undefined;
        tagSlug: string | undefined;
        projectHandle: ProjectHandle | undefined;
        afterTime: number | undefined;
        beforeTime: number | undefined;
    } & TOtherQueryParams
) => URL;

const getPageUrlFactory = <TOtherQueryParams,>(pageUrlFactoryName: string) => {
    return pageUrlFactoryName.split(".").reduce(
        // @ts-expect-error it's kind of impossible to type this correctly unfortunately
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (sitemap, key) => sitemap[key],
        sitemap.public
    ) as unknown as PageUrlFactory<TOtherQueryParams>;
};

//#region refTimestampOffsetLimit
interface RefTimestampOffsetLimitPaginationProps<TOtherQueryParams> {
    paginationMode: RefTimestampOffsetLimitPaginationMode;
    postsLength: number;
    otherQueryParams: TOtherQueryParams;
}

const RefTimestampOffsetLimitPagination = <TOtherQueryParams,>({
    paginationMode,
    postsLength,
    otherQueryParams,
}: RefTimestampOffsetLimitPaginationProps<TOtherQueryParams>) => {
    const pageUrlFactory = getPageUrlFactory<TOtherQueryParams>(
        paginationMode.pageUrlFactoryName
    );
    const paginationLinkForward = paginationMode.morePagesForward
        ? pageUrlFactory({
              refTimestamp: paginationMode.refTimestamp,
              skipPosts: paginationMode.currentSkip + postsLength,
              tagSlug: paginationMode.tagSlug,
              projectHandle: paginationMode.projectHandle,
              beforeTime: undefined,
              afterTime: undefined,
              ...otherQueryParams,
          }).toString()
        : undefined;

    let paginationLinkBack: string | undefined;

    if (paginationMode.morePagesBackward) {
        if (paginationMode.currentSkip <= paginationMode.idealPageStride) {
            // go back to the live feed
            paginationLinkBack = pageUrlFactory({
                tagSlug: paginationMode.tagSlug,
                refTimestamp: undefined,
                skipPosts: undefined,
                projectHandle: paginationMode.projectHandle,
                beforeTime: undefined,
                afterTime: undefined,
                ...otherQueryParams,
            }).toString();
        } else {
            // go back to a previous page of the backlog
            paginationLinkBack = pageUrlFactory({
                refTimestamp: paginationMode.refTimestamp,
                skipPosts: Math.max(
                    0,
                    paginationMode.currentSkip - paginationMode.idealPageStride
                ),
                tagSlug: paginationMode.tagSlug,
                projectHandle: paginationMode.projectHandle,
                beforeTime: undefined,
                afterTime: undefined,
                ...otherQueryParams,
            }).toString();
        }
    }

    return (
        <PaginationEggs
            backLink={paginationLinkBack}
            forwardLink={paginationLinkForward}
        />
    );
};
//#endregion

//#region beforeAfterLimit
interface BeforeAfterTimestampLimitPaginationArgs<TOtherQueryParams> {
    paginationMode: BeforeAfterLimitPaginationMode;
    otherQueryParams: TOtherQueryParams;
}

const BeforeAfterTimestampLimitPagination = <TOtherQueryParams,>({
    paginationMode,
    otherQueryParams,
}: BeforeAfterTimestampLimitPaginationArgs<TOtherQueryParams>) => {
    const pageUrlFactory = getPageUrlFactory(paginationMode.pageUrlFactoryName);
    const paginationLinkForward = paginationMode.beforeTime
        ? pageUrlFactory({
              refTimestamp: undefined,
              skipPosts: undefined,
              tagSlug: paginationMode.tagSlug,
              projectHandle: paginationMode.projectHandle,
              beforeTime: paginationMode.beforeTime,
              afterTime: undefined,
              ...otherQueryParams,
          }).toString()
        : undefined;

    const paginationLinkBack = paginationMode.afterTime
        ? pageUrlFactory({
              refTimestamp: undefined,
              skipPosts: undefined,
              tagSlug: paginationMode.tagSlug,
              projectHandle: paginationMode.projectHandle,
              beforeTime: undefined,
              afterTime: paginationMode.afterTime,
              ...otherQueryParams,
          }).toString()
        : undefined;

    return (
        <PaginationEggs
            backLink={paginationLinkBack}
            forwardLink={paginationLinkForward}
        />
    );
};
//#endregion

interface ProjectPostFeedPaginationProps<TOtherQueryParams> {
    paginationMode: PaginationMode;
    postsLength: number;
    otherQueryParams: TOtherQueryParams;
}

export const ProjectPostFeedPagination = <TOtherQueryParams,>({
    paginationMode,
    postsLength,
    otherQueryParams,
}: ProjectPostFeedPaginationProps<TOtherQueryParams>) => {
    if (paginationMode.mode === "refTimestampOffsetLimit") {
        return (
            <RefTimestampOffsetLimitPagination
                paginationMode={paginationMode}
                postsLength={postsLength}
                otherQueryParams={otherQueryParams}
            />
        );
    } else if (paginationMode.mode === "beforeAfterLimit") {
        return (
            <BeforeAfterTimestampLimitPagination
                paginationMode={paginationMode}
                otherQueryParams={otherQueryParams}
            />
        );
    }

    return null;
};
