import React, { ElementType, ComponentProps } from "react";

type PropsOf<TTag = any> = TTag extends ElementType
    ? ComponentProps<TTag>
    : never;

type AuthnButtonProps<TTag> = {
    as: TTag;
    children?: React.ReactNode;
} & PropsOf<TTag>;

const BUTTON_TYPE = "button" as const;

export const AuthnButton = <TTag extends ElementType>({
    as: Component = BUTTON_TYPE,
    children,
    ...props
}: AuthnButtonProps<TTag>) => {
    const className: string = props.className ?? "";
    return (
        <Component
            {...props}
            className={`flex h-12 max-w-xs
            items-center justify-center rounded-lg bg-foreground px-6 text-lg text-text
            hover:bg-foreground-600 active:bg-foreground-700 disabled:bg-foreground-200 ${className}`}
        >
            {children}
        </Component>
    );
};
