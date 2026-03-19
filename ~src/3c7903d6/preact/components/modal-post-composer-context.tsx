import React from "react";
import type { PostComposerProps } from "./composer/api";
import { noop } from "lodash";
import { PostId } from "@/shared/types/ids";

export type ModalPostComposerProps = PostComposerProps;
export type ActivateOpts = Pick<
    ModalPostComposerProps,
    "shareOf" | "responseToAskId"
> & {
    onPost?: (postId: PostId | undefined) => void;
};
export type SetupOpts = Pick<ModalPostComposerProps, "project">;

export const ModalPostComposerContext = React.createContext<{
    activate: (opts: ActivateOpts) => void;
    isOpen: boolean;
    close: () => void;
    setup: (props: SetupOpts) => void;
    hasBeenSetup: boolean;
}>({
    activate: noop,
    isOpen: false,
    close: noop,
    setup: noop,
    hasBeenSetup: false,
});

export const useModalPostComposer = () => {
    return React.useContext(ModalPostComposerContext);
};
