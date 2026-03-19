import { useCallback, useEffect } from "react";

const useBeforeUnload = (cb: (evt: BeforeUnloadEvent) => unknown) => {
    const handleBeforeUnload = useCallback(
        (evt: BeforeUnloadEvent) => {
            const returnValue = cb(evt);
            if (returnValue) {
                evt.preventDefault();
                evt.returnValue = returnValue;
            }
            return returnValue;
        },
        [cb]
    );

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [handleBeforeUnload]);
};

export default useBeforeUnload;
