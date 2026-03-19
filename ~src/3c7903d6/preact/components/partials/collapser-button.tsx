import { tw } from "@/client/lib/tw-tagged-literal";
import classnames from "classnames";
import React, { ComponentProps, ElementType, useContext } from "react";
import { z } from "zod";

type PropsOf<TTag = any> = TTag extends ElementType
    ? ComponentProps<TTag>
    : never;

// NOTE: This typing (based on InfoBox) doesn't actually work, for reasons that
// seem to be related to the funky props copied from AuthnButton. Both
// CollapserButton and AuthnButton seem to "any" type all their props for
// unknown reasons, but we decided this is shippable for now.
export const CollapserButtonStyle = z.enum(["default", "18-badge"]);
export type CollapserButtonStyle = z.infer<typeof CollapserButtonStyle>;

type CollapserButtonProps<TTag> = {
    as: TTag;
    collapserButtonStyle: CollapserButtonStyle;
    children?: React.ReactNode;
} & PropsOf<TTag>;

const BUTTON_TYPE = "button" as const;

export const CollapserButton = <TTag extends ElementType>({
    as: Component = BUTTON_TYPE,
    collapserButtonStyle,
    children,
    ...props
}: CollapserButtonProps<TTag>) => {
    let buttonClasses = classnames(
        "flex",
        "h-10",
        "items-center",
        "justify-center",
        "self-center",
        "rounded-lg",
        "bg-foreground",
        "py-2",
        "px-3",
        "leading-none"
    );

    if (collapserButtonStyle == "default") {
        buttonClasses = classnames(
            tw`co-filled-button tracking-wider whitespace-nowrap`,
            buttonClasses
        );
    } else if (collapserButtonStyle == "18-badge") {
        buttonClasses = classnames(
            tw`co-info-box co-18-plus border-[1px] hover-underline`,
            buttonClasses
        );
    }

    return (
        <Component {...props} className={buttonClasses}>
            {children}
        </Component>
    );
};
