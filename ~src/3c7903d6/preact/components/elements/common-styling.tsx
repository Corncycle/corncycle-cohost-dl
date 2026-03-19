import { z } from "zod";

export const ButtonSize = z.enum(["small", "regular"]);
export type ButtonSize = z.infer<typeof ButtonSize>;

export const smallClasses = "text-xs font-bold";
export const regularClasses = "text-base font-normal";
