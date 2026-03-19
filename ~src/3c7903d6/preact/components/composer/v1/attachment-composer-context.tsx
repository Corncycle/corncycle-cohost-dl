import React from "react";

export const AttachmentComposerContext = React.createContext<
    React.RefObject<{ open: (initialObject: number) => void }> | undefined
>(undefined);
