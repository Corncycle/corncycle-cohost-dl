import {
    makeSourceURL,
    selectAttachments,
} from "./post-editor-machine.helpers";
import { tw } from "@/client/lib/tw-tagged-literal";
import { Dialog } from "@headlessui/react";
import { useSelector } from "@xstate/react";
import classNames from "classnames";
import React, {
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { Attachment } from "./post-editor-machine";
import { BasicButton } from "../../elements/basic-button";
import { ExpandingTextArea } from "../../expanding-text-area";
import { useDynamicTheme } from "../../../hooks/dynamic-theme";
import { ModalOverlay } from "../../util";
import { PostComposerContext } from "./post-composer-context";

const AttachmentComposer = React.forwardRef<{
    open: (initialIndex: number) => void;
}>((props, ref) => {
    const service = useContext(PostComposerContext);
    const send = service.send;
    const attachments = useSelector(service, selectAttachments);
    const [isOpen, setIsOpen] = useState(false);
    const dynamicTheme = useDynamicTheme();

    const attachmentChooserData = useMemo(() => {
        const data: {
            index: number;
            attachment: Attachment & { kind: "image" };
            sourceURL: string;
        }[] = [];

        attachments.forEach((attachment, index) => {
            if (attachment.kind === "image")
                data.push({
                    index,
                    attachment,
                    sourceURL: makeSourceURL(attachment),
                });
        });

        return data;
    }, [attachments]);

    const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<
        number | undefined
    >(undefined);

    const activeAttachmentChooserData = useMemo(
        () =>
            attachmentChooserData.find(
                (data) => data.index === activeAttachmentIndex
            ),
        [attachmentChooserData, activeAttachmentIndex]
    );

    useImperativeHandle(
        ref,
        () => {
            return {
                open(initialIndex: number) {
                    setIsOpen(true);
                    setActiveAttachmentIndex(initialIndex);
                },
            };
        },
        []
    );

    const onAltTextChange = useCallback<
        React.ChangeEventHandler<HTMLTextAreaElement>
    >(
        (e) => {
            if (activeAttachmentIndex !== undefined) {
                send({
                    type: "ALT_TEXT_INPUT",
                    index: activeAttachmentIndex,
                    input: e.currentTarget.value,
                });
            }
        },
        [activeAttachmentIndex, send]
    );

    const altTextEditorRef = useRef(null);

    const [dialogRef, setDialogRef] = useState<HTMLDialogElement | null>(null);

    useEffect(() => {
        if (isOpen && dialogRef?.open !== true) {
            dialogRef?.showModal();
        } else if (!isOpen && dialogRef?.open === true) {
            dialogRef?.close();
        }
    }, [dialogRef, isOpen]);

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
                {attachmentChooserData.map((data) => (
                    <button
                        key={data.index}
                        onClick={() => setActiveAttachmentIndex(data.index)}
                    >
                        <img
                            src={data.sourceURL}
                            className={classNames(
                                "h-[4.5rem] w-[4.5rem] object-cover",
                                data.index === activeAttachmentIndex
                                    ? tw`co-active border-4`
                                    : "opacity-50"
                            )}
                            alt={data.attachment.metadata.altText}
                        />
                    </button>
                ))}
            </div>

            <label>
                <p className={tw`co-ui-text font-bold`}>image description</p>

                <ExpandingTextArea
                    name="alt-text"
                    ref={altTextEditorRef}
                    minRows={1}
                    onChange={onAltTextChange}
                    className="co-editable-body"
                    value={
                        activeAttachmentChooserData?.attachment.metadata.altText
                    }
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
