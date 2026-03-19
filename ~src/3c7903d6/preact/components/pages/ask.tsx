import React, { FunctionComponent, useCallback, useMemo } from "react";
import { SidebarMenu } from "../sidebar-menu";
import { ProjectHandle } from "@/shared/types/ids";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "@/client/lib/trpc";
import { ExpandingTextArea } from "../expanding-text-area";
import { Button } from "../elements/button";
import { useUserInfo } from "../../providers/user-info-provider";
import { useCurrentProject } from "../../hooks/data-loaders";
import { InfoBox } from "../elements/info-box";
import { ProjectAvatar } from "../partials/project-avatar";
import anonBug from "@/client/images/anonbug.png";
import sitemap from "@/shared/sitemap";
import { ProjectReference } from "../project-reference";
import { sectionTitleClasses } from "../settings/shared";
import { toast } from "react-hot-toast";
import { ASK_LENGTH_LIMIT } from "@/shared/limits";
import loadable from "@loadable/component";
import { renderSummaryNoHTML } from "@/client/lib/markdown/other-rendering";

const DevTool = loadable(() => import("@hookform/devtools"), {
    resolveComponent: (mod) => mod.DevTool,
});

export const AskPage: FunctionComponent<{ projectHandle: ProjectHandle }> = (
    props
) => {
    return (
        <main className="w-full pt-16">
            <div className="container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                <SidebarMenu />
                <section className="col-span-1 flex flex-col gap-12 lg:col-span-2">
                    <AskPageContents {...props} />
                </section>
            </div>
        </main>
    );
};

type Inputs = {
    anon: boolean;
    content: string;
};

type CanSendAskReason = "notEnabled" | "noAnon" | "noLoggedOutAnon" | "ok";

const AskPageContents: FunctionComponent<{ projectHandle: ProjectHandle }> = ({
    projectHandle,
}) => {
    const { loggedIn } = useUserInfo();
    const currentProject = useCurrentProject();
    const targetProject = trpc.projects.byHandle.useQuery(projectHandle, {
        suspense: true,
    });

    const anonAllowed = useMemo(
        () => targetProject.data && targetProject.data.askSettings.allowAnon,
        [targetProject.data]
    );
    const canSendAsk = useMemo<CanSendAskReason>(() => {
        if (!(targetProject.data && targetProject.data.askSettings.enabled)) {
            return "notEnabled";
        }

        if (!anonAllowed && !loggedIn) {
            return "noAnon";
        }

        if (anonAllowed && !loggedIn) {
            const requireLoggedInAnon =
                targetProject.data &&
                targetProject.data.askSettings.requireLoggedInAnon;

            return requireLoggedInAnon ? "noLoggedOutAnon" : "ok";
        }

        return "ok";
    }, [anonAllowed, loggedIn, targetProject.data]);

    const sendAsk = trpc.asks.send.useMutation();
    const { register, handleSubmit, control, reset, watch } = useForm<Inputs>({
        defaultValues: {
            anon: !loggedIn,
            content: "",
        },
    });

    const content = watch("content");
    const askNotEmpty = useMemo(() => {
        const rendered = renderSummaryNoHTML(content, new Date(), {
            renderingContext: "ask",
            hasCohostPlus: true,
            disableEmbeds: true,
            externalLinksInNewTab: true,
        });

        return rendered.trim().length > 0;
    }, [content]);

    const onSubmit = useCallback<SubmitHandler<Inputs>>(
        (values) => {
            const promise = sendAsk.mutateAsync({
                toProjectHandle: projectHandle,
                content: values.content,
                anon: values.anon,
            });
            toast
                .promise(promise, {
                    loading: "Sending ask...",
                    success: "Ask sent!",
                    error: "Failed to send ask.",
                })
                .then((_) => reset(undefined, { keepValues: false }))
                .catch((_) => null);
        },
        [projectHandle, reset, sendAsk]
    );

    const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLElement>>(
        (ev) => {
            if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") {
                ev.preventDefault();
                void handleSubmit(onSubmit)();
            }
        },
        [handleSubmit, onSubmit]
    );

    const sendingToSelf = useMemo(
        () => currentProject && currentProject.handle === projectHandle,
        [currentProject, projectHandle]
    );

    return (
        <div className="flex flex-col gap-8 rounded-lg bg-notWhite p-3 text-notBlack">
            <h1 className={sectionTitleClasses}>ask @{projectHandle}</h1>

            {sendingToSelf && (
                <InfoBox level="info">
                    <div className="prose prose-sm">
                        <p>
                            Sending an ask to yourself, huh? Hope whatever bit
                            you're trying to do works out.
                        </p>
                    </div>
                </InfoBox>
            )}

            <InfoBox level="info">
                <div className="prose prose-sm">
                    <p>
                        Asks can contain simple{" "}
                        <a
                            href={sitemap.public
                                .staticContent({
                                    slug: "markdown-reference",
                                })
                                .toString()}
                            target="_blank"
                            rel="noreferrer"
                        >
                            markdown formatting
                        </a>{" "}
                        and links but no inline HTML, and also cannot include
                        inline images, audio, or video.
                    </p>
                </div>
            </InfoBox>

            {canSendAsk === "notEnabled" && (
                <InfoBox level="info">
                    <div className="prose prose-sm">
                        <p>@{projectHandle} doesn't allow asks. Sorry!</p>
                    </div>
                </InfoBox>
            )}

            {canSendAsk === "noAnon" && (
                <InfoBox level="info">
                    <div className="prose prose-sm">
                        <p>
                            @{projectHandle} doesn't allow anonymous asks.{" "}
                            <a
                                href={sitemap.public
                                    .login({
                                        originalUrl: sitemap.public.project
                                            .ask({ projectHandle })
                                            .toString(),
                                    })
                                    .toString()}
                            >
                                log in first.
                            </a>
                        </p>
                    </div>
                </InfoBox>
            )}

            {canSendAsk === "noLoggedOutAnon" && (
                <InfoBox level="info">
                    <div className="prose prose-sm">
                        <p>
                            @{projectHandle} doesn't allow anonymous asks from
                            logged out users.{" "}
                            <a
                                href={sitemap.public
                                    .login({
                                        originalUrl: sitemap.public.project
                                            .ask({ projectHandle })
                                            .toString(),
                                    })
                                    .toString()}
                            >
                                log in first.
                            </a>
                        </p>
                    </div>
                </InfoBox>
            )}

            {canSendAsk === "ok" && (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-0 divide-y divide-cherry border border-cherry">
                        <Controller
                            control={control}
                            name="content"
                            rules={{
                                maxLength: ASK_LENGTH_LIMIT,
                                minLength: 1,
                            }}
                            render={({
                                field: { ref, onChange, ...field },
                            }) => (
                                <div className="flex flex-row items-start">
                                    <ExpandingTextArea
                                        {...field}
                                        onInput={onChange}
                                        onKeyDown={onKeyDown}
                                        className="border-0"
                                        ref={ref}
                                        minRows={4}
                                        autoComplete="off"
                                        placeholder={`ask ${projectHandle}`}
                                    />
                                    {field.value.length >=
                                    ASK_LENGTH_LIMIT * 0.75 ? (
                                        <span
                                            className={`flex-shrink-0 p-2 tabular-nums ${
                                                field.value.length >
                                                ASK_LENGTH_LIMIT
                                                    ? "text-red"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {ASK_LENGTH_LIMIT -
                                                field.value.length}
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        />

                        <div className="flex flex-row items-center justify-between gap-2 p-2">
                            <div className="flex flex-row items-center gap-2 truncate">
                                {currentProject && !watch("anon") && (
                                    <>
                                        <ProjectReference
                                            project={currentProject}
                                            inline={true}
                                        />
                                    </>
                                )}
                                {watch("anon") && (
                                    <>
                                        <img
                                            src={sitemap.public.static
                                                .staticAsset({ path: anonBug })
                                                .toString()}
                                            alt="anonymous"
                                            className="mask mask-squircle h-8 w-8"
                                        />
                                        <span>anonymous</span>
                                    </>
                                )}
                            </div>
                            {anonAllowed && loggedIn && (
                                <label className="flex flex-row items-center gap-2">
                                    anonymous?
                                    <input
                                        type="checkbox"
                                        {...register("anon")}
                                        className="rounded-checkbox"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                    <Button
                        buttonStyle="roundrect"
                        type="submit"
                        color="authn-primary"
                        disabled={!askNotEmpty}
                    >
                        send
                    </Button>
                </form>
            )}
            {process.env.NODE_ENV === "development" && (
                <DevTool control={control} />
            )}
        </div>
    );
};

export default AskPage;
