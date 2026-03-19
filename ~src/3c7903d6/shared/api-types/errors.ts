import { z } from "zod";

export const APIErrorCode = z.enum([
    "application-error",
    "not-authorized",
    "not-logged-in",
    "not-found",
    "explicitly-disallowed",
    /** @deprecated */ "object-does-not-exist",
    "user-does-not-exist",
    "project-does-not-exist",
    "post-does-not-exist",
    "ask-does-not-exist",
    "listing-does-not-exist",
    "tag-does-not-exist",
    "object-is-already-in-state",
    "invalid-operation",
    "login-failed",
    "operation-failed",
    "illegal-handle",
    "handle-already-in-use",
    "email-already-in-use",
    "user-too-young",
    "illegal-content-type",
    "attachment-too-large",
    "incorrect-totp",
    "invalid-metadata",
]);
export type APIErrorCode = z.infer<typeof APIErrorCode>;

export class APIError extends Error {
    constructor(
        public message: string,
        public errorCode: APIErrorCode,
        public retriesRemaining?: number
    ) {
        super(message);
    }
}

export class RequiresLoginError extends Error {
    constructor(
        public message: string = "Requires login",
        public redirectUrl?: string
    ) {
        super(message);
    }
}
