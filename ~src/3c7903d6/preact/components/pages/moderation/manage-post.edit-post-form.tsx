import React, { FunctionComponent, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { PostState, PostStateEnum } from "@/shared/types/posts";
import {
    WirePostModel,
    WirePostModelModeratorExtensions,
} from "@/shared/types/wire-models";
import { trpc } from "@/client/lib/trpc";
import { Button } from "../../elements/button";

type Inputs = {
    postState: PostState;
    adultContent: boolean;
    adultContentOverride: boolean;
    commentsLocked: boolean;
    cws: string[];
};

export const EditPostForm: FunctionComponent<{
    post: WirePostModelModeratorExtensions;
}> = ({ post }) => {
    const updatePost = trpc.posts.moderation.editPost.useMutation();

    const onSubmit: SubmitHandler<Inputs> = (inputs) => {
        return updatePost.mutateAsync({
            postId: post.postId,
            adultContent: inputs.adultContent,
            adultContentOverride: inputs.adultContentOverride,
            state: inputs.postState,
            commentsLocked: inputs.commentsLocked,
            cws: inputs.cws,
        });
    };

    const { control, formState, register, handleSubmit } = useForm<Inputs>({
        defaultValues: {
            postState: post.state,
            adultContent: post.adultContent,
            adultContentOverride: post.adultContentOverride,
            commentsLocked: post.commentsLocked,
            cws: post.cws,
        },
    });

    useEffect(() => {
        if (formState.isSubmitSuccessful) location.reload();
    }, [formState.isSubmitSuccessful]);

    return (
        <form
            className="my-6 flex max-w-prose flex-col gap-4 divide-y"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="flex flex-col gap-2">
                <label>post state</label>
                {formState.errors.postState ? (
                    <span className="font-bold text-red">
                        {formState.errors.postState.message}
                    </span>
                ) : null}
                <select
                    {...register("postState", {
                        valueAsNumber: true, // returns as string by default, which fails validation
                    })}
                >
                    <option value={PostState.Deleted}>Deleted</option>
                    <option value={PostState.Unpublished}>Unpublished</option>
                    <option value={PostState.Published}>Published</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <label>adult content</label>
                    <input type="checkbox" {...register("adultContent")} />
                </div>
                {formState.errors.adultContent ? (
                    <span className="font-bold text-red">
                        {formState.errors.adultContent.message}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <label>adult content override</label>
                    <input
                        type="checkbox"
                        {...register("adultContentOverride")}
                    />
                </div>
                {formState.errors.adultContentOverride ? (
                    <span className="font-bold text-red">
                        {formState.errors.adultContentOverride.message}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <label>comments locked</label>
                    <input type="checkbox" {...register("commentsLocked")} />
                </div>
                {formState.errors.commentsLocked ? (
                    <span className="font-bold text-red">
                        {formState.errors.commentsLocked.message}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <label>CWs</label>
                    <input
                        className="w-full"
                        {...register("cws", {
                            setValueAs: (val: string | string[]): string[] =>
                                typeof val === "string"
                                    ? val.split(",").map((cw) => cw.trim())
                                    : val,
                        })}
                    />
                </div>
                {formState.errors.cws ? (
                    <span className="font-bold text-red">
                        {formState.errors.cws
                            .map((error) => error.message)
                            .join(", ")}
                    </span>
                ) : null}
            </div>

            <Button
                type="submit"
                buttonStyle="pill"
                color="cherry"
                className="max-w-max"
            >
                submit
            </Button>
            {formState.isSubmitSuccessful ? (
                <span className="font-bold text-green">Submit successful!</span>
            ) : null}

            {process.env.NODE_ENV === "development" ? (
                <DevTool control={control} />
            ) : null}
        </form>
    );
};
