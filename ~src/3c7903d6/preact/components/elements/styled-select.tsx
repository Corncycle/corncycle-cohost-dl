import classNames from "classnames";
import React, { PropsWithChildren, useMemo } from "react";
import {
    FieldValues,
    Path,
    RegisterOptions,
    UseFormRegister,
    Control,
    useController,
} from "react-hook-form";

type SelectStyle = "light" | "dark";

type StyledSelectProps<T extends FieldValues> = PropsWithChildren<{
    style?: SelectStyle;
    control: Control<T>;
    name: Path<T>;
    rules?: RegisterOptions;
}>;

export const StyledSelect = <T extends FieldValues>({
    style = "light",
    control,
    name,
    rules,
    children,
}: StyledSelectProps<T>) => {
    const { field } = useController<T>({
        name,
        control,
        rules,
    });
    const inputStyleClasses = useMemo(() => {
        switch (style) {
            case "light":
                return `border-gray-600 text-notBlack bg-notWhite
                    placeholder:text-gray-600
                    focus:border-notBlack`;
            case "dark":
            default:
                return `border-gray-400 text-notWhite bg-notBlack
                    placeholder:text-gray-400
                    focus:border-notWhite`;
        }
    }, [style]);

    return (
        <select
            className={classNames(
                `w-full rounded-lg border-2`,
                inputStyleClasses
            )}
            {...field}
        >
            {children}
        </select>
    );
};
