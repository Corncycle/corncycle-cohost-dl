import { Emoji } from "@/client/lib/emoji";
import { tw } from "@/client/lib/tw-tagged-literal";
import { selectStateMatches } from "@/client/lib/xstate-helpers";
import { useSelector } from "@xstate/react";
import React, {
    FunctionComponent,
    KeyboardEventHandler,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { State } from "xstate";
import { CommentModuleContext } from "../../lib/comment-module-machine";
import { useHasCohostPlus } from "../hooks/data-loaders";
import { EmojiButton } from "./composer/emoji-button";
import { ExpandingTextArea } from "./expanding-text-area";

const selectIsLaunching = selectStateMatches("launching");
const selectIsFetchingCommentPermissions = selectStateMatches(
    "fetchingCommentPermissions"
);
const selectIsEditing = selectStateMatches("editing");
const selectIsConfirmingDelete = selectStateMatches("confirmingDelete");
const selectIsSubmitting = selectStateMatches("submitting");
const selectIsDisplayingError = selectStateMatches("displayingError");
const selectIsClean = (state: State<CommentModuleContext>) =>
    state.context.clean;
const selectIsReply = (state: State<CommentModuleContext>) =>
    state.context.inReplyToCommentId !== undefined;
const selectIsEmpty = (state: State<CommentModuleContext>) =>
    state.context.body.trim() === "";

const selectPositionAtCommentId = (state: State<CommentModuleContext>) =>
    state.context.positionAtCommentId;
const selectBody =
    (topLevel: boolean) => (state: State<CommentModuleContext>) => {
        // if we're a reply level composer and we exist at all, we can get the body
        if (!topLevel) return state.context.body;

        // we're actively in a reply, return an empty string to prevent re-renders
        if (state.context.positionAtCommentId) return "";

        return state.context.body;
    };

const selectError = (state: State<CommentModuleContext>) => state.context.error;

type CommentComposerProps = {
    disabled: boolean;
    topLevel: boolean;
};

export const CommentComposer: FunctionComponent<CommentComposerProps> = ({
    disabled,
    topLevel,
}) => {
    const { t } = useTranslation();
    const moduleContext = useContext(CommentModuleContext);
    const { send } = moduleContext;

    const isLaunching = useSelector(moduleContext, selectIsLaunching);
    const isFetchingCommentPermissions = useSelector(
        moduleContext,
        selectIsFetchingCommentPermissions
    );
    const isEditing = useSelector(moduleContext, selectIsEditing);
    const isConfirmingDelete = useSelector(
        moduleContext,
        selectIsConfirmingDelete
    );
    const isSubmitting = useSelector(moduleContext, selectIsSubmitting);
    const isDisplayingError = useSelector(
        moduleContext,
        selectIsDisplayingError
    );
    const isClean = useSelector(moduleContext, selectIsClean);
    const isReply = useSelector(moduleContext, selectIsReply);
    const isEmpty = useSelector(moduleContext, selectIsEmpty);
    const canSubmit = useMemo(
        () => !(disabled || isClean || isEmpty),
        [disabled, isClean, isEmpty]
    );

    const positionAtCommentId = useSelector(
        moduleContext,
        selectPositionAtCommentId
    );

    const memoizedSelectBody = useMemo(() => {
        return selectBody(topLevel);
    }, [topLevel]);
    const body = useSelector(moduleContext, memoizedSelectBody);

    const error = useSelector(moduleContext, selectError);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const hasCohostPlus = useHasCohostPlus();

    const onSelectEmoji = useCallback(
        (emoji: Emoji) => {
            if (textAreaRef.current) {
                const [start, end] = [
                    textAreaRef.current.selectionStart,
                    textAreaRef.current.selectionEnd,
                ];

                textAreaRef.current.setRangeText(
                    emoji.native ?? emoji.shortcodes!,
                    start,
                    end,
                    "end"
                );

                send({
                    type: "COMMENT_INPUT",
                    body: textAreaRef.current.value,
                });
            }
        },
        [send]
    );

    let messageAreaText = "";
    let buttonBar: React.ReactNode;

    const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLElement>>(
        (ev) => {
            if (canSubmit && (ev.metaKey || ev.ctrlKey) && ev.key === "Enter") {
                ev.preventDefault();
                send({ type: "SUBMIT" });
            }
        },
        [canSubmit, send]
    );

    const onClickSubmit = useCallback<
        React.MouseEventHandler<HTMLElement>
    >(() => {
        send({ type: "SUBMIT" });
    }, [send]);
    const onClickCancel = useCallback<
        React.MouseEventHandler<HTMLElement>
    >(() => {
        send({ type: "CANCEL" });
    }, [send]);

    switch (true) {
        case isLaunching:
        case isFetchingCommentPermissions:
            buttonBar = (
                <>
                    {/* spacer div to prevent layout shifts */}
                    <div className="h-9" />
                </>
            );

            break;
        case disabled:
        case isEditing:
            buttonBar = (
                <>
                    <EmojiButton
                        onSelectEmoji={onSelectEmoji}
                        disabled={disabled}
                        hasCohostPlus={!!hasCohostPlus}
                    />
                    <div className="flex-grow">&nbsp;</div>
                    <button
                        className={tw`co-outline-button flex items-center justify-center rounded-lg border-2
                            px-[14px] py-[6px] text-sm font-bold`}
                        onClick={onClickCancel}
                        // should be able to discard an empty reply, or a clean edit,
                        // so you can close the reply composer and go back to the
                        // top-level
                        disabled={
                            disabled ||
                            (isClean && !isReply && !positionAtCommentId)
                        }
                    >
                        {t("client:new-comment.discard-changes", {
                            defaultValue: "discard",
                        })}
                    </button>
                    <button
                        className={tw`co-filled-button flex items-center justify-center rounded-lg
                            px-4 py-2 text-sm font-bold`}
                        onClick={onClickSubmit}
                        disabled={!canSubmit}
                    >
                        {t("client:new-comment.submit", {
                            defaultValue: "submit",
                        })}
                    </button>
                </>
            );

            break;
        case isConfirmingDelete:
            messageAreaText = t("client:delete-comment.are-you-sure", {
                defaultValue:
                    "⬆️ are you sure you want to delete this comment?",
            });
            buttonBar = (
                <>
                    <button
                        className={`flex items-center justify-center
    rounded-lg bg-red px-4 py-2 text-sm font-bold
    hover:bg-red-600 active:bg-red-700 disabled:bg-red-200`}
                        onClick={onClickSubmit}
                    >
                        {t("client:delete-comment.yes", {
                            defaultValue: "delete",
                        })}
                    </button>
                    <button
                        className={`flex items-center justify-center
                rounded-lg bg-green px-4 py-2 text-sm font-bold
                hover:bg-green-600 active:bg-green-700 disabled:bg-green-200`}
                        onClick={onClickCancel}
                    >
                        {t("client:delete-comment.no", {
                            defaultValue: "do not delete",
                        })}
                    </button>
                </>
            );
            break;
        case isSubmitting:
            messageAreaText = t("client:submitting", {
                defaultValue: "submitting...",
            });
            break;
        case isDisplayingError:
            messageAreaText = `error: ${error?.message ?? ""}`;
            buttonBar = (
                <button
                    className={`flex items-center justify-center
            rounded-lg bg-green px-4 py-2 text-sm font-bold
            hover:bg-green-600 active:bg-green-700 disabled:bg-green-200`}
                    onClick={(e) => {
                        e.preventDefault();
                        send({ type: "ACKNOWLEDGE" });
                    }}
                >
                    {t("common:ok", { defaultValue: "ok" })}
                </button>
            );
            break;
    }

    const onInput = React.useCallback<
        KeyboardEventHandler<HTMLTextAreaElement>
    >(
        ({ currentTarget }) => {
            send({
                type: "COMMENT_INPUT",
                body: currentTarget.value,
            });
        },
        [send]
    );

    return (
        // intentionally ignoring this one; just adding a keyboard shortcut for
        // submitting comments, which is accessible in other ways
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div className="flex flex-col gap-4" onKeyDown={onKeyDown}>
            {/**
             * a couple !disabled's scattered around to make sure the root
             * level display is unaffected here
             */}
            {!disabled && isConfirmingDelete ? null : (
                <ExpandingTextArea
                    className={tw`co-composer-text-box`}
                    name="body"
                    minRows={2}
                    placeholder={t("client:new-comment.placeholder", {
                        defaultValue: "leave a comment...",
                    })}
                    onInput={onInput}
                    disabled={disabled || !isEditing}
                    value={disabled ? "" : body}
                    ref={textAreaRef}
                />
            )}
            {!disabled && messageAreaText ? (
                <p className={tw`co-ui-text text-right`}>{messageAreaText}</p>
            ) : null}

            <div className="flex flex-row items-center justify-end gap-4">
                {buttonBar}
            </div>
        </div>
    );
};
