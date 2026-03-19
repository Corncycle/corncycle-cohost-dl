import {
    type Dispatch,
    type SetStateAction,
    useState,
    useTransition,
} from "react";

type UseTransitionState = <S>(
    initialState: S | (() => S)
) => [S, Dispatch<SetStateAction<S>>];

export const useTransitionState: UseTransitionState = (...args) => {
    const [state, setState] = useState(...args);
    const [isTransitioning, startTransition] = useTransition();

    const setStateWithTransition: typeof setState = (newState) => {
        startTransition(() => {
            setState(newState);
        });
    };

    return [state, setStateWithTransition];
};
