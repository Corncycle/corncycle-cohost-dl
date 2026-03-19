import React, { Fragment, useEffect, useState } from "react";

export const useSSR = () => {
    const [isServer, setIsServer] = useState(true);

    useEffect(() => {
        setIsServer(false);
    }, []);

    return { isServer, isBrowser: !isServer };
};

export const ClientOnly: React.FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { isBrowser } = useSSR();

    return isBrowser ? React.createElement(Fragment, {}, children) : null;
};

export const ServerOnly: React.FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { isServer } = useSSR();

    return isServer ? React.createElement(Fragment, {}, children) : null;
};
