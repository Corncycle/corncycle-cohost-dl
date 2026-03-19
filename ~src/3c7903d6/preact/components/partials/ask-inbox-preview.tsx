import anonBug from "@/client/images/anonbug.png";
import { renderMarkdownReactNoHTML } from "@/client/lib/markdown/other-rendering";
import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import { ReportingUIContext } from "@/client/reporting/machine";
import sitemap from "@/shared/sitemap";
import { WireAskModel } from "@/shared/types/asks";
import { Menu } from "@headlessui/react";
import {
    EllipsisHorizontalIcon,
    NoSymbolIcon,
    ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { TRPCClientError } from "@trpc/client";
import React, {
    FunctionComponent,
    useCallback,
    useContext,
    useMemo,
} from "react";
import { toast } from "react-hot-toast";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { MeatballMenuItem } from "../elements/meatball-menu-item";
import { FriendlyTimestamp } from "../friendly-timestamp";
import { ProjectReference } from "../project-reference";
import { ProjectAvatar } from "./project-avatar";

export const AskInboxPreview: FunctionComponent<
    React.PropsWithChildren<{ ask: WireAskModel }>
> = ({ ask, children }) => {
    const displayPrefs = useDisplayPrefs();

    const rendered = useMemo(() => {
        return renderMarkdownReactNoHTML(ask.content, new Date(ask.sentAt), {
            renderingContext: "ask",
            disableEmbeds: true,
            externalLinksInNewTab: displayPrefs.externalLinksInNewTab,
            hasCohostPlus: false,
        });
    }, [ask.content, ask.sentAt, displayPrefs.externalLinksInNewTab]);

    const showFooter = React.Children.count(children) > 0;

    const blockSenderMutation = trpc.asks.blockSender.useMutation();

    const reportingService = useContext(ReportingUIContext);

    const blockSender = useCallback(() => {
        toast
            .promise(blockSenderMutation.mutateAsync(ask.askId), {
                loading: "Blocking sender...",
                success: "Sender blocked!",
                error: (err) => {
                    console.error(err);
                    if (err instanceof TRPCClientError) {
                        return err.message;
                    }
                    return "Failed to block sender";
                },
            })
            .catch((_) => null);
    }, [ask.askId, blockSenderMutation]);

    const { current: postBoxTheme, forceTheme: setPostBoxTheme } =
        useDynamicTheme();

    return (
        <div
            className={`grid ${"lg:grid-cols-[4rem_1fr]"} w-full gap-x-6 gap-y-2`}
            data-testid={`ask-${ask.askId}`}
        >
            {ask.askingProject ? (
                <ProjectAvatar project={ask.askingProject} noLink />
            ) : (
                <img
                    src={sitemap.public.static
                        .staticAsset({ path: anonBug })
                        .toString()}
                    className="mask mask-squircle cohost-shadow-light dark:cohost-shadow-dark hidden h-16 w-16 lg:block"
                    alt=""
                />
            )}
            <article
                data-theme={postBoxTheme}
                className="co-themed-box co-post-box"
            >
                <header className="co-thread-header">
                    <div className="flex min-w-0 flex-1 flex-row items-center gap-2 truncate leading-none">
                        {ask.askingProject ? (
                            <ProjectReference project={ask.askingProject} />
                        ) : (
                            <>
                                <img
                                    className="mask mask-squircle inline-block h-8 w-8 lg:hidden"
                                    src={sitemap.public.static
                                        .staticAsset({ path: anonBug })
                                        .toString()}
                                    alt=""
                                />
                                <span className="co-project-display-name max-w-full flex-shrink truncate font-atkinson font-bold">
                                    {ask.loggedIn
                                        ? "Anonymous User"
                                        : "Anonymous Guest"}
                                </span>
                            </>
                        )}
                        <FriendlyTimestamp
                            dateISO={new Date(ask.sentAt).toISOString()}
                        />
                    </div>

                    <Menu as="div" className="relative h-6 w-6">
                        <Menu.Button className="absolute right-0 top-0">
                            <EllipsisHorizontalIcon
                                className={tw`co-action-button h-6 w-6 transition-transform ui-open:rotate-90`}
                            />
                        </Menu.Button>

                        <Menu.Items className="cohost-shadow-dark absolute right-0 top-8 z-30 flex min-w-max flex-col gap-3 rounded-lg bg-notWhite p-3 text-notBlack focus:!outline-none">
                            <Menu.Item>
                                <MeatballMenuItem
                                    onClick={blockSender}
                                    disabled={false}
                                    ItemIcon={NoSymbolIcon}
                                    text="block this sender"
                                />
                            </Menu.Item>
                            <Menu.Item>
                                <MeatballMenuItem
                                    onClick={() => {
                                        reportingService.send({
                                            type: "START_REPORT",
                                            askId: ask.askId,
                                        });
                                    }}
                                    disabled={false}
                                    ItemIcon={ShieldExclamationIcon}
                                    text="report ask"
                                />
                            </Menu.Item>
                        </Menu.Items>
                    </Menu>
                </header>

                {/* hairline between post header and the first post */}
                <hr className="co-hairline" />

                <div className={tw`co-prose prose p-3`}>{rendered}</div>
                <hr className="co-hairline" />
                {showFooter ? (
                    <footer
                        className={tw`co-thread-footer w-full max-w-full rounded-b-lg p-3`}
                    >
                        <div className="flex items-center justify-end gap-3">
                            {children}
                        </div>
                    </footer>
                ) : null}
            </article>
        </div>
    );
};

export default AskInboxPreview;
