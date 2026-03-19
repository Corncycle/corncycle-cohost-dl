import { trpc } from "@/client/lib/trpc";
import { ProjectId, UserId } from "@/shared/types/ids";
import {
    IMutableContext,
    useUnleashContext,
} from "@unleash/proxy-client-react";
import React, {
    FunctionComponent,
    startTransition,
    useContext,
    useEffect,
} from "react";
import { usePrevious } from "../hooks/use-previous";
import { RequiresLoginError } from "@/shared/api-types/errors";
import { useLocation } from "react-router-dom";
import { DateTime } from "luxon";

export type UserInfoType =
    | {
          loggedIn: false;
          userId: null;
          email: null;
          projectId: null;
          modMode: false;
          activated: false;
          readOnly: true;
          emailVerifyCanceled: null;
          emailVerified: null;
          twoFactorActive: false;
          deleteAfter: null;
      }
    | {
          loggedIn: true;
          userId: UserId;
          email: string;
          projectId: ProjectId;
          modMode: boolean;
          activated: boolean;
          readOnly: boolean;
          emailVerifyCanceled: boolean;
          emailVerified: boolean;
          twoFactorActive: boolean;
          deleteAfter: DateTime | null;
      };

const UserInfoContext = React.createContext<UserInfoType>({
    loggedIn: false,
    email: null,
    modMode: false,
    projectId: null,
    userId: null,
    activated: false,
    readOnly: true,
    emailVerifyCanceled: null,
    emailVerified: null,
    twoFactorActive: false,
    deleteAfter: null,
});

export const UserInfoProvider: FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { data: wireUserInfo } = trpc.login.loggedIn.useQuery(undefined, {
        refetchInterval: 15 * 1000,
        suspense: true,
        notifyOnChangeProps: ["data", "error"],
    });

    // convert delete-after from string to date object
    let userInfo: UserInfoType | undefined;

    if (wireUserInfo && wireUserInfo.loggedIn) {
        userInfo = {
            ...wireUserInfo,
            deleteAfter: wireUserInfo.deleteAfter
                ? DateTime.fromISO(wireUserInfo.deleteAfter)
                : null,
        };
    } else if (wireUserInfo) {
        userInfo = wireUserInfo;
    }

    const updateContext = useUnleashContext() as (
        context: IMutableContext
    ) => Promise<void>;

    /**
     * refresh if we log out or the active project/user changes.
     * this helps prevent stale requests from going out, helping prevent
     * unintended behavior for users and keeping things Fresh.
     * we don't reload on `logged out -> logged in` b/c on the subdomain this
     * defaults to logged out and we would just reload every time.
     */
    const previousUserInfo = usePrevious(userInfo);
    useEffect(() => {
        // type check to logged in
        if (userInfo?.loggedIn === true) {
            if (previousUserInfo?.loggedIn) {
                if (
                    userInfo.projectId !== previousUserInfo.projectId ||
                    userInfo.userId !== previousUserInfo.userId
                ) {
                    // we're someone else! refresh
                    window.location.reload();
                }
            }
        } else {
            if (previousUserInfo?.loggedIn) {
                // we logged out! refresh
                window.location.reload();
            }
        }
    }, [
        previousUserInfo,
        previousUserInfo?.loggedIn,
        userInfo?.loggedIn,
        userInfo?.projectId,
        userInfo?.userId,
    ]);

    useEffect(() => {
        startTransition(() => {
            void updateContext({
                userId: userInfo?.loggedIn
                    ? userInfo.userId.toString() ?? undefined
                    : undefined,
            });
        });
    }, [updateContext, userInfo, userInfo?.loggedIn]);

    return (
        // we're using `suspense: true` in the fetcher so userInfo will never
        // actually be undefined.
        // we can only get away with this b/c we're pre-fetching in the server!
        <UserInfoContext.Provider value={userInfo!}>
            {children}
        </UserInfoContext.Provider>
    );
};

export const useUserInfo = () => useContext(UserInfoContext);

export const useRequiresLogin = () => {
    const userInfo = useUserInfo();
    const location = useLocation();

    if (!userInfo.loggedIn) {
        throw new RequiresLoginError("Requires login", location.pathname);
    }
};
