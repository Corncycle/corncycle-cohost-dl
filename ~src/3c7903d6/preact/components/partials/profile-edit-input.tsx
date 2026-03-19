import React, { InputHTMLAttributes } from "react";
import {
    FieldValues,
    useController,
    UseControllerProps,
} from "react-hook-form";

export type ProfileEditInputProps<T extends FieldValues> =
    UseControllerProps<T> &
        Pick<
            InputHTMLAttributes<HTMLInputElement>,
            "type" | "readOnly" | "maxLength" | "autoComplete"
        >;

export const ProfileEditInput = <T extends FieldValues>({
    name,
    control,
    rules,
    ...props
}: ProfileEditInputProps<T>) => {
    const { field } = useController<T>({ name, control, rules });
    return (
        <div className="relative">
            <input
                className={`w-full border-x-0 border-b border-t-0 border-gray-700
        bg-transparent p-1
        text-notWhite placeholder:text-gray-400 read-only:bg-gray-700 focus:border-notWhite`}
                {...props}
                {...field}
            />
        </div>
    );
};
