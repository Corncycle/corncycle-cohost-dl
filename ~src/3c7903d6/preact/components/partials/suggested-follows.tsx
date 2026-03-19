import { trpc } from "@/client/lib/trpc";
import sitemap from "@/shared/sitemap";
import { WireProjectModel } from "@/shared/types/projects";
import React, { FunctionComponent, useCallback } from "react";
import { ProjectCard } from "./project-card";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";

type SuggestedFollows = {
    noPosts: boolean;
    staffProjects: WireProjectModel[];
};

export const SuggestedFollows: FunctionComponent<SuggestedFollows> = ({
    noPosts,
    staffProjects,
}) => {
    const displayPrefs = useDisplayPrefs();
    const utils = trpc.useContext();

    const userSettingsMutation = trpc.login.userSettings.useMutation();
    const dismissSuggestedFollows = useCallback(async () => {
        try {
            await userSettingsMutation.mutateAsync({
                ...displayPrefs,
                suggestedFollowsDismissed: true,
            });
            await utils.users.displayPrefs.invalidate();
        } catch (e) {
            console.error(e);
        }
    }, [displayPrefs, utils, userSettingsMutation]);

    return displayPrefs.suggestedFollowsDismissed ? null : (
        <div className="grid gap-x-6 gap-y-2 lg:grid-cols-[4rem_1fr]">
            <div className="flex-0 h-16 w-16" />
            <div className="cohost-shadow-light dark:cohost-shadow-dark w-full overflow-x-auto rounded-lg bg-notWhite text-notBlack lg:max-w-prose">
                <div className=" bg-mango-100 p-3">
                    <h1 className="text-2xl font-bold">
                        {noPosts
                            ? "No posts here yet!"
                            : "Looking for more posts?"}
                    </h1>
                    <p className="prose">
                        If you're looking for some pages to follow, new users
                        make introductory posts in the{" "}
                        <a
                            href={sitemap.public
                                .tags({
                                    tagSlug: "welcome to cohost",
                                })
                                .toString()}
                        >
                            #welcome to cohost
                        </a>{" "}
                        tag. You're encouraged to post an introduction there
                        yourself! You can also use{" "}
                        <a href={sitemap.public.search().toString()}>search</a>{" "}
                        to find people through tags that interest you and locate
                        people that you know on other sites. We also recommend
                        the hardworking people who make cohost:
                    </p>
                </div>
                <div className="flex flex-col gap-y-3 p-3">
                    {staffProjects.map((project) => (
                        <ProjectCard
                            key={project.projectId}
                            project={project}
                        />
                    ))}
                </div>
                <div className="flex flex-row items-center justify-center self-stretch pb-3">
                    <button
                        className={`flex h-10 cursor-pointer items-center rounded-lg bg-foreground px-3 py-2
                                leading-none tracking-wider text-text hover:bg-foreground-600 active:bg-foreground-600 disabled:bg-foreground-200`}
                        onClick={() => dismissSuggestedFollows()}
                        type="button"
                    >
                        dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};
