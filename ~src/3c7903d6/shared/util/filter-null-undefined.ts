export const isDefined = <T>(data: T | null | undefined): data is T =>
    data !== null && data !== undefined;

export const isTruthy = <T>(data: T | null | undefined): data is T => !!data;
