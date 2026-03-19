import {
    selectIsEditing,
    selectCws,
    selectEditingCws,
} from "./post-editor-machine.helpers";
import { selectStateMatches } from "@/client/lib/xstate-helpers";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useSelector } from "@xstate/react";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StateFrom } from "xstate";
import { TokenInput } from "@/client/preact/components/token-input";
import { PostComposerContext } from "./post-composer-context";

export const CwsInput: FunctionComponent = () => {
    const service = useContext(PostComposerContext);
    const { send } = service;
    const { t } = useTranslation();

    const isEditing = useSelector(service, selectIsEditing);
    const cws = useSelector(service, selectCws);
    const editingCws = useSelector(service, selectEditingCws);

    const onCwsChange = useCallback(
        (cws: string[]) => {
            send({ type: "CWS_INPUT", cws });
        },
        [send]
    );

    return editingCws ? (
        <TokenInput
            TokenIcon={ExclamationTriangleIcon}
            className="co-editable-body w-full p-0 px-3 leading-none"
            tokens={cws}
            setTokens={onCwsChange}
            placeholder={t(
                "client:post-editor.cws-placeholder",
                "add content warnings"
            )}
            disabled={!isEditing}
            fieldName="CW"
        />
    ) : null;
};
