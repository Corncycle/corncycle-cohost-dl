import { trpc } from "@/client/lib/trpc";
import { ProjectId } from "@/shared/types/ids";
import { ProjectPrivacy } from "@/shared/types/projects";
import {
    FollowingState,
    FollowingStateEnum,
} from "@/shared/types/relationships";
import { WireProjectModel } from "@/shared/types/projects";
import { UseTRPCMutationOptions } from "@trpc/react-query/dist/shared";
import React, {
    FunctionComponent,
    Suspense,
    useCallback,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useUserInfo } from "../../providers/user-info-provider";
import {
    Button,
    SharedProps as ButtonProps,
    LinkButton,
} from "../elements/button";
import sitemap from "@/shared/sitemap";
import { useReqMutableStore } from "../../providers/req-mutable-store";
import { SimpleModalDialog } from "@/client/preact/components/elements/simple-modal-dialog";

type FollowButtonProps = {
    project: WireProjectModel;
    onFollow?: (newFollowingState: FollowingState) => void;
    color: ButtonProps["color"];
};

export const FollowButton: FunctionComponent<FollowButtonProps> = (props) => {
    return (
        <Suspense>
            <FollowButtonInner {...props} />
        </Suspense>
    );
};

const FollowButtonInner: FunctionComponent<FollowButtonProps> = ({
    project,
    onFollow,
    color,
}) => {
    const userInfo = useUserInfo();
    const utils = trpc.useContext();
    const followingStateQuery = trpc.projects.followingState.useQuery(
        { projectHandle: project.handle },
        { suspense: true }
    );
    const reqStore = useReqMutableStore();
    const ssrUrl = reqStore.get("ssrUrl");

    // big ol boilerplate to generate the optimistic update callbacks. this can
    // _probably_ be cleaned up somewhat, but doing so would require a bunch of
    // type finangaling that likely isn't worth doing in a component we never
    // actually touch.
    const createMutationCallbacks = useCallback(
        (
            optimisticState: FollowingState
        ): UseTRPCMutationOptions<
            {
                fromProjectId: ProjectId;
                toProjectId: ProjectId;
            },
            unknown,
            {
                followingState: FollowingStateEnum;
            },
            {
                previousState?: {
                    readerToProject: FollowingState;
                };
            }
        > => {
            return {
                onMutate: async () => {
                    // cancel any pending requests so they don't overwrite our
                    // optimistic update
                    await utils.projects.followingState.cancel({
                        projectHandle: project.handle,
                    });

                    // snapshot the previous value
                    const previousState = utils.projects.followingState.getData(
                        {
                            projectHandle: project.handle,
                        }
                    );

                    // optimistic update
                    // cancel follow request -> not following
                    utils.projects.followingState.setData(
                        { projectHandle: project.handle },
                        {
                            readerToProject: optimisticState,
                        }
                    );

                    return { previousState };
                },
                onError: (err, params, context) => {
                    // mutation failed, reset back to the previous state
                    utils.projects.followingState.setData(
                        { projectHandle: project.handle },
                        context?.previousState
                    );
                },
                onSettled: async () => {
                    // refetch so we know we're For Sure accurate
                    await utils.projects.followingState.invalidate({
                        projectHandle: project.handle,
                    });
                },
                onSuccess: (result) => {
                    if (onFollow) {
                        onFollow(result.followingState);
                    }
                },
            };
        },
        [onFollow, project.handle, utils.projects.followingState]
    );

    const followRequestMutation =
        trpc.relationships.createFollowRequest.useMutation({
            ...createMutationCallbacks(
                project.privacy === ProjectPrivacy.Private
                    ? FollowingState.FollowRequested
                    : FollowingState.Following
            ),
        });
    const unfollowMutation = trpc.relationships.unfollow.useMutation({
        ...createMutationCallbacks(FollowingState.NotFollowing),
    });
    const cancelFollowRequestMutation =
        trpc.relationships.declineOrCancelFollowRequest.useMutation({
            ...createMutationCallbacks(FollowingState.NotFollowing),
        });

    const { t } = useTranslation();
    const followingState = followingStateQuery.data?.readerToProject ?? null;

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const onClickFollow = useCallback(async () => {
        if (!userInfo.projectId) return;
        const mutateArgs = {
            fromProjectId: userInfo.projectId,
            toProjectId: project.projectId,
        };

        switch (followingState) {
            case FollowingState.FollowRequested:
                // pending request; cancel follow request
                await cancelFollowRequestMutation.mutateAsync(mutateArgs);
                break;
            case FollowingState.NotFollowing:
                // not following; follow
                await followRequestMutation.mutateAsync(mutateArgs);
                break;
            case FollowingState.Following:
                // following; unfollow.  this causes a confirmation dialog box.
                setIsConfirmOpen(true);
                break;
            case null:
                // following state is only null when we don't know what we're
                // doing or user is logged out. just exit out.
                return;
        }
    }, [
        cancelFollowRequestMutation,
        followRequestMutation,
        followingState,
        project.projectId,
        userInfo.projectId,
    ]);

    const onConfirmUnfollow = useCallback(async () => {
        if (!userInfo.projectId) return;
        const mutateArgs = {
            fromProjectId: userInfo.projectId,
            toProjectId: project.projectId,
        };

        await unfollowMutation.mutateAsync(mutateArgs);
        setIsConfirmOpen(false);
    }, [project.projectId, userInfo.projectId, unfollowMutation]);

    let followButtonText = "unknown";

    if (!userInfo.loggedIn) {
        followButtonText = t("common:login");
    } else if (followingState === FollowingState.Following) {
        followButtonText = t("client:page.unfollow-button", "unfollow");
    } else if (followingState === FollowingState.NotFollowing) {
        if (project.privacy === ProjectPrivacy.Private) {
            followButtonText = t(
                "client:page.follow-request-button",
                "send follow request"
            );
        } else {
            followButtonText = t("client:page.follow-button", "follow");
        }
    } else if (followingState === FollowingState.FollowRequested) {
        followButtonText = t(
            "client:page.cancel-follow-request-button",
            "cancel follow request"
        );
    } else {
        return null;
    }

    if (!userInfo.loggedIn) {
        return (
            <LinkButton
                buttonStyle="pill"
                color={color}
                href={sitemap.public.login({ originalUrl: ssrUrl }).toString()}
            >
                {followButtonText}
            </LinkButton>
        );
    }

    return (
        <>
            <SimpleModalDialog
                isOpen={isConfirmOpen}
                title={t(
                    "client:unfollow-page.confirm-title",
                    "Unfollow this page?"
                )}
                body={t(
                    "client:unfollow-page.confirm-body",
                    "Are you sure you want to unfollow this page?"
                )}
                confirm={{ label: t("common:unfollow", "unfollow") }}
                cancel={{ label: t("common:cancel", "cancel") }}
                onConfirm={onConfirmUnfollow}
                onCancel={() => setIsConfirmOpen(false)}
            />
            <Button buttonStyle="pill" color={color} onClick={onClickFollow}>
                {followButtonText}
            </Button>
        </>
    );
};
