/* eslint-disable @typescript-eslint/require-await */

import type { AppRouter } from "@/src/routes/api/trpc-type";
import { TRPCClientError } from "@trpc/client";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { createContext } from "react";
import { assign, createMachine, InterpreterFrom } from "xstate";
import { pure, raise } from "xstate/lib/actions";
import { getVanillaClient } from "./trpc-vanilla";

export interface TwoFactorManagementContext {
    enabled: boolean | undefined;
    email: string | undefined;
    baseSecret: string | undefined;
    baseSecretDataUrl: string | undefined;
    recoverySecret: string | undefined;
    token: string | undefined;
    retriesRemaining: number | undefined;
    resolvingTRPCError: TRPCClientError<AppRouter> | undefined;
}

export type TwoFactorManagementEvent =
    | { type: "INITIALIZE"; enabled: boolean }
    | { type: "SETUP_START" }
    | { type: "SETUP_ENTER_TOKEN"; token: string }
    | { type: "SETUP_DONE"; recoverySecret: string }
    | { type: "SETUP_RETRY_TOKEN" }
    | { type: "SETUP_FATAL_ERROR"; error: Error }
    | { type: "RESET_START" }
    | { type: "RESET_ENTER_TOKEN"; token: string }
    | { type: "RESET_DONE" }
    | { type: "RESET_RETRY_TOKEN"; retriesRemaining: number }
    | { type: "RESET_FATAL_ERROR"; error: Error }
    | { type: "ACKNOWLEDGE" }
    | { type: "CANCEL" };

const trpc = getVanillaClient();

export const twoFactorManagementMachine = createMachine<
    TwoFactorManagementContext,
    TwoFactorManagementEvent
>(
    {
        initial: "initializing",
        strict: true,
        context: {
            enabled: undefined,
            email: undefined,
            baseSecret: undefined,
            baseSecretDataUrl: undefined,
            recoverySecret: undefined,
            token: undefined,
            retriesRemaining: undefined,
            resolvingTRPCError: undefined,
        },
        states: {
            initializing: {
                id: "initializing",
                invoke: {
                    src: "get2FAState",
                    onDone: [
                        {
                            target: "enabled",
                            cond: "is2FAEnabled",
                        },
                        { target: "disabled" },
                    ],
                },
            },
            disabled: {
                initial: "idle",
                states: {
                    idle: {
                        id: "disabledIdle",
                        on: {
                            SETUP_START: {
                                target: "setup",
                            },
                        },
                    },
                    setup: {
                        initial: "promptingBaseSecret",
                        states: {
                            promptingBaseSecret: {
                                invoke: {
                                    src: "generateBaseSecret",
                                    onDone: {
                                        actions: assign((context, event) => {
                                            const data = event.data as {
                                                baseSecret: string;
                                                dataUrl: string;
                                            };

                                            return {
                                                baseSecret: data.baseSecret,
                                                baseSecretDataUrl: data.dataUrl,
                                            };
                                        }),
                                    },
                                    onError: {
                                        target: "#setupError",
                                    },
                                },
                                on: {
                                    ACKNOWLEDGE: {
                                        target: "confirmingToken",
                                    },
                                    CANCEL: { target: "#disabledIdle" },
                                },
                            },
                            confirmingToken: {
                                initial: "awaitingInput",
                                states: {
                                    awaitingInput: {
                                        on: {
                                            SETUP_ENTER_TOKEN: {
                                                target: "sending",
                                                actions: assign(
                                                    (_context, event) => {
                                                        return {
                                                            token: event.token,
                                                        };
                                                    }
                                                ),
                                            },
                                            CANCEL: { target: "#disabledIdle" },
                                        },
                                    },
                                    sending: {
                                        invoke: {
                                            src: "sendSetup",
                                            // FIXME: xstate's type signatures require
                                            // that all actions returned from an
                                            // invoke.onDone/invoke.onError take
                                            // DoneInvokeEvents, even if you're
                                            // returning them from pure() or similar;
                                            // cast around this
                                            onDone: {
                                                actions: pure(
                                                    (_context, event) =>
                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                                        [
                                                            raise(event.data),
                                                        ] as any
                                                ),
                                            },
                                            onError: {
                                                actions: pure(
                                                    (_context, event) =>
                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                                        [
                                                            raise(event.data),
                                                        ] as any
                                                ),
                                            },
                                        },
                                        on: {
                                            SETUP_DONE: {
                                                target: "#setupDone",
                                                actions: assign(
                                                    (_context, event) => {
                                                        return {
                                                            recoverySecret:
                                                                event.recoverySecret,
                                                        };
                                                    }
                                                ),
                                            },
                                            SETUP_RETRY_TOKEN: {
                                                target: "awaitingInput",
                                                actions: assign((context) => {
                                                    return {
                                                        retriesRemaining:
                                                            (context.retriesRemaining ??
                                                                3) - 1,
                                                    };
                                                }),
                                            },
                                            SETUP_FATAL_ERROR: {
                                                target: "#setupError",
                                            },
                                        },
                                    },
                                },
                                exit: [
                                    assign(() => {
                                        return {
                                            retriesRemaining: undefined,
                                        };
                                    }),
                                ],
                            },
                        },
                        exit: [
                            assign(() => {
                                return {
                                    baseSecret: undefined,
                                    baseSecretDataUrl: undefined,
                                    recoverySecret: undefined,
                                    token: undefined,
                                };
                            }),
                        ],
                    },
                    setupDone: {
                        id: "setupDone",
                        on: {
                            ACKNOWLEDGE: {
                                target: "#initializing",
                            },
                        },
                    },
                    setupError: {
                        id: "setupError",
                        on: {
                            ACKNOWLEDGE: {
                                target: "#initializing",
                            },
                        },
                    },
                },
            },
            enabled: {
                initial: "idle",
                states: {
                    idle: {
                        id: "enabledIdle",
                        on: {
                            RESET_START: {
                                target: "reset",
                            },
                        },
                    },
                    reset: {
                        initial: "confirmingToken",
                        states: {
                            confirmingToken: {
                                initial: "awaitingInput",
                                states: {
                                    awaitingInput: {
                                        on: {
                                            RESET_ENTER_TOKEN: {
                                                target: "sending",
                                                actions: assign(
                                                    (_context, event) => {
                                                        return {
                                                            token: event.token,
                                                        };
                                                    }
                                                ),
                                            },
                                            CANCEL: {
                                                target: "#enabledIdle",
                                            },
                                        },
                                    },
                                    sending: {
                                        invoke: {
                                            src: "sendReset",
                                            // FIXME: xstate's type signatures require
                                            // that all actions returned from an
                                            // invoke.onDone/invoke.onError take
                                            // DoneInvokeEvents, even if you're
                                            // returning them from pure() or similar;
                                            // cast around this
                                            onDone: {
                                                actions: pure(
                                                    (_context, event) =>
                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                                        [
                                                            raise(event.data),
                                                        ] as any
                                                ),
                                            },
                                            onError: {
                                                actions: pure(
                                                    (_context, event) =>
                                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                                        [
                                                            raise(event.data),
                                                        ] as any
                                                ),
                                            },
                                        },
                                        on: {
                                            RESET_DONE: {
                                                target: "#initializing",
                                            },
                                            RESET_RETRY_TOKEN: {
                                                target: "awaitingInput",
                                                actions: assign((context) => {
                                                    return {
                                                        retriesRemaining:
                                                            (context.retriesRemaining ??
                                                                3) - 1,
                                                    };
                                                }),
                                            },
                                            RESET_FATAL_ERROR: {
                                                target: "#resetError",
                                            },
                                        },
                                    },
                                },
                                exit: [
                                    assign(() => {
                                        return {
                                            retriesRemaining: undefined,
                                        };
                                    }),
                                ],
                            },
                        },
                        exit: [
                            assign(() => {
                                return {
                                    token: undefined,
                                };
                            }),
                        ],
                    },
                    resetError: {
                        id: "resetError",
                        on: {
                            ACKNOWLEDGE: {
                                target: "#initializing",
                            },
                        },
                    },
                },
            },
        },
    },
    {
        services: {
            get2FAState: async (context) => {
                const res = await trpc.login.is2FAEnabled.query();

                context.enabled = res;
            },
            generateBaseSecret: async (context) => {
                const trpc = getVanillaClient();

                const baseSecret = (
                    await trpc.login.generate2FABaseSecret.mutate(undefined)
                ).baseSecret;

                const keyuri = authenticator.keyuri(
                    context.email!,
                    "cohost.org",
                    baseSecret
                );

                return new Promise((resolve, reject) =>
                    qrcode.toDataURL(keyuri, (e, url) => {
                        if (e) {
                            reject(e);
                        } else {
                            resolve({
                                dataUrl: url,
                                baseSecret,
                            });
                        }
                    })
                );
            },
            sendSetup: async (context, _event) => {
                const trpc = getVanillaClient();

                if (!context.baseSecret || !context.token)
                    throw "assertion failure: 2FA setup process isn't done";

                try {
                    const res = await trpc.login.setup2FA.mutate({
                        token: context.token,
                    });

                    return {
                        type: "SETUP_DONE",
                        recoverySecret: res.recoverySecret,
                    };
                } catch (e) {
                    if (e instanceof TRPCClientError) {
                        const err = e as TRPCClientError<AppRouter>;

                        if (err?.data?.errorCode === "incorrect-totp") {
                            return {
                                type: "SETUP_RETRY_TOKEN",
                            };
                        }
                    }

                    return {
                        type: "SETUP_FATAL_ERROR",
                        error: e as Error,
                    };
                }
            },
            sendReset: async (context, _event) => {
                console.warn("in sendReset");

                const trpc = getVanillaClient();

                if (!context.token)
                    throw "assertion failure: 2FA setup process isn't done";

                try {
                    const res = await trpc.login.reset2FA.mutate({
                        token: context.token,
                    });

                    return {
                        type: "RESET_DONE",
                    };
                } catch (e) {
                    if (e instanceof TRPCClientError) {
                        const err = e as TRPCClientError<AppRouter>;

                        if (err?.data?.errorCode === "incorrect-totp") {
                            return {
                                type: "RESET_RETRY_TOKEN",
                                retriesRemaining: err.data.retriesRemaining!,
                            };
                        }
                    }

                    return {
                        type: "RESET_FATAL_ERROR",
                        error: e as Error,
                    };
                }
            },
        },
        guards: {
            is2FAEnabled: (context) => !!context.enabled,
        },
    }
);

export const TwoFactorManagementContext = createContext(
    {} as InterpreterFrom<typeof twoFactorManagementMachine>
);
