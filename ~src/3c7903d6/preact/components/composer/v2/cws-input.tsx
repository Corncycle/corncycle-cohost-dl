import { TokenInput } from "@/client/preact/components/token-input";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCws,
    selectCwsInputOpen,
    selectIsEditing,
    setCws,
} from "./reducer";

export const CwsInput: FunctionComponent = () => {
    const { t } = useTranslation();

    const isEditing = useSelector(selectIsEditing);
    const cws = useSelector(selectCws);
    const cwsInputOpen = useSelector(selectCwsInputOpen);
    const dispatch = useDispatch();

    const onCwsChange = useCallback(
        (cws: string[]) => {
            dispatch(setCws(cws));
        },
        [dispatch]
    );

    return cwsInputOpen ? (
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
