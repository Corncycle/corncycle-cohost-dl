import { trpc } from "@/client/lib/trpc";
import { WireAskModel } from "@/shared/types/asks";
import { TRPCClientError } from "@trpc/client";
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from "react";
import toast from "react-hot-toast";
import { useCurrentProject } from "../../hooks/data-loaders";
import { useUserInfo } from "../../providers/user-info-provider";
import { useModalPostComposer } from "../modal-post-composer-context";
import { AskInboxPreview } from "../partials/ask-inbox-preview";
import { SidebarMenu } from "../sidebar-menu";
import { useTranslation } from "react-i18next";
import { Button } from "../elements/button";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import sitemap from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import { SimpleModalDialog } from "../elements/simple-modal-dialog";

export const InboxPage: FunctionComponent = () => {
    const { loggedIn } = useUserInfo();
    const utils = trpc.useContext();
    const askResp = trpc.asks.listPending.useInfiniteQuery(
        {},
        {
            staleTime: 1000 * 60 * 5,
            suspense: true,
            enabled: loggedIn,
            onSettled: async () => {
                await utils.asks.unreadCount.invalidate();
            },
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );
    const pages = askResp.data?.pages ?? [];
    const currentProject = useCurrentProject();
    const modalPostComposer = useModalPostComposer();
    useEffect(() => {
        if (currentProject) {
            modalPostComposer.setup({
                project: currentProject,
            });
        }
    }, [currentProject, modalPostComposer]);
    return (
        <main className="w-full pb-16 pt-16">
            <div className="container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                <SidebarMenu />
                <section className="col-span-1 flex flex-col gap-12 lg:col-span-2">
                    <div className="flex flex-col gap-8 p-3">
                        <h1 className="text-4xl font-bold text-bgText">
                            inbox
                        </h1>
                        {pages.map((page) => (
                            <>
                                {page.asks.map((ask) => (
                                    <AskListing key={ask.askId} ask={ask} />
                                ))}
                            </>
                        ))}
                        {askResp.hasNextPage && (
                            <Button
                                buttonStyle="authn"
                                color="authn-primary"
                                onClick={async () => {
                                    await askResp.fetchNextPage();
                                }}
                            >
                                load more
                            </Button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

const RejectAskDialog: FunctionComponent<{
    ask: WireAskModel;
    isOpen: boolean;
    onClose: () => void;
}> = ({ ask, isOpen, onClose }) => {
    const { t } = useTranslation();
    const utils = trpc.useContext();
    const rejectAskMutation = trpc.asks.reject.useMutation({
        onSettled: async () => {
            await utils.asks.listPending.invalidate();
        },
    });
    const rejectAsk = useCallback(() => {
        onClose();
        toast
            .promise(rejectAskMutation.mutateAsync(ask.askId), {
                loading: "Rejecting ask...",
                success: "Ask rejected!",
                error: (err) => {
                    console.error(err);
                    if (err instanceof TRPCClientError) {
                        return err.message;
                    }
                    return "Failed to reject ask";
                },
            })
            .catch((_) => null);
    }, [ask.askId, onClose, rejectAskMutation]);

    return (
        <SimpleModalDialog
            isOpen={isOpen}
            title={t("client:reject-ask.confirm-title", "Reject this ask")}
            body={t(
                "client:reject-ask.confirm-message",
                "Are you sure you want to reject this ask? This cannot be undone."
            )}
            confirm={{
                label: t("common:reject", "reject"),
                color: "destructive",
            }}
            cancel={{
                label: t("common:cancel"),
            }}
            onConfirm={rejectAsk}
            onCancel={onClose}
        />
    );
};

const AskListing: FunctionComponent<{ ask: WireAskModel }> = ({ ask }) => {
    const modalPostComposer = useModalPostComposer();
    const utils = trpc.useContext();

    const onResponsePosted = useCallback(() => {
        void utils.asks.listPending.invalidate();
    }, [utils.asks.listPending]);

    const [rejectAskDialogOpen, setRejectAskDialogOpen] = useState(false);

    const { disableModalPostComposer } = useDisplayPrefs();

    const onClickRespond = useCallback<
        React.MouseEventHandler<HTMLAnchorElement>
    >(
        (e) => {
            if (disableModalPostComposer) {
                return;
            }

            if (e.ctrlKey || e.metaKey || e.button === 3) {
                // ctrl/cmd/middle click: user wants this to open in a new
                // tab, treat it as a link.
                return;
            }

            e.preventDefault();
            modalPostComposer.activate({
                responseToAskId: ask.askId,
                onPost: onResponsePosted,
            });
        },
        [
            ask.askId,
            disableModalPostComposer,
            modalPostComposer,
            onResponsePosted,
        ]
    );

    const currentProject = useCurrentProject();

    return (
        <div>
            <RejectAskDialog
                ask={ask}
                isOpen={rejectAskDialogOpen}
                onClose={() => setRejectAskDialogOpen(false)}
            />
            <AskInboxPreview ask={ask}>
                <button
                    onClick={() => setRejectAskDialogOpen(true)}
                    className="cursor-pointer text-sm text-gray-400 hover:underline"
                >
                    reject
                </button>

                <a
                    onClick={onClickRespond}
                    href={sitemap.public.project
                        .composePost({
                            projectHandle:
                                currentProject?.handle ?? ("" as ProjectHandle),
                            responseToAskId: ask.askId,
                        })
                        .toString()}
                    className="cursor-pointer text-sm text-gray-400 hover:underline"
                >
                    respond
                </a>
            </AskInboxPreview>
        </div>
    );
};

export default InboxPage;
