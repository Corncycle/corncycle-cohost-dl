import { ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import React, {
    createContext,
    FunctionComponent,
    Reducer,
    useCallback,
    useReducer,
} from "react";
import { Helmet } from "react-helmet-async";
import { ProjectCard } from "../partials/project-card";
import { SidebarMenu } from "../sidebar-menu";
import {
    type Actions,
    type OnAction,
    FollowRequestsContext,
} from "./follow-requests-context";

type FollowRequestsPageProps = {
    requesters: WireProjectModel[];
};

type Requests = {
    [projectId: ProjectId]: {
        project: WireProjectModel;
        actionTaken: boolean;
    };
};
const requestsReducer: Reducer<
    Requests,
    { projectId: ProjectId; action: Actions }
> = (state, data) => {
    switch (data.action) {
        case "accept":
            return {
                ...state,
                [data.projectId]: {
                    ...state[data.projectId],
                    actionTaken: true,
                },
            };
        case "decline": {
            // destructuring to remove the requested project from the list
            const { [data.projectId]: _requester, ...requests } = state;
            return requests;
        }
    }
};

const parseInitialRequesters = (
    initialRequesters: WireProjectModel[]
): Requests =>
    initialRequesters.reduce(
        (requests, requester) => ({
            ...requests,
            [requester.projectId]: { project: requester, actionTaken: false },
        }),
        {}
    );

export const FollowRequests: FunctionComponent<FollowRequestsPageProps> = ({
    requesters: initialRequesters,
}) => {
    const [requests, updateRequests] = useReducer(
        requestsReducer,
        parseInitialRequesters(initialRequesters)
    );
    const onAction = useCallback<OnAction>((projectId, action) => {
        updateRequests({
            action,
            projectId,
        });
    }, []);

    return (
        <>
            <Helmet title="follow requests" />
            <FollowRequestsContext.Provider value={{ onAction }}>
                <div className="container mx-auto mt-16 grid w-full grid-cols-1 gap-16 lg:grid-cols-4">
                    <SidebarMenu />
                    <div
                        // FIXME: theme forced to light here because we haven't rethemed the rest of the site yet
                        data-theme="light"
                        className="co-themed-box cohost-shadow-light dark:cohost-shadow-dark col-span-2 mx-auto w-full max-w-prose rounded-lg bg-notWhite p-3 text-notBlack"
                    >
                        <h1 className="text-2xl font-bold">Follow requests</h1>
                        <div className="mt-6 flex flex-col gap-4">
                            {Object.values(requests).length ? (
                                Object.values(requests).map((request) => (
                                    <ProjectCard
                                        key={request.project.projectId}
                                        project={request.project}
                                        isFollowRequest={!request.actionTaken}
                                    />
                                ))
                            ) : (
                                <p>
                                    You don't currently have any pending follow
                                    requests!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </FollowRequestsContext.Provider>
        </>
    );
};

FollowRequests.displayName = "follow-requests";
export default FollowRequests;
