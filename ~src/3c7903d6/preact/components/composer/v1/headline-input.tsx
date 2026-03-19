import { selectHeadline, selectIsEditing } from "./post-editor-machine.helpers";
import { tw } from "@/client/lib/tw-tagged-literal";
import { useSelector } from "@xstate/react";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ExpandingTextArea } from "../../expanding-text-area";
import { PostComposerContext } from "./post-composer-context";

export const HeadlineInput: FunctionComponent = React.memo(() => {
    const service = useContext(PostComposerContext);
    const { send } = service;
    const { t } = useTranslation();

    const onHeadlineInput: React.KeyboardEventHandler<HTMLTextAreaElement> =
        useCallback(
            ({ currentTarget }) => {
                send({
                    type: "HEADLINE_INPUT",
                    headline: currentTarget.value,
                });
            },
            [send]
        );

    const headline = useSelector(service, selectHeadline);
    const isEditing = useSelector(service, selectIsEditing);

    return (
        <div className="flex w-full flex-row items-end justify-between gap-3">
            <ExpandingTextArea
                className={tw`co-editable-body w-full flex-1 resize-none overflow-hidden 
                    break-words border-none p-0 px-3 font-atkinson text-xl font-bold focus:ring-0`}
                placeholder={t(
                    "client:post-editor.headline-placeholder",
                    "headline"
                )}
                name="headline"
                onInput={onHeadlineInput}
                disabled={!isEditing}
                minRows={1}
                value={headline}
            />
            {headline.length > 100 ? (
                <div className="flex-none px-3 tabular-nums text-gray-500">
                    {headline.length}
                    /140
                </div>
            ) : null}
        </div>
    );
});
HeadlineInput.displayName = "HeadlineInput";
