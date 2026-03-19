import { z } from "zod";

// actual values don't matter, but higher-numbered following states cover up
// lower-numbered ones
export enum FollowingState {
    NotFollowing = 0,
    FollowRequested = 1,
    Following = 2,
}

export const FollowingStateEnum = z.nativeEnum(FollowingState);
export type FollowingStateEnum = z.infer<typeof FollowingStateEnum>;
