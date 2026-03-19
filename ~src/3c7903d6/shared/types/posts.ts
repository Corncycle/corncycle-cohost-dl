import { z } from "zod";

export enum PostState {
    Unpublished = 0,
    Published,
    Deleted,
}

export const PostStateEnum = z.nativeEnum(PostState);
export type PostStateEnum = z.infer<typeof PostStateEnum>;
