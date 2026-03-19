import { State } from "xstate";

export function selectStateMatches<TContext, TState extends State<TContext>>(
    stateStringOrObj: Parameters<TState["matches"]>[0]
): (state: State<TState>) => boolean {
    return (state) => state.matches(stateStringOrObj);
}
