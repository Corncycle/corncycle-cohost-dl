import React, { ElementType, ComponentProps } from "react";

type PropsOf<TTag = any> = TTag extends ElementType
    ? ComponentProps<TTag>
    : never;

type RectButtonProps<TTag> = {
    as: TTag;
    children?: React.ReactNode;
} & PropsOf<TTag>;

const BUTTON_TYPE = "button" as const;

export const RectButton = <TTag extends ElementType>({
    as: Component = BUTTON_TYPE,
    children,
    ...props
}: RectButtonProps<TTag>) => {
    const className: string = props.className ?? "";
    return (
        <Component
            {...props}
            className={`flex h-10 w-fit flex-row items-center rounded-lg px-3 ${className}`}
        >
            {children}
        </Component>
    );
};
