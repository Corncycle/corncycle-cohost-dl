import { FileReportReq } from "@/shared/api-types/moderation-v1";
import sitemap from "@/shared/sitemap";
import {
    ArtistAlleyAdId,
    AskId,
    CommentId,
    PostId,
    ProjectId,
} from "@/shared/types/ids";
import axios, { AxiosResponse } from "axios";
import { createContext } from "react";
import { createMachine, assign, InterpreterFrom } from "xstate";
import { getVanillaClient } from "@/client/lib/trpc-vanilla";

export interface ReportingUIContext {
    postId?: PostId;
    projectId?: ProjectId;
    commentId?: CommentId;
    askId?: AskId;
    artistAlleyListingId?: ArtistAlleyAdId;
    reportingReason?: string;
    additionalDetails?: string;
    errorMessage?: string;
}

export type ReportDialogEvent =
    | {
          type: "START_REPORT";
          postId?: PostId;
          projectId?: ProjectId;
          commentId?: CommentId;
          askId?: AskId;
          artistAlleyListingId?: ArtistAlleyAdId;
      }
    | { type: "SUBMIT"; reportingReason: string; additionalDetails: string }
    | { type: "ACKNOWLEDGE" }
    | { type: "CLOSE" };

type ReportBody = { reportingReason: string; additionalDetails: string };

type ReportTypestate =
    | { value: "closed"; context: Record<string, never> }
    | { value: "editingReport"; context: { postId: PostId } }
    | { value: "editingReport"; context: { projectId: ProjectId } }
    | { value: "editingReport"; context: { commentId: CommentId } }
    | { value: "submitting"; context: ReportBody & { postId: PostId } }
    | { value: "submitting"; context: ReportBody & { projectId: ProjectId } }
    | { value: "submitting"; context: ReportBody & { commentId: CommentId } }
    | { value: "acknowledging"; context: Record<string, never> }
    | { value: "displayingError"; context: { errorMessage: string } };

async function submitPostReport(context: ReportingUIContext) {
    const response = await axios.post<any, AxiosResponse<any>, FileReportReq>(
        sitemap.public.apiV1.reporting.reportPost().toString(),
        {
            postId: context.postId as number,
            // TODO: actually make sure this is filled in
            reportingReason: context.reportingReason as string,
            additionalDetails: context.additionalDetails,
        }
    );

    if (response.status >= 200 && response.status <= 400) {
        return Promise.resolve();
    } else {
        throw new Error(response.statusText);
    }
}

async function submitProjectReport(context: ReportingUIContext) {
    if (!context.projectId) {
        throw new Error("project id not set");
    }

    if (!context.reportingReason) {
        throw new Error("reporting reason not set");
    }

    const vanillaClient = getVanillaClient();

    await vanillaClient.reporting.reportProject.mutate({
        additionalDetails: context.additionalDetails,
        projectId: context.projectId,
        reportingReason: context.reportingReason,
    });
}

async function submitCommentReport(context: ReportingUIContext) {
    if (!context.commentId) {
        throw new Error("comment id not set");
    }

    if (!context.reportingReason) {
        throw new Error("reporting reason not set");
    }

    const vanillaClient = getVanillaClient();

    await vanillaClient.reporting.reportComment.mutate({
        additionalDetails: context.additionalDetails,
        commentId: context.commentId,
        reportingReason: context.reportingReason,
    });
}

async function submitAskReport(context: ReportingUIContext) {
    if (!context.askId) {
        throw new Error("ask id not set");
    }

    if (!context.reportingReason) {
        throw new Error("reporting reason not set");
    }

    const vanillaClient = getVanillaClient();

    await vanillaClient.reporting.reportAsk.mutate({
        additionalDetails: context.additionalDetails,
        askId: context.askId,
        reportingReason: context.reportingReason,
    });
}

async function submitArtistAlleyReport(context: ReportingUIContext) {
    if (!context.artistAlleyListingId) {
        throw new Error("listing id not set");
    }

    if (!context.reportingReason) {
        throw new Error("reporting reason not set");
    }

    const vanillaClient = getVanillaClient();

    await vanillaClient.reporting.reportArtistAlleyListing.mutate({
        additionalDetails: context.additionalDetails,
        artistAlleyListingId: context.artistAlleyListingId,
        reportingReason: context.reportingReason,
    });
}

export const reportingUIMachine = createMachine<
    ReportingUIContext,
    ReportDialogEvent,
    ReportTypestate
>(
    {
        initial: "closed",
        strict: true,
        context: {},
        states: {
            closed: {
                entry: assign(() => {
                    return {};
                }),
                on: {
                    START_REPORT: {
                        target: "editingReport",
                        actions: assign((_context, event) => {
                            return {
                                postId: event.postId,
                                projectId: event.projectId,
                                commentId: event.commentId,
                                askId: event.askId,
                                artistAlleyListingId:
                                    event.artistAlleyListingId,
                            };
                        }),
                    },
                },
            },
            editingReport: {
                on: {
                    CLOSE: { target: "closed" },
                    SUBMIT: {
                        target: "submitting",
                        actions: assign((context, event) => {
                            return {
                                ...context,
                                reportingReason: event.reportingReason,
                                additionalDetails: event.additionalDetails,
                            };
                        }),
                    },
                },
            },
            submitting: {
                invoke: {
                    src: "submit",
                    onDone: {
                        target: "acknowledging",
                    },
                    onError: {
                        target: "displayingError",
                    },
                },
            },
            acknowledging: {
                on: {
                    ACKNOWLEDGE: {
                        target: "closed",
                    },
                    CLOSE: {
                        target: "closed",
                    },
                },
            },
            displayingError: {
                on: {
                    CLOSE: {
                        target: "closed",
                    },
                },
            },
        },
    },
    {
        services: {
            submit: async (context) => {
                if (context.postId) {
                    return submitPostReport(context);
                } else if (context.projectId) {
                    return submitProjectReport(context);
                } else if (context.commentId) {
                    return submitCommentReport(context);
                } else if (context.askId) {
                    return submitAskReport(context);
                } else if (context.artistAlleyListingId) {
                    return submitArtistAlleyReport(context);
                } else {
                    // todo: rollbar
                    throw new Error("submit with invalid state shape");
                }
            },
        },
    }
);

export const ReportingUIContext = createContext(
    {} as InterpreterFrom<typeof reportingUIMachine>
);
