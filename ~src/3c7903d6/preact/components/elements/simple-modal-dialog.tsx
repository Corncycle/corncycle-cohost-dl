import { Dialog } from "@headlessui/react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { ModalOverlay } from "../util";
import {
    BasicButton,
    ButtonColor,
} from "@/client/preact/components/elements/basic-button";

type SimpleModalDialogProps = {
    isOpen: boolean;
    title?: string;
    body: string;
    confirm: {
        label: string;
        color?: ButtonColor;
    };
    cancel?: {
        label: string;
        color?: ButtonColor;
    };
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactChild;
};

/**
 * @deprecated should no longer be used for new development, preferring
 * SimpleNativeModalDialog
 */
export const SimpleModalDialog: FunctionComponent<SimpleModalDialogProps> = (
    props
) => (
    <Dialog open={props.isOpen} onClose={props.onCancel}>
        <ModalOverlay />
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center py-20">
                <Dialog.Panel
                    as="div"
                    className="cohost-shadow-light dark:cohost-shadow-dark relative mx-auto max-w-sm rounded-lg bg-notWhite p-3 text-notBlack"
                >
                    {props.title ? (
                        <Dialog.Title className="text-[1.25rem] font-bold leading-6">
                            {props.title}
                        </Dialog.Title>
                    ) : null}

                    <div className="mt-2">
                        <p className="text-sm">{props.body}</p>
                    </div>

                    {props.children && props.children}

                    <div className="mt-4 flex flex-row justify-end gap-2">
                        {props.cancel ? (
                            <BasicButton
                                buttonSize="regular"
                                buttonColor={props.cancel.color ?? "stroke"}
                                onClick={props.onCancel}
                            >
                                {props.cancel.label}
                            </BasicButton>
                        ) : null}
                        <BasicButton
                            buttonSize="regular"
                            buttonColor={props.confirm.color ?? "cherry"}
                            onClick={props.onConfirm}
                        >
                            {props.confirm.label}
                        </BasicButton>
                    </div>
                </Dialog.Panel>
            </div>
        </div>
    </Dialog>
);

export const SimpleNativeModalDialog: FunctionComponent<
    SimpleModalDialogProps
> = (props) => {
    const [dialogRef, setDialogRef] = useState<HTMLDialogElement | null>(null);

    useEffect(() => {
        if (props.isOpen && dialogRef?.open !== true) {
            dialogRef?.showModal();
        } else if (!props.isOpen && dialogRef?.open === true) {
            dialogRef?.close();
        }
    }, [dialogRef, props.isOpen]);

    return (
        <dialog
            ref={setDialogRef}
            className="cohost-shadow-light dark:cohost-shadow-dark max-w-sm rounded-lg bg-notWhite p-3 text-notBlack backdrop:bg-notBlack/90"
            //@ts-expect-error it's real, don't believe their lies
            onCancel={(e: Event) => {
                e.preventDefault();
                props.onCancel();
            }}
        >
            {props.title ? (
                <h2 className="text-[1.25rem] font-bold leading-6">
                    {props.title}
                </h2>
            ) : null}
            <div className="mt-2">
                <p className="text-sm">{props.body}</p>
            </div>

            {props.children && props.children}

            <div className="mt-4 flex flex-row justify-end gap-2">
                {props.cancel ? (
                    <BasicButton
                        buttonSize="regular"
                        buttonColor={props.cancel.color ?? "stroke"}
                        onClick={props.onCancel}
                    >
                        {props.cancel.label}
                    </BasicButton>
                ) : null}
                <BasicButton
                    buttonSize="regular"
                    buttonColor={props.confirm.color ?? "cherry"}
                    onClick={props.onConfirm}
                >
                    {props.confirm.label}
                </BasicButton>
            </div>
        </dialog>
    );
};
