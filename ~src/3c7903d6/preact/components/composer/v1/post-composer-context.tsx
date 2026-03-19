import React from "react";
import { postEditorMachine } from "./post-editor-machine";
import { InterpreterFrom } from "xstate";

export const PostComposerContext = React.createContext(
    {} as InterpreterFrom<typeof postEditorMachine>
);
