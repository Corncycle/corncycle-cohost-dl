import React, { FunctionComponent } from "react";

export const Bounce: FunctionComponent<{ children: React.ReactNode }> = (
    props
) => {
    return <span className="animate-bounce">{props.children}</span>;
};
