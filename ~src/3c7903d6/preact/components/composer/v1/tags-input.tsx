import { selectIsEditing, selectTags } from "./post-editor-machine.helpers";
import { HashtagIcon } from "@heroicons/react/20/solid";
import { useSelector } from "@xstate/react";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { TokenInput } from "../../token-input";
import { PostComposerContext } from "./post-composer-context";

export const TagsInput: FunctionComponent = () => {
    const postEditorService = useContext(PostComposerContext);
    const tags = useSelector(postEditorService, selectTags);
    const isEditing = useSelector(postEditorService, selectIsEditing);

    const { t } = useTranslation();

    const onTagsChange = useCallback(
        (tags: string[]) => {
            postEditorService.send({ type: "TAGS_INPUT", tags });
        },
        [postEditorService]
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
