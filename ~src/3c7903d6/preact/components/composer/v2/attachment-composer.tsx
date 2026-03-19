import { tw } from "@/client/lib/tw-tagged-literal";
import classNames from "classnames";
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
    forwardRef,
} from "react";
import { useDynamicTheme } from "../../../hooks/dynamic-theme";
import { BasicButton } from "../../elements/basic-button";
import { ExpandingTextArea } from "../../expanding-text-area";
import {
    ImageAttachmentNode,
    NodeId,
    isImageAttachmentNode,
} from "./document-model";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { selectBody, updateImageAltText } from "./reducer";

const AttachmentComposer = forwardRef<{
    open: (initialNodeId: NodeId) => void;
}>((props, ref) => {
    const body = useAppSelector(selectBody);
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const dynamicTheme = useDynamicTheme();

    const [activeNodeId, setActiveNodeId] = useState<NodeId | null>(null);
    const activeNode = activeNodeId
        ? (body.nodes[activeNodeId] as ImageAttachmentNode)
        : null;

    useImperativeHandle(
        ref,
        () => {
            return {
                open(initialNodeId: NodeId) {
                    setIsOpen(true);
                    setActiveNodeId(initialNodeId);
                },
            };
        },
        []
    );

    const onAltTextChange = useCallback<
        React.ChangeEventHandler<HTMLTextAreaElement>
    >(
        (e) => {
            if (activeNodeId) {
                dispatch(
                    updateImageAltText({
                        nodeId: activeNodeId,
                        altText: e.currentTarget.value,
                    })
                );
            }
        },
        [activeNodeId, dispatch]
    );

    const [dialogRef, setDialogRef] = useState<HTMLDialogElement | null>(null);

    useEffect(() => {
        if (isOpen && dialogRef?.open !== true) {
            dialogRef?.showModal();
        } else if (!isOpen && dialogRef?.open === true) {
            dialogRef?.close();
        }
    }, [dialogRef, isOpen]);

    const imageNodes = useMemo(() => {
        const nodes: { index: number; node: ImageAttachmentNode }[] = [];

        Object.values(body.nodes).forEach((node, index) => {
            // TODO: fix index to actually reflect attachment order
            if (!isImageAttachmentNode(node)) return;

            nodes.push({ node, index });
        });

        return nodes;
    }, [body]);

    return (
        <dialog
            ref={setDialogRef}
            // @ts-expect-error again, typedefs are broken for dialog
            onClose={() => {
                setIsOpen(false);
            }}
            data-theme={dynamicTheme.current}
            className="co-themed-box co-attachment-composer cohost-shadow-light dark:cohost-shadow-dark h-max w-full max-w-prose flex-col gap-2 rounded-lg p-3 backdrop:bg-notBlack/90 open:flex"
        >
            <div className="flex flex-row justify-center gap-9">
                {imageNodes.map(({ index, node }) => (
                    <button
                        key={node.nodeId}
                        onClick={() => setActiveNodeId(node.nodeId)}
                    >
                        <img
                            src={node.sourceUrl}
                            className={classNames(
                                "h-[4.5rem] w-[4.5rem] object-cover",
                                node.nodeId === activeNodeId
                                    ? tw`co-active border-4`
                                    : "opacity-50"
                            )}
                            alt={node.altText}
                        />
                    </button>
                ))}
            </div>

            <label>
                <p className={tw`co-ui-text font-bold`}>image description</p>

                <ExpandingTextArea
                    name="alt-text"
                    minRows={1}
                    onChange={onAltTextChange}
                    className="co-editable-body"
                    value={activeNode?.altText}
                />
            </label>

            <BasicButton
                buttonSize="regular"
                buttonColor="post-box-filled"
                extraClasses="self-end"
                onClick={() => setIsOpen(false)}
            >
                done
            </BasicButton>
        </dialog>
    );
});
AttachmentComposer.displayName = "AttachmentComposer";

export default AttachmentComposer;
