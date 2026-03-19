import { ProjectId } from "@/shared/types/ids";
import { createContext } from "react";

export type Actions = "accept" | "decline";
export type OnAction = (projectId: ProjectId, action: Actions) => void;

export const FollowRequestsContext = createContext<{
    onAction: OnAction;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
}>({ onAction: () => {} });
