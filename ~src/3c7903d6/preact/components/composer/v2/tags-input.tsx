import { HashtagIcon } from "@heroicons/react/20/solid";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TokenInput } from "../../token-input";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { selectIsEditing, selectTags, setTags } from "./reducer";

export const TagsInput: FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const tags = useAppSelector(selectTags);
    const isEditing = useAppSelector(selectIsEditing);

    const { t } = useTranslation();

    const onTagsChange = useCallback(
        (tags: string[]) => {
            dispatch(setTags(tags));
        },
        [dispatch]
    );

    return (
        <TokenInput
            className="co-editable-body w-full p-0 px-3 leading-none"
            TokenIcon={HashtagIcon}
            tokens={tags}
            setTokens={onTagsChange}
            placeholder={t("client:post-editor.tags-placeholder", "#add tags")}
            disabled={!isEditing}
            getSuggestions={true}
            fieldName="tag"
        />
    );
};
