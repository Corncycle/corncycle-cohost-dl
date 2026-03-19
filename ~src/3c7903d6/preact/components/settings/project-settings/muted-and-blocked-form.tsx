import { trpc } from "@/client/lib/trpc";
import { useCurrentProject } from "@/client/preact/hooks/data-loaders";
import sitemap from "@/shared/sitemap";
import { WireProjectModel } from "@/shared/types/projects";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { t } from "i18next";
import _ from "lodash";
import React, { FunctionComponent, useState } from "react";
import { BasicButton } from "../../elements/basic-button";
import { SimpleModalDialog } from "../../elements/simple-modal-dialog";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";

type SilencedBlockedProjectCardProps = {
    project: WireProjectModel;
    userNote: string | undefined;
    button: "unmute" | "unblock";
};

type AccordionButtonProps = {
    label: string;
    open: boolean;
};

const AccordionButton: FunctionComponent<AccordionButtonProps> = (props) => {
    return (
        <button className="flex w-full flex-row justify-between bg-cherry-500 px-3 py-1 font-bold text-notWhite">
            {props.label}

            <ChevronDownIcon
                className={classNames("h-6", props.open ? "rotate-180" : "")}
            />
        </button>
    );
};

const SilencedBlockedProjectCard: FunctionComponent<
    SilencedBlockedProjectCardProps
> = (props) => {
    const currentProject = useCurrentProject();
    const unmute = trpc.relationships.unmute.useMutation();
    const unblock = trpc.relationships.unblock.useMutation();
    const utils = trpc.useContext();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    function onClickButton() {
        setIsConfirmOpen(true);
    }

    async function onConfirmUnmute() {
        if (!currentProject) return;

        await unmute.mutateAsync({
            fromProjectId: currentProject.projectId,
            toProjectId: props.project.projectId,
        });
        await utils.relationships.silencedProjects.invalidate();
    }

    async function onConfirmUnblock() {
        if (!currentProject) return;

        await unblock.mutateAsync({
            fromProjectId: currentProject.projectId,
            toProjectId: props.project.projectId,
        });
        await utils.relationships.blockedProjects.invalidate();
    }

    let confirmDialog = null;
    let buttonLabel = "";

    switch (props.button) {
        case "unmute":
            confirmDialog = (
                <SimpleModalDialog
                    isOpen={isConfirmOpen}
                    title={t(
                        "client:unsilence-page.confirm-with-handle-title",
                        {
                            defaultValue: "Unsilence @{{handle}}?",
                            handle: props.project.handle,
                        }
                    )}
                    body={t("client:unsilence-page.confirm-with-handle-body", {
                        defaultValue:
                            "Are you sure you want to unsilence @{{handle}}?",
                        handle: props.project.handle,
                    })}
                    confirm={{
                        label: t("common:unsilence", "unsilence"),
                    }}
                    cancel={{
                        label: t("common:cancel", "cancel"),
                    }}
                    onConfirm={onConfirmUnmute}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            );
            buttonLabel = "unsilence";
            break;
        case "unblock":
            confirmDialog = (
                <SimpleModalDialog
                    isOpen={isConfirmOpen}
                    title={t("client:unblock-page.confirm-with-handle-title", {
                        defaultValue: "Unblock @{{handle}}?",
                        handle: props.project.handle,
                    })}
                    body={t("client:unblock-page.confirm-with-handle-body", {
                        defaultValue:
                            "Are you sure you want to unblock @{{handle}}?",
                        handle: props.project.handle,
                    })}
                    confirm={{
                        label: t("common:unblock", "unblock"),
                    }}
                    cancel={{
                        label: t("common:cancel", "cancel"),
                    }}
                    onConfirm={onConfirmUnblock}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            );
            buttonLabel = "unblock";
            break;
    }

    return (
        <>
            {confirmDialog}
            <li className="grid-cols-max grid-rows-max grid justify-between border-b-[1px] last:border-b-0">
                <div className="col-start-1 row-start-1">
                    {props.project.displayName ? (
                        <>
                            <span className="font-bold">
                                {props.project.displayName}
                            </span>
                            &nbsp;
                        </>
                    ) : null}
                    @{props.project.handle} (
                    <a
                        href={sitemap.public.project
                            .mainAppProfile({
                                projectHandle: props.project.handle,
                            })
                            .toString()}
                        className="underline"
                    >
                        profile
                    </a>
                    )
                </div>
                <BasicButton
                    extraClasses="col-start-2 row-start-1 row-span-2 h-10 w-fit self-center"
                    buttonColor="stroke"
                    onClick={onClickButton}
                >
                    {buttonLabel}
                </BasicButton>
                {props.userNote ? (
                    <div className="col-start-1 row-start-2 italic">
                        user note: {props.userNote}
                    </div>
                ) : (
                    <div className="col-start-1 row-start-2 italic">
                        (no user note)
                    </div>
                )}
            </li>
        </>
    );
};

export const SilencedAndBlockedForm: FunctionComponent = () => {
    const silencedProjects =
        trpc.relationships.silencedProjects.useInfiniteQuery(
            {},
            {
                suspense: true,
                staleTime: Infinity,
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );
    const blockedProjects = trpc.relationships.blockedProjects.useInfiniteQuery(
        {},
        {
            suspense: true,
            staleTime: Infinity,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const silencedProjectsList = silencedProjects.data
        ? _.concat(
              ...silencedProjects.data.pages.map((group) => group.projects)
          )
        : [];

    const blockedProjectsList = blockedProjects.data
        ? _.concat(...blockedProjects.data.pages.map((group) => group.projects))
        : [];

    return (
        <div className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>silenced and blocked pages</h4>
            You can access lists of the pages you've silenced or blocked here,
            if you want to check or make changes to them.
            <Disclosure>
                <Disclosure.Button>
                    {({ open }) => (
                        <AccordionButton
                            label={
                                open
                                    ? "hide silenced pages"
                                    : "show silenced pages"
                            }
                            open={open}
                        />
                    )}
                </Disclosure.Button>
                <Disclosure.Panel>
                    <ul className="flex max-h-[50vh] flex-col overflow-y-auto">
                        {silencedProjectsList.length > 0 ? (
                            silencedProjectsList.map((project) => (
                                <SilencedBlockedProjectCard
                                    key={project.project.projectId}
                                    project={project.project}
                                    userNote={project.userNote}
                                    button={"unmute"}
                                />
                            ))
                        ) : (
                            <div>You have no pages silenced.</div>
                        )}

                        {silencedProjects.hasNextPage ? (
                            <BasicButton
                                buttonSize="regular"
                                buttonColor="stroke"
                                extraClasses="w-[50%] mt-4 self-center"
                                onClick={silencedProjects.fetchNextPage}
                            >
                                load more
                            </BasicButton>
                        ) : null}
                    </ul>
                </Disclosure.Panel>
            </Disclosure>
            <Disclosure>
                <Disclosure.Button>
                    {({ open }) => (
                        <AccordionButton
                            label={
                                open
                                    ? "hide blocked pages"
                                    : "show blocked pages"
                            }
                            open={open}
                        />
                    )}
                </Disclosure.Button>
                <Disclosure.Panel>
                    <ul className="flex max-h-[50vh] flex-col overflow-y-auto">
                        {blockedProjectsList.length > 0 ? (
                            blockedProjectsList.map((project) => (
                                <SilencedBlockedProjectCard
                                    key={project.project.projectId}
                                    project={project.project}
                                    userNote={project.userNote}
                                    button={"unblock"}
                                />
                            ))
                        ) : (
                            <div>You have no pages blocked.</div>
                        )}

                        {blockedProjects.hasNextPage ? (
                            <BasicButton
                                buttonSize="regular"
                                buttonColor="stroke"
                                extraClasses="w-[50%] mt-4 self-center"
                                onClick={blockedProjects.fetchNextPage}
                            >
                                load more
                            </BasicButton>
                        ) : null}
                    </ul>
                </Disclosure.Panel>
            </Disclosure>
        </div>
    );
};
