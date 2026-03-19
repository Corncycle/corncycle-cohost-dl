import sitemap from "@/shared/sitemap";
import { WireAskModel, WireAskModelModExtensions } from "@/shared/types/asks";
import { WireProjectModel } from "@/shared/types/projects";
import { WirePostViewModel, WireUserModel } from "@/shared/types/wire-models";
import React, { FunctionComponent, useCallback } from "react";
import { Disclosure } from "@headlessui/react";
import Ask from "@/client/preact/components/posts/blocks/ask";
import { Button } from "../../elements/button";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SubmitHandler, useForm } from "react-hook-form";
import { AskId } from "@/shared/types/ids";
import { trpc } from "@/client/lib/trpc";
import { toast } from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";

type ManageAskPageProps = {
    ask: WireAskModelModExtensions;
    sendingProject?: WireProjectModel;
    sendingUser?: WireUserModel;
    respondingProject: WireProjectModel;
    responsePost?: WirePostViewModel;
};

export const ManageAskPage: FunctionComponent<ManageAskPageProps> = ({
    ask,
    sendingProject,
    sendingUser,
    respondingProject,
    responsePost,
}) => {
    return (
        <div
            className="cohost-shadow-light dark:cohost-shadow-dark
                        container mx-auto mt-12
                        flex flex-col gap-4
                        rounded-lg bg-notWhite
                        p-3
                        text-notBlack"
        >
            <h1 className="text-4xl font-bold">manage ask</h1>
            <div className="prose">
                <table>
                    <tbody>
                        <tr>
                            <td>ask ID</td>
                            <td>{ask.askId}</td>
                        </tr>
                        <tr>
                            <td>sent at</td>
                            <td>{ask.sentAt}</td>
                        </tr>
                        <tr>
                            <td>anon?</td>
                            <td>{ask.anon.toString()}</td>
                        </tr>
                        <tr>
                            <td>sent by</td>
                            <td>
                                {sendingProject ? (
                                    <>
                                        <a
                                            href={sitemap.public.moderation
                                                .manageProject({
                                                    projectHandle:
                                                        sendingProject.handle,
                                                })
                                                .toString()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            @{sendingProject.handle}
                                        </a>
                                        {sendingUser ? (
                                            <>
                                                {" "}
                                                <a
                                                    href={sitemap.public.moderation
                                                        .manageUser({
                                                            userId: sendingUser.userId,
                                                        })
                                                        .toString()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    ({sendingUser.email})
                                                </a>
                                            </>
                                        ) : null}
                                    </>
                                ) : (
                                    "unknown (was not logged in)"
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>state</td>
                            <td>{ask.state}</td>
                        </tr>
                        <tr>
                            <td>response</td>
                            <td>
                                {responsePost ? (
                                    <>
                                        <a
                                            href={
                                                responsePost.singlePostPageUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            post ID {responsePost.postId}
                                        </a>{" "}
                                        <a
                                            href={sitemap.public.moderation
                                                .managePost({
                                                    postId: responsePost.postId,
                                                })
                                                .toString()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            (manage)
                                        </a>
                                    </>
                                ) : (
                                    "not yet"
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr />
                <div>
                    <h2>ask text</h2>
                    <pre>
                        <code>{ask.content}</code>
                    </pre>
                </div>
            </div>
            <Disclosure as="div" className="flex flex-col gap-4">
                <Disclosure.Button
                    as={Button}
                    buttonStyle="authn"
                    color="authn-primary"
                >
                    <ChevronDownIcon className="inline-block h-5 w-5 transition-transform ui-open:rotate-180" />
                    Preview rendered
                </Disclosure.Button>
                <Disclosure.Panel>
                    <Ask askBlock={{ type: "ask", ask }} />
                </Disclosure.Panel>
            </Disclosure>
            <hr />
            <div className="prose">
                <h2>actions</h2>
                <DeleteAskButton ask={ask} />
            </div>
        </div>
    );
};

const DeleteAskButton: FunctionComponent<{
    ask: WireAskModel;
}> = ({ ask }) => {
    const { handleSubmit } = useForm<{ askId: AskId }>({
        defaultValues: { askId: ask.askId },
    });

    const rejectAskMutation = trpc.asks.reject.useMutation();

    const onSubmit = useCallback<SubmitHandler<{ askId: AskId }>>(
        ({ askId }) => {
            // some weird type stuff going on here, hence the casting
            const promise = rejectAskMutation.mutateAsync(askId as AskId);
            toast
                .promise(promise, {
                    loading: "deleting ask...",
                    success: "ask deleted",
                    error(err) {
                        if (err instanceof TRPCClientError) {
                            return err.message;
                        }

                        return "unknown error deleting ask";
                    },
                })
                .catch(() => null);
        },
        [rejectAskMutation]
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Button buttonStyle="authn" color="authn-primary" type="submit">
                delete ask
            </Button>
        </form>
    );
};

export default ManageAskPage;
