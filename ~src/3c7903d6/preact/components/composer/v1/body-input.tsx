import { postEditorMachine } from "./post-editor-machine";
import { selectStateMatches } from "@/client/lib/xstate-helpers";
import { useSelector } from "@xstate/react";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StateFrom } from "xstate";
import { ExpandingTextArea } from "../../expanding-text-area";
import { PostComposerContext } from "./post-composer-context";

const selectIsEditing = selectStateMatches("editing");
const selectPlainTextBody = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.markdownBlocks
        .map((block) => block.markdown.content)
        .join("\n\n");

export const BodyInput: FunctionComponent<{
    textAreaRef: React.RefObject<HTMLTextAreaElement>;
}> = ({ textAreaRef }) => {
    const service = useContext(PostComposerContext);
    const { send } = service;
    const { t } = useTranslation();

    const isEditing = useSelector(service, selectIsEditing);
    const plainTextBody = useSelector(service, selectPlainTextBody);

    const onBodyInput: React.KeyboardEventHandler<HTMLTextAreaElement> =
        useCallback(
            ({ currentTarget }) => {
                send({ type: "BODY_INPUT", body: currentTarget.value });
            },
            [send]
        );

    return (
        <ExpandingTextArea
            onInput={onBodyInput}
            disabled={!isEditing}
            className="co-editable-body w-full resize-none overflow-hidden border-none
                    p-0 px-3 focus:ring-0"
            placeholder={t(
                "client:post-editor.body-placeholder",
                "post body (accepts markdown!)"
            )}
            minRows={4}
            value={plainTextBody}
            ref={textAreaRef}
        />
    );
};
