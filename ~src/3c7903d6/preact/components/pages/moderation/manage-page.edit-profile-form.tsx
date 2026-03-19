import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { WireProjectModelModeratorExtensions } from "@/shared/types/projects";
import { WireUserModel } from "@/shared/types/wire-models";
import React, { FunctionComponent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../../elements/button";

type Inputs = {
    displayName: string;
    dek: string;
    description: string;
    pronouns: string;
    url: string;
    clearAvatar: boolean;
    clearHeader: boolean;
};

export const EditProfileForm: FunctionComponent<{
    project: WireProjectModelModeratorExtensions;
    selfUser: WireUserModel | undefined;
}> = ({ project, selfUser }) => {
    const { register, handleSubmit, reset } = useForm<Inputs>({
        defaultValues: {
            clearAvatar: false,
            clearHeader: false,
            dek: project.dek,
            description: project.description,
            displayName: project.displayName,
            pronouns: project.pronouns ?? "",
            url: project.url ?? "",
        },
    });

    const updateProfileMutation =
        trpc.moderation.project.updateProfile.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
        await updateProfileMutation.mutateAsync({
            projectId: project.projectId,
            ...inputs,
        });
        window.location.reload();
    };

    return (
        <form
            className="prose rounded-lg border p-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <table>
                <tbody>
                    <tr>
                        <td>handle</td>
                        <td>
                            {project.handle}{" "}
                            {project.handleSuspicionResult ? (
                                <span
                                    className={`${
                                        project.handleSuspicionResult.score >
                                        0.8
                                            ? "text-red"
                                            : ""
                                    }`}
                                >
                                    (suspicion score:{" "}
                                    {(
                                        project.handleSuspicionResult.score *
                                        100
                                    ).toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                    })}
                                    %)
                                </span>
                            ) : null}
                        </td>
                    </tr>
                    <tr>
                        <td>display name</td>
                        <td>
                            <input
                                type="text"
                                {...register("displayName", {
                                    maxLength: 70,
                                })}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>dek</td>
                        <td>
                            <input
                                type="text"
                                {...register("dek", {
                                    maxLength: 35,
                                })}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>pronouns</td>
                        <td>
                            <input
                                type="text"
                                {...register("pronouns", {
                                    maxLength: 35,
                                })}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>url</td>
                        <td>
                            <input type="url" {...register("url")} />
                        </td>
                    </tr>
                    <tr>
                        <td>description</td>
                        <td>
                            <textarea
                                className="w-full max-w-prose"
                                {...register("description")}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>avatar</td>
                        <td>
                            <a
                                href={project.avatarURL}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {project.avatarURL}
                            </a>
                            <br />
                            <label>remove? </label>
                            <input
                                type="checkbox"
                                {...register("clearAvatar")}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>header</td>
                        <td>
                            {project.headerURL ? (
                                <>
                                    <a
                                        href={project.headerURL}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {project.headerURL}
                                    </a>
                                    <br />
                                    <label>remove? </label>
                                    <input
                                        type="checkbox"
                                        {...register("clearHeader")}
                                    />
                                </>
                            ) : (
                                "none"
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td>self user</td>
                        <td>
                            {selfUser ? (
                                <a
                                    href={sitemap.public.moderation
                                        .manageUser({
                                            userId: selfUser.userId,
                                        })
                                        .toString()}
                                >
                                    {selfUser.email} (user id {selfUser.userId})
                                </a>
                            ) : (
                                <>none</>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>last activity time</td>
                        <td>{project.lastActivityTime ?? "null"}</td>
                    </tr>
                    <tr>
                        <td>delete after time</td>
                        <td>{project.deleteAfter ?? "null"}</td>
                    </tr>
                </tbody>
            </table>

            <Button type="submit" buttonStyle="pill" color="green">
                save changes
            </Button>
            <Button
                type="reset"
                buttonStyle="pill"
                color="red"
                onClick={(e) => {
                    e.preventDefault();
                    reset(undefined, { keepDefaultValues: true });
                }}
            >
                reset changes
            </Button>
        </form>
    );
};
