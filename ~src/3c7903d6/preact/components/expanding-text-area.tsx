/**
 * Adapted from https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
 */

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import {
    Control,
    ControllerRenderProps,
    FieldValue,
    FieldValues,
    UseControllerProps,
    useController,
} from "react-hook-form";

type ExpandingTextAreaProps =
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        minRows: number;
    };

const copyStyles = (
    styles: CSSStyleDeclaration,
    node: HTMLElement,
    minRows: number
) => {
    node.style.fontSize = styles.fontSize;
    node.style.fontFamily = styles.fontFamily;
    node.style.fontWeight = styles.fontWeight;
    node.style.fontStyle = styles.fontStyle;
    node.style.letterSpacing = styles.letterSpacing;
    node.style.textTransform = styles.textTransform;
    node.style.padding = styles.padding;
    node.style.lineHeight = styles.lineHeight;
    node.style.minHeight = `${minRows * parseInt(styles.lineHeight)}px`;
};

export const ExpandingTextArea = forwardRef<
    HTMLTextAreaElement | null,
    ExpandingTextAreaProps
>(({ minRows, className, ...props }, ref) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
        ref,
        () => textAreaRef.current
    );

    const resizerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (resizerRef.current && textAreaRef.current) {
            const styles = window.getComputedStyle(textAreaRef.current);
            copyStyles(styles, resizerRef.current, minRows);
        }
    }, [minRows]);

    const classes = useMemo(
        () =>
            `${
                className ?? ""
            } w-full row-start-1 row-end-2 col-start-1 col-end-2 min-h-0`,
        [className]
    );

    return (
        <div className={`relative grid w-full overflow-auto`}>
            <div
                ref={resizerRef}
                className={`invisible col-start-1 col-end-2 row-start-1 row-end-2
                            h-min overflow-auto whitespace-pre-wrap break-words`}
            >
                {props.value}{" "}
            </div>
            <textarea
                style={{
                    resize: "none",
                    overflow: "hidden",
                }}
                {...props}
                className={classes}
                ref={textAreaRef}
                rows={1}
            />
        </div>
    );
});
ExpandingTextArea.displayName = "ExpandingTextArea";

type ControlledExpandingTextAreaProps<T extends FieldValues> = Omit<
    ExpandingTextAreaProps,
    "name"
> &
    UseControllerProps<T>;

export const ControllableExpandingTextArea = <T extends FieldValues>({
    control,
    name,
    rules,
    ...props
}: ControlledExpandingTextAreaProps<T>) => {
    const { field, fieldState } = useController({
        control,
        name,
        rules,
    });

    return (
        <ExpandingTextArea
            {...props}
            {...field}
            className={`border-0 ${props.className ?? ""}`}
        />
    );
};
