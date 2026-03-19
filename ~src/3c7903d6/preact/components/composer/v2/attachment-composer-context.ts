import React from "react";
import { NodeId } from "./document-model";

export const AttachmentComposerContext = React.createContext<
    React.RefObject<{ open: (initialNodeId: NodeId) => void }> | undefined
>(undefined);
