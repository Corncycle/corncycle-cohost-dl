import { renderPostSummary } from "@/client/lib/markdown/post-rendering";
import sitemap from "@/shared/sitemap";
import {
    AttachmentViewBlock,
    getAttachmentViewBlocks,
    isAttachmentRowViewBlock,
    isAttachmentViewBlock,
} from "@/shared/types/post-blocks";
import { WireProjectModel } from "@/shared/types/projects";
import { WirePostViewModel } from "@/shared/types/wire-models";
import React, {
    cloneElement,
    FunctionComponent,
    isValidElement,
    ReactElement,
    useMemo,
} from "react";
import { Helmet } from "react-helmet-async";

/**
 * Needed to get around helmet still not supporting react fragmets for some reason.
 *
 * See: https://github.com/nfl/react-helmet/issues/342#issuecomment-432537982
 * for prior art.
 * @param fragment a fragment containing child vnodes. any non-vnodes are in the output!
 * @returns an array of vnodes, which helmet is fine with.
 */
function renderFragment(
    { props: { children } }: ReactElement<{ children: React.ReactNode }>,
    key: string
) {
    return React.Children.toArray(children)
        .filter(isValidElement)
        .map((child, childIndex) =>
            cloneElement(child, {
                key: `${key}-${childIndex}`,
            })
        );
}

export const PostOpenGraph: FunctionComponent<{
    viewModel: WirePostViewModel;
}> = ({ viewModel: initialViewModel }) => {
    const viewModel = useMemo(() => {
        if (!initialViewModel.transparentShareOfPostId) return initialViewModel;

        // if it's a transparent share, get the opaque post
        return (
            initialViewModel.shareTree.find(
                (vm) => vm.postId === initialViewModel.transparentShareOfPostId
                // this shouldn't happen but in the event we don't have a share
                // tree, return the initial view model as fallback.
            ) ?? initialViewModel
        );
    }, [initialViewModel]);

    const attachmentBlocks = useMemo(
        () => getAttachmentViewBlocks(viewModel.blocks),
        [viewModel.blocks]
    );

    const siteTitle = `${
        viewModel.postingProject.displayName
            ? viewModel.postingProject.displayName
            : `@${viewModel.postingProject.handle}`
    } on cohost`;

    return (
        <Helmet>
            {/* opengraph */}
            <meta property="og:site_name" content={siteTitle} />
            {viewModel.headline ? (
                <meta property="og:title" content={viewModel.headline} />
            ) : (
                <meta property="og:title" content={siteTitle} />
            )}
            <meta
                property="og:description"
                content={renderPostSummary(viewModel, {
                    myPost: false,
                    skipHeadline: true,
                })}
            />
            <meta property="og:type" content="article" />
            <meta
                property="article:published_time"
                content={viewModel.publishedAt}
            />
            <meta
                property="article:author"
                content={sitemap.public.project
                    .mainAppProfile({
                        projectHandle: viewModel.postingProject.handle,
                    })
                    .toString()}
            />
            <meta
                property="og:url"
                // we still want to link to the initial view model's single post
                // page in the event of a transparent share, as that's what the
                // user would have actually pasted in.
                content={initialViewModel.singlePostPageUrl.toString()}
            />
            <link
                href={initialViewModel.singlePostPageUrl.toString()}
                rel="alternate"
                type="application/activity+json"
            />
            {viewModel.tags.map((tag) => (
                <meta property="article:tag" content={tag} key={tag} />
            ))}

            {/* hide image previews if the post is 18+ or has any content warnings */}
            {!viewModel.effectiveAdultContent && viewModel.cws.length === 0
                ? attachmentBlocks.map((attachment) => {
                      switch (attachment.attachment.kind) {
                          case "image":
                              return (
                                  <meta
                                      key={attachment.attachment.attachmentId}
                                      property="og:image"
                                      content={attachment.attachment.fileURL}
                                  />
                              );
                          case "audio":
                              return (
                                  <meta
                                      key={attachment.attachment.attachmentId}
                                      property="og:audio"
                                      content={attachment.attachment.fileURL}
                                  />
                              );
                      }
                  })
                : null}

            {/* if we don't have any attachments, render the page's avatar */}
            {!attachmentBlocks.length ? (
                renderFragment(
                    <>
                        <meta
                            property="og:image"
                            content={viewModel.postingProject.avatarURL}
                        />
                        <meta
                            property="og:image:alt"
                            content={viewModel.postingProject.handle}
                        />
                        <meta property="og:image:width" content="128" />
                        <meta property="og:image:height" content="128" />
                        <meta property="twitter:card" content="summary" />
                    </>,
                    "avatar"
                )
            ) : (
                <meta property="twitter:card" content="summary_large_image" />
            )}
        </Helmet>
    );
};

export const ProjectOpenGraph: FunctionComponent<{
    project: WireProjectModel;
}> = ({ project }) => {
    const siteTitle = `${
        project.displayName ? project.displayName : `@${project.handle}`
    } on cohost`;

    return (
        <Helmet>
            {/* opengraph */}
            <meta property="og:site_name" content="cohost" />
            <meta property="og:title" content={siteTitle} />
            {project.dek ? (
                <meta property="og:description" content={project.dek} />
            ) : null}
            <meta property="og:type" content="profile" />
            {project.displayName ? (
                <meta
                    property="profile:first_name"
                    content={project.displayName}
                />
            ) : null}
            <meta property="profile:username" content={project.handle} />
            <meta
                property="og:url"
                content={sitemap.public.project
                    .mainAppProfile({
                        projectHandle: project.handle,
                    })
                    .toString()}
            />

            <meta property="og:image" content={project.avatarURL} />
            <meta property="og:image:alt" content={project.handle} />
            <meta property="og:image:width" content="128" />
            <meta property="og:image:height" content="128" />
            {/* twitter card */}
            <meta property="twitter:card" content="summary" />
        </Helmet>
    );
};

export const TagPageOpenGraph: FunctionComponent<{
    tagName: string;
}> = ({ tagName }) => {
    return (
        <Helmet>
            {/* opengraph */}
            <meta property="og:site_name" content="cohost" />
            <meta property="og:title" content={`#${tagName} on cohost`} />
            <meta
                property="og:description"
                content={`read more posts about #${tagName} on cohost`}
            />
            <meta property="og:type" content="website" />
            <meta
                property="og:url"
                content={sitemap.public.tags({ tagSlug: tagName }).toString()}
            />

            {/* twitter card */}
            <meta property="twitter:card" content="summary" />
        </Helmet>
    );
};
