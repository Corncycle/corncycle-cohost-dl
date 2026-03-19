import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, {
    InputHTMLAttributes,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    FieldValues,
    useController,
    UseControllerProps,
    UseFormTrigger,
} from "react-hook-form";

type InputStyle = "light" | "dark" | "dynamic";

type StyledInputProps<T extends FieldValues> = {
    style?: InputStyle;
    showValidity?: boolean;
} & UseControllerProps<T> & { trigger: UseFormTrigger<T> } & Pick<
        InputHTMLAttributes<HTMLInputElement>,
        | "type"
        | "autoComplete"
        | "placeholder"
        | "max"
        | "min"
        | "step"
        | "readOnly"
        | "disabled"
    >;

export const StyledInput = <T extends FieldValues>({
    style = "light",
    showValidity = true,
    name,
    control,
    rules,
    trigger,
    ...props
}: StyledInputProps<T>) => {
    const { field, fieldState } = useController<T>({
        name,
        control,
        rules,
    });
    const { name: fieldName, onChange } = field;

    // setup our own ref so we can track field value
    const [directRef, setDirectRef] = useState<HTMLInputElement | null>();
    useEffect(() => {
        field.ref(directRef);
    }, [directRef, field]);

    const {
        inputStyleClasses,
        contentDivStyleClasses,
        validityIconStyleClasses,
    } = useMemo(() => {
        switch (style) {
            case "light":
                return {
                    inputStyleClasses: `border-gray-600 text-notBlack
                        placeholder:text-gray-600
                        focus:border-notBlack disabled:border-gray-300`,
                    contentDivStyleClasses: `to-notWhite`,
                    validityIconStyleClasses: `bg-notWhite`,
                };
            case "dynamic":
                return {
                    inputStyleClasses: "co-styled-input",
                    contentDivStyleClasses: "co-styled-input-content",
                    validityIconStyleClasses: "co-styled-input-validity-icon",
                };
            case "dark":
            default:
                return {
                    inputStyleClasses: `border-gray-400 text-notWhite 
                        placeholder:text-gray-400
                        focus:border-notWhite read-only:bg-gray-700`,
                    contentDivStyleClasses: `to-notBlack`,
                    validityIconStyleClasses: `bg-notBlack`,
                };
        }
    }, [style]);

    // manually validate when we don't get an input event
    // can happen on browser autofill
    useEffect(() => {
        if (
            directRef &&
            directRef.value &&
            directRef.value !== props.defaultValue &&
            directRef.value !== field.value &&
            !fieldState.isTouched
        ) {
            onChange(directRef.value);
            void trigger(fieldName, { shouldFocus: true });
        }
    }, [
        directRef,
        field.value,
        fieldName,
        fieldState.isTouched,
        onChange,
        props.defaultValue,
        trigger,
    ]);
    return (
        <div className="relative">
            <input
                className={classNames(
                    `
                        w-full min-w-[15rem] rounded-lg border-2 bg-transparent
                    `,
                    inputStyleClasses
                )}
                {...props}
                {...field}
                ref={setDirectRef}
            />
            {showValidity && !props.readOnly && fieldState.isTouched ? (
                <>
                    <div
                        className={classNames(
                            `
                                absolute bottom-0 right-9 top-0 my-auto h-6 w-3 
                                bg-gradient-to-r from-transparent
                            `,
                            contentDivStyleClasses
                        )}
                    />
                    {fieldState.invalid ? (
                        <XMarkIcon
                            className={classNames(
                                `
                                    absolute bottom-0 right-3 top-0 my-auto h-6 
                                    w-6 text-red
                                `,
                                validityIconStyleClasses
                            )}
                        />
                    ) : (
                        <CheckIcon
                            className={classNames(
                                `
                                    absolute bottom-0 right-3 top-0 my-auto h-6
                                    w-6 bg-notWhite text-green
                                `,
                                validityIconStyleClasses
                            )}
                        />
                    )}
                </>
            ) : null}
        </div>
    );
};
