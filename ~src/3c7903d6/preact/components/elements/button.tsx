import classnames from "classnames";
import React, { FunctionComponent } from "react";
import { z } from "zod";

export const ButtonStyle = z.enum(["pill", "roundrect", "authn"]);
export type ButtonStyle = z.infer<typeof ButtonStyle>;

export const ButtonColor = z.enum([
    "cherry",
    "strawberry",
    "mango",
    "not-black",
    "red",
    "green",
    "accent",
    "secondary",
    "authn-primary",
    "authn-other",
]);
export type ButtonColor = z.infer<typeof ButtonColor>;

export const SharedProps = z.object({
    buttonStyle: ButtonStyle,
    color: ButtonColor,
    className: z.string().optional(),
});
export type SharedProps = z.infer<typeof SharedProps>;

const baseColors = classnames("bg-notWhite", "hover:text-notWhite");

// WHY NOT HAVE THESE AS INTERPOLATED CLASS NAMES?
// tailwind jit doesn't handle interpolated class names!
// you have to have the full class name written for it to pick up on a string as
// a class name! so we do this
const pillClasses = classnames(
    "font-atkinson",
    "font-bold",
    "rounded-full",
    "border-2"
);

const roundrectClasses = classnames("body-2", "rounded-lg");

const authnStyleClasses = classnames(
    "flex",
    "h-12",
    "items-center",
    "justify-center",
    "rounded-lg",
    "px-6",
    "text-lg"
);

const cherryClasses = classnames(
    "border-cherry",
    "hover:bg-cherry",
    "text-cherry",
    "active:bg-cherry-600",
    "active:border-cherry-600",
    "disabled:text-cherry-300",
    "disabled:border-cherry-300",
    "focus:outline-cherry",
    "focus:ring-cherry",
    baseColors
);
const strawberryClasses = classnames(
    "border-strawberry",
    "hover:bg-strawberry",
    "text-strawberry",
    "active:bg-strawberry-600",
    "active:border-strawberry-600",
    "disabled:text-strawberry-300",
    "disabled:border-strawberry-300",
    "focus:outline-strawberry",
    "focus:ring-strawberry",
    baseColors
);

const redClasses = classnames(
    "border-red",
    "hover:bg-red",
    "text-red",
    "active:bg-red-600",
    "active:border-red-600",
    "disabled:text-red-300",
    "disabled:border-red-300",
    "focus:outline-red",
    baseColors
);

const greenClasses = classnames(
    "border-green",
    "hover:bg-green",
    "text-green",
    "active:bg-green-600",
    "active:border-green-600",
    "disabled:text-green-300",
    "disabled:border-green-300",
    "focus:outline-green",
    baseColors
);
const mangoClasses = classnames(
    "border-mango",
    "hover:bg-mango",
    "text-mango",
    "bg-notBlack",
    "hover:text-notBlack"
);
const notBlackClasses = classnames(
    "border-notBlack",
    "hover:bg-notBlack",
    "text-notBlack",
    "focus:outline-notBlack",
    "focus:ring-notBlack",
    baseColors
);

const accentClasses = classnames(
    "border-accent",
    "text-accent",
    "bg-foreground",
    "hover:bg-accent",
    "hover:text-text"
);

const secondaryClasses = classnames(
    "bg-secondary",
    "text-notWhite",
    "dark:text-notBlack",
    "hover:bg-secondary-600"
);

const authnPrimaryColorClasses = classnames(
    "bg-foreground",
    "text-text",
    "hover:bg-foreground-600",
    "active:bg-foreground-700",
    "disabled:bg-foreground-200"
);

const authnOtherColorClasses = classnames(
    "border-2",
    "border-foreground",
    "text-foreground",
    "hover:bg-longan-200"
);

const sharedClasses = (props: SharedProps) =>
    classnames(
        "leading-none",
        "align-middle",
        "py-2",
        "px-4",
        "no-select",
        props.className,
        {
            [pillClasses]: props.buttonStyle === "pill",
            [roundrectClasses]: props.buttonStyle === "roundrect",
            [authnStyleClasses]: props.buttonStyle === "authn",
            [cherryClasses]: props.color === "cherry",
            [strawberryClasses]: props.color === "strawberry",
            [mangoClasses]: props.color === "mango",
            [notBlackClasses]: props.color === "not-black",
            [redClasses]: props.color === "red",
            [accentClasses]: props.color === "accent",
            [greenClasses]: props.color === "green",
            [secondaryClasses]: props.color === "secondary",
            [authnPrimaryColorClasses]: props.color === "authn-primary",
            [authnOtherColorClasses]: props.color === "authn-other",
        }
    );

export const Button: FunctionComponent<
    SharedProps &
        React.ButtonHTMLAttributes<HTMLButtonElement> & {
            ref?: React.Ref<HTMLButtonElement>;
        }
> = React.forwardRef(({ buttonStyle, color, className, ...props }, ref) => {
    const classes = sharedClasses({
        buttonStyle,
        color,
        className,
        ...props,
    });
    return (
        <button {...props} className={classes} ref={ref}>
            {props.children}
        </button>
    );
});
Button.displayName = "Button";

export const LinkButton: FunctionComponent<
    SharedProps &
        React.AnchorHTMLAttributes<HTMLAnchorElement> & {
            ref?: React.Ref<HTMLAnchorElement>;
        }
> = React.forwardRef(({ buttonStyle, color, ...props }, ref) => {
    const classes = sharedClasses({ buttonStyle, color, ...props });
    return (
        <a {...props} className={classes} ref={ref}>
            {props.children}
        </a>
    );
});
LinkButton.displayName = "LinkButton";
