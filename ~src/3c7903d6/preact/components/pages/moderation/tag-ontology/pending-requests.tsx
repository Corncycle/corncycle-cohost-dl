import React, { FunctionComponent } from "react";
import { trpc } from "@/client/lib/trpc";
import { TagRelationRequestData } from "@/shared/types/tags";
import { BasicButton } from "../../../elements/basic-button";
import sitemap from "@/shared/sitemap";

export const TagOntologyPendingRequestsPage: FunctionComponent = (props) => {
    const requests =
        trpc.moderation.tag.getPendingRelationRequests.useInfiniteQuery(
            {},
            {
                suspense: true,
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );
    const createSynonym = trpc.moderation.tag.createSynonym.useMutation();
    const createRelation = trpc.moderation.tag.createRelation.useMutation();
    const dismissRelationRequest =
        trpc.moderation.tag.dismissRelationRequest.useMutation();
    const pages = requests.data?.pages ?? [];

    function submitAcceptRequestAsSynonym(
        relationRequest: TagRelationRequestData,
        invert: boolean
    ): boolean {
        createSynonym.mutate({
            primarySynonymId: invert
                ? relationRequest.tagHigh.tagId
                : relationRequest.tagLow.tagId,
            otherTagId: invert
                ? relationRequest.tagLow.tagId
                : relationRequest.tagHigh.tagId,
            fromRelationRequestId: relationRequest.requestId,
        });

        location.reload();

        return true;
    }

    function submitAcceptRequestAsRelated(
        relationRequest: TagRelationRequestData
    ): boolean {
        createRelation.mutate({
            tagIdA: relationRequest.tagLow.tagId,
            tagIdB: relationRequest.tagHigh.tagId,
            fromRelationRequestId: relationRequest.requestId,
        });

        location.reload();

        return true;
    }

    function submitDismissRelationRequest(
        relationRequest: TagRelationRequestData
    ): boolean {
        dismissRelationRequest.mutate({
            relationRequestId: relationRequest.requestId,
        });

        location.reload();

        return true;
    }

    return (
        <div
            className="cohost-shadow-light dark:cohost-shadow-dark container
                mx-auto mt-12 flex flex-col gap-4 rounded-lg bg-notWhite p-3 text-notBlack"
        >
            <h1 className="text-4xl">manage pending relation requests</h1>

            <table>
                {pages.map((page) => (
                    <>
                        {page.requests.map((req) => (
                            <>
                                <div
                                    className="flex flex-row"
                                    key={`row-${req.requestId}`}
                                >
                                    <div className="flex flex-1 flex-col">
                                        <div className="text-xl">
                                            {"\u24B6 "}
                                            <a
                                                className="text-cherry underline"
                                                href={sitemap.public
                                                    .tags({
                                                        tagSlug:
                                                            req.tagLow.content,
                                                    })
                                                    .toString()}
                                            >
                                                #{req.tagLow.content}
                                            </a>
                                            {" \u2194 \u24B7 "}
                                            <a
                                                className="text-cherry underline"
                                                href={sitemap.public
                                                    .tags({
                                                        tagSlug:
                                                            req.tagHigh.content,
                                                    })
                                                    .toString()}
                                            >
                                                #{req.tagHigh.content}
                                            </a>
                                        </div>
                                        <div>
                                            submitting user:{" "}
                                            <a
                                                href={sitemap.public.moderation
                                                    .manageUser({
                                                        userId: req.fromUser
                                                            .userId,
                                                    })
                                                    .toString()}
                                            >
                                                {req.fromUser.email}
                                            </a>{" "}
                                            (@{req.fromUser.selfProjectHandle})
                                        </div>
                                        <div>notes: {req.notes}</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <form
                                            onSubmit={() =>
                                                submitAcceptRequestAsSynonym(
                                                    req,
                                                    false
                                                )
                                            }
                                        >
                                            <BasicButton
                                                type="submit"
                                                buttonSize="regular"
                                                buttonColor="cherry"
                                            >
                                                add &#x24B6; as synonym of
                                                &#x24B7;
                                            </BasicButton>
                                        </form>
                                        <form
                                            onSubmit={() =>
                                                submitAcceptRequestAsSynonym(
                                                    req,
                                                    true
                                                )
                                            }
                                        >
                                            <BasicButton
                                                type="submit"
                                                buttonSize="regular"
                                                buttonColor="cherry"
                                            >
                                                add &#x24B7; as synonym of
                                                &#x24B6;
                                            </BasicButton>
                                        </form>
                                        <form
                                            onSubmit={() =>
                                                submitAcceptRequestAsRelated(
                                                    req
                                                )
                                            }
                                        >
                                            <BasicButton
                                                type="submit"
                                                buttonSize="regular"
                                                buttonColor="cherry"
                                            >
                                                add as related
                                            </BasicButton>
                                        </form>
                                        <form
                                            onSubmit={() =>
                                                submitDismissRelationRequest(
                                                    req
                                                )
                                            }
                                        >
                                            <BasicButton
                                                type="submit"
                                                buttonSize="regular"
                                                buttonColor="cherry"
                                            >
                                                ignore
                                            </BasicButton>
                                        </form>
                                    </div>
                                </div>
                                <hr
                                    className="my-3"
                                    key={`hr-${req.requestId}`}
                                />
                            </>
                        ))}
                    </>
                ))}
            </table>
        </div>
    );
};

export default TagOntologyPendingRequestsPage;
