import { z } from "zod";

/**
 * a simple tagged template literal that we can use to activate tailwind
 * intellisense; also introduce a tagged string type here so that methods which take
 * class names can enforce using the tagged template.
 */

// based on https://github.com/colinhacks/zod/issues/678#issuecomment-962387521
export type Tagged<T, Tag> = T & { __tag: Tag };
export function refinement<Type extends Tagged<T, any>, T>() {
    return function (val: T): val is Type {
        return true;
    };
}

export type TailwindClasses = Tagged<string, "TailwindClasses">;
export const TailwindClasses = z
    .string()
    .refine(refinement<TailwindClasses, string>());

export const tw = (
    strings: TemplateStringsArray,
    ...values: any[]
): TailwindClasses =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    String.raw({ raw: strings }, ...values) as TailwindClasses;
