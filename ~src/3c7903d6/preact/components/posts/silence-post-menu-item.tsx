import { trpc } from "@/client/lib/trpc";
import { PostId } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";
import { useUserInfo } from "../../providers/user-info-provider";
import { SilenceIcon } from "../icons/silence";

export const SilencePostMenuItem: FunctionComponent<{ postId: PostId }> = ({
    postId,
}) => {
    const { loggedIn } = useUserInfo();
    const utils = trpc.useContext();

    const { mutate: silencePostMutation } =
        trpc.relationships.silencePost.useMutation({
            async onSettled(data, error, variables) {
                await utils.relationships.isPostSilenced.invalidate({
                    postId: variables.toPostId,
                });
            },
        });

    const { mutate: unsilencePostMutation } =
        trpc.relationships.unsilencePost.useMutation({
            async onSettled(data, error, variables) {
                await utils.relationships.isPostSilenced.invalidate({
                    postId: variables.toPostId,
                });
            },
        });

    const { data: isSilenced } = trpc.relationships.isPostSilenced.useQuery(
        {
            postId,
        },
        { enabled: loggedIn }
    );

    if (!loggedIn) return null;

    if (isSilenced) {
        return (
            <button
                className="flex flex-row gap-2 hover:underline"
                onClick={() =>
                    unsilencePostMutation({
                        toPostId: postId,
                    })
                }
            >
                <SilenceIcon className="h-6" />
                unsilence this post
            </button>
        );
    } else {
        return (
            <button
                className="flex flex-row gap-2 hover:underline"
                onClick={() =>
                    silencePostMutation({
                        toPostId: postId,
                    })
                }
            >
                <SilenceIcon className="h-6" />
                silence this post
            </button>
        );
    }
};
