import { trpc } from "@/client/lib/trpc";
import {
    type Actions,
    FollowRequestsContext,
} from "@/client/preact/components/pages/follow-requests-context";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useUserInfo } from "../../providers/user-info-provider";
import { Button } from "../elements/button";

type FollowRequestButtonsProps = {
    requester: WireProjectModel;
};

export const FollowRequestButtons: FunctionComponent<
    FollowRequestButtonsProps
> = ({ requester }) => {
    const { t } = useTranslation();
    const userInfo = useUserInfo();
    const { onAction } = useContext(FollowRequestsContext);
    const utils = trpc.useContext();

    const createRequestMutationArgs = (action: Actions) => {
        return {
            onSettled: async () => {
                onAction(requester.projectId, action);
                await utils.relationships.countFollowRequests.invalidate();
                await utils.posts.profilePosts.invalidate();
            },
        };
    };

    const acceptRequestMutation =
        trpc.relationships.acceptFollowRequest.useMutation(
            createRequestMutationArgs("accept")
        );
    const onClickAccept = useCallback(async () => {
        if (!userInfo.projectId) return;

        await acceptRequestMutation.mutateAsync({
            fromProjectId: requester.projectId,
            toProjectId: userInfo.projectId,
        });
    }, [acceptRequestMutation, requester.projectId, userInfo.projectId]);

    const declineRequestMutation =
        trpc.relationships.declineOrCancelFollowRequest.useMutation(
            createRequestMutationArgs("decline")
        );

    const onClickDecline = useCallback(async () => {
        if (!userInfo.projectId) return;

        await declineRequestMutation.mutateAsync({
            fromProjectId: requester.projectId,
            toProjectId: userInfo.projectId,
        });
    }, [declineRequestMutation, requester.projectId, userInfo.projectId]);

    return (
        <div className="flex flex-row justify-center gap-2">
            <Button buttonStyle="pill" color="green" onClick={onClickAccept}>
                {t(
                    "server:relationships.accept-follow-request-button-text-short",
                    "accept"
                )}
            </Button>
            <Button buttonStyle="pill" color="red" onClick={onClickDecline}>
                {t(
                    "server:relationships.decline-follow-request-button-text-short",
                    "decline"
                )}
            </Button>
        </div>
    );
};
