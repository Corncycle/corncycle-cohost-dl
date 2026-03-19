import React, { FunctionComponent } from "react";

export const NoPostsPlaceholder: FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <div
            className={`cohost-shadow-light dark:cohost-shadow-dark flex flex-row 
                gap-3 rounded-lg bg-notWhite p-3 text-cherry`}
        >
            {children}
        </div>
    );
};
