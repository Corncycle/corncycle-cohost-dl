import {
    createContext,
    createElement,
    FunctionComponent,
    useContext,
} from "react";
import type { Configuration } from "rollbar";
import Rollbar from "rollbar";

const RollbarContext = createContext<Rollbar | null>(null);

export const RollbarProvider: FunctionComponent<{
    config: Configuration;
    children: React.ReactNode;
}> = ({ config, children }) => {
    const rollbar = new Rollbar({
        ...config,
        // substring match, per https://docs.rollbar.com/docs/javascript/#section-ignoring-specific-exception-messages
        ignoredMessages: ["Minified React error"],
    });
    return createElement(
        RollbarContext.Provider,
        {
            value: rollbar,
        },
        children
    );
};

export const useRollbar = () => useContext(RollbarContext);
