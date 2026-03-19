import { trpc } from "@/client/lib/trpc";
import { DisplayPrefs } from "@/shared/types/display-prefs";
import { AskId, PostId, ProjectHandle } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useUserInfo } from "../../providers/user-info-provider";
import { PostComposerContainer } from "../composer/container";
import { useDynamicTheme } from "../../hooks/dynamic-theme";

type ProjectPostComposerProps = {
    editingPostId?: PostId;
    project: WireProjectModel;
    shareOf?: { postId: PostId; handle: ProjectHandle };
    alreadyPublished: boolean;
    finishedRedirect?: string;
    displayPrefs: DisplayPrefs;
    responseToAskId?: AskId;
};

export const ProjectPostComposer: FunctionComponent<
    ProjectPostComposerProps
> = (props) => {
    const { project, shareOf, finishedRedirect, responseToAskId } = props;
    const theme = useDynamicTheme();

    const { data: postComposerSettings } =
        trpc.posts.postComposerSettings.useQuery(
            { editingPostId: props.editingPostId },
            {
                suspense: true,
            }
        );

    const { activated } = useUserInfo();
    const canPost = useMemo(() => activated || !!shareOf, [activated, shareOf]);

    const pageTitle = useMemo(() => {
        if (props.editingPostId) {
            return "go ahead, edit a post";
        }

        if (props.shareOf) {
            return "go ahead, share a post";
        }

        return "go ahead, make a post";
    }, [props.editingPostId, props.shareOf]);

    return (
        <>
            <Helmet title={pageTitle} />
            <div
                className="co-themed-box container mx-auto mt-8 flex max-w-3xl flex-grow flex-col gap-6"
                data-theme={theme.current}
            >
                {canPost ? (
                    <PostComposerContainer
                        initialPost={postComposerSettings?.editingPost}
                        project={project}
                        shareOf={shareOf}
                        initialAdultContent={
                            postComposerSettings?.defaultAdultContent ?? false
                        }
                        finishedRedirect={finishedRedirect}
                        tags={postComposerSettings?.defaultTags ?? []}
                        cws={postComposerSettings?.defaultCws ?? []}
                        responseToAskId={responseToAskId}
                    />
                ) : (
                    <div className="cohost-shadow-light dark:cohost-shadow-dark prose mx-auto w-full max-w-full rounded-lg bg-notWhite p-3">
                        <p>
                            Since your account isn't activated yet, you can't
                            post anything new. You can read more about this on{" "}
                            <a
                                href="https://help.antisoftware.club/support/solutions/articles/62000224749-details-on-invites-and-the-restrictions-on-un-activated-accounts/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                our support site.
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProjectPostComposer;
ProjectPostComposer.displayName = "project-post-composer";
