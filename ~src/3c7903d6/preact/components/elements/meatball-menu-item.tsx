import React, { ComponentProps, type ElementType } from "react";

type MeatballMenuItemProps<TTag extends ElementType> = {
    as: TTag;
    ItemIcon: React.FunctionComponent<{ className?: string }>;
    text: string;
} & ComponentProps<TTag>;

export function MeatballMenuItem<TTag extends ElementType>({
    as: Component = "button",
    ItemIcon,
    text,
    ...props
}: MeatballMenuItemProps<TTag>) {
    return (
        <Component className="flex flex-row gap-2 hover:underline" {...props}>
            <ItemIcon className="h-6" />
            {text}
        </Component>
    );
}
