import { z } from "zod";

export enum AccessResult {
    Allowed = "allowed",
    NotAllowed = "not-allowed",
    LogInFirst = "log-in-first",
    Blocked = "blocked",
}

export const AccessResultEnum = z.nativeEnum(AccessResult);

export interface AccessFlags {
    canRead: AccessResult;
    canInteract: AccessResult;
    canShare: AccessResult;
    canEdit: AccessResult;
}
