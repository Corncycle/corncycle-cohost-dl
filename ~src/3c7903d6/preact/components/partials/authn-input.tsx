import React from "react";
import {
    FieldValues,
    UseControllerProps,
    UseFormTrigger,
} from "react-hook-form";
import { StyledInput } from "../elements/styled-input";

export type AuthnInputProps<T extends FieldValues> = UseControllerProps<T> & {
    trigger: UseFormTrigger<T>;
} & Pick<
        React.InputHTMLAttributes<HTMLInputElement>,
        "type" | "autoComplete" | "placeholder" | "max" | "readOnly"
    >;

/** @deprecated */
export const AuthnInput = <T extends FieldValues>({
    ...props
}: AuthnInputProps<T>) => <StyledInput style="dark" {...props} />;
