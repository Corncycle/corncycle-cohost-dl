import sitemap from "@/shared/sitemap";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { DateTime } from "luxon";
import React, { FunctionComponent, Suspense, useEffect, useId } from "react";
import { Helmet } from "react-helmet-async";
import { AuthnButton } from "../../partials/authn-button";
import { Disclosure } from "@headlessui/react";
import { Button } from "../../elements/button";
import { trpc } from "@/client/lib/trpc";
import { Loading } from "../../loading";
import { useForm } from "react-hook-form";
import { UserId } from "@/shared/types/ids";
import { useCallback } from "react";

interface Values {
    users: { selected: boolean }[];
    banReason: string;
}

const UserList: FunctionComponent = () => {
    const pendingUsers = trpc.moderation.user.unactivatedUsers.useInfiniteQuery(
        { limit: 50 },
        {
            suspense: true,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );
    const activateMany = trpc.moderation.user.activateMany.useMutation();
    const banMany = trpc.moderation.user.banMany.useMutation();
    const { register, handleSubmit, watch } = useForm<Values>();

    const usersValues = watch("users", []);
    let anyUsersSelected = false;

    for (const usersValue of usersValues) {
        // don't care which user or how many, just as long as one user is selected
        if (usersValue?.selected) {
            anyUsersSelected = true;
            break;
        }
    }

    const onActivateMany = useCallback(
        async (values: Values) => {
            const userIds: UserId[] = values.users
                .map((val, index) => ({
                    userId: index as UserId,
                    selected: val.selected,
                }))
                .filter((val) => val.selected)
                .map((val) => val.userId);

            await activateMany.mutateAsync({ userIds });
            location.reload();
        },
        [activateMany]
    );

    const onBanMany = useCallback(
        async (values: Values) => {
            const userIds: UserId[] = values.users
                .map((val, index) => ({
                    userId: index as UserId,
                    selected: val.selected,
                }))
                .filter((val) => val.selected)
                .map((val) => val.userId);

            await banMany.mutateAsync({ userIds, reason: values.banReason });
            location.reload();
        },
        [banMany]
    );

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>select</th>
                        <th>e-mail</th>
                        <th>self-project handle</th>
                        <th>actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingUsers.data?.pages.map((page) =>
                        page.users.map((user) => (
                            <tr key={user.userId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        {...register(
                                            `users.${user.userId}.selected` as const
                                        )}
                                    />
                                </td>
                                <td>{user.email}</td>
                                <td>{user.selfProject.handle}</td>
                                <td>
                                    <ul>
                                        <li>
                                            <a
                                                href={sitemap.public.moderation
                                                    .manageUser({
                                                        userId: user.userId,
                                                    })
                                                    .toString()}
                                            >
                                                manage user
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={sitemap.public.moderation
                                                    .manageProject({
                                                        projectHandle:
                                                            user.selfProject
                                                                .handle,
                                                    })
                                                    .toString()}
                                            >
                                                manage project
                                            </a>
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {pendingUsers.hasNextPage && (
                <Button
                    buttonStyle="authn"
                    color="authn-other"
                    onClick={() => pendingUsers.fetchNextPage()}
                    disabled={pendingUsers.isFetchingNextPage}
                >
                    load more
                </Button>
            )}
            <Button
                buttonStyle="authn"
                color="authn-other"
                disabled={!anyUsersSelected}
                onClick={handleSubmit(onActivateMany)}
            >
                activate selected users
            </Button>
            <div className="mt-3 flex max-w-fit flex-col gap-2 rounded-lg border border-accent p-3">
                <label>reason for banning users:</label>
                <textarea {...register("banReason")} />
                <Button
                    buttonStyle="authn"
                    color="authn-other"
                    disabled={!anyUsersSelected}
                    onClick={handleSubmit(onBanMany)}
                >
                    ban selected users
                </Button>
            </div>
        </>
    );
};

const BulkActivatePage: FunctionComponent<{
    numUnactivated: number;
    numUnactivatable: number;
    mostRecentInviteDate: string;
}> = ({ numUnactivated, numUnactivatable, mostRecentInviteDate }) => {
    const id = useId();
    const utils = trpc.useContext();

    useEffect(() => {
        // prefetch the first page of the unactivated user list
        void utils.moderation.user.unactivatedUsers.prefetchInfinite({
            limit: 50,
        });
    }, [utils.moderation.user.unactivatedUsers]);

    return (
        <>
            <Helmet title="bulk activate" />
            <div>
                <h1>Bulk user activation</h1>
                <a href={sitemap.public.moderation.home().toString()}>
                    <ChevronLeftIcon className="inline h-6 w-6" />
                    back to moderation home
                </a>
                <p>
                    There are currently {numUnactivated} unactivated users. (
                    {numUnactivatable} without verified email)
                </p>
                <p>
                    Last invite generated{" "}
                    {DateTime.fromISO(mostRecentInviteDate).toRelative({
                        style: "long",
                    })}
                </p>
                <form
                    method="post"
                    className="my-3 flex flex-col gap-3 rounded-lg border border-accent p-3"
                >
                    <input type="hidden" value={0} name="numToActivate" />
                    <AuthnButton as="button" type="submit">
                        activate all users
                    </AuthnButton>
                </form>
                <form
                    method="post"
                    className="my-3 flex flex-col gap-3 rounded-lg border border-accent p-3"
                >
                    <fieldset className="flex flex-col gap-1">
                        <label htmlFor={`${id}:numToActivate`}>
                            number to activate
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={Math.min(numUnactivated, 999)}
                            step={1}
                            id={`${id}:numToActivate`}
                            name="numToActivate"
                            defaultValue={Math.min(numUnactivated, 999)}
                        />
                    </fieldset>
                    <AuthnButton as="button" type="submit">
                        activate users
                    </AuthnButton>
                </form>
            </div>
            <hr />
            <div>
                <Disclosure>
                    <Disclosure.Button
                        as={Button}
                        buttonStyle="authn"
                        color="authn-primary"
                    >
                        show unactivated users
                    </Disclosure.Button>
                    <Disclosure.Panel>
                        <Suspense fallback={<Loading />}>
                            <UserList />
                        </Suspense>
                    </Disclosure.Panel>
                </Disclosure>
            </div>
        </>
    );
};

export default BulkActivatePage;
