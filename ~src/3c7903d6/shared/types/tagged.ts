// based on https://github.com/colinhacks/zod/issues/678#issuecomment-962387521
export type Tagged<T, Tag> = T & { __tag: Tag };
export function refinement<Type extends Tagged<T, any>, T>() {
    return function (val: T): val is Type {
        return true;
    };
}
