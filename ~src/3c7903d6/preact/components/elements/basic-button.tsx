import { TailwindClasses } from "@/client/lib/tw-tagged-literal";
import classnames from "classnames";
import React, {
    ComponentProps,
    ReactElement,
    useContext,
    type ElementType,
} from "react";
import { z } from "zod";
import { ButtonSize, regularClasses, smallClasses } from "./common-styling";

/**
 * a new button component designed to match "button/basic" in the master design
 * system doc
 */

export const ButtonColor = z.enum([
    "cherry",
    "mango",
    "green",
    "destructive",
    "theme-sensitive-1",
    "stroke",
    "post-box-filled",
]);
export type ButtonColor = z.infer<typeof ButtonColor>;

type BasicButtonProps<TTag extends ElementType> = {
    as: TTag;
    buttonSize: ButtonSize;
    buttonColor: ButtonColor;
    extraClasses?: string;
} & ComponentProps<TTag>;

const cherryClasses = `text-notWhite bg-cherry-500 hover:bg-cherry-600 
    active:bg-cherry-700 disabled:bg-cherry-100 disabled:text-cherry-600`;
const mangoClasses = `text-notBlack bg-mango-300 hover:bg-mango-400
    active:bg-mango-500 disabled:bg-mango-100 disabled:text-mango-700`;
const greenClasses = `text-notWhite bg-green-600 hover:bg-green-700 
    active:bg-green-800 disabled:bg-green-100 disabled:text-green-800`;
const destructiveClasses = `text-notWhite bg-red-500 hover:bg-red-600 
    active:bg-red-700 disabled:bg-red-300 disabled:text-red-800`;
const strokeClasses = `text-cherry-600 bg-notWhite hover:bg-longan-100
    active:bg-longan-200 border-2 border-cherry-500 disabled:bg-notWhite
    disabled:text-cherry-400 disabled:border-cherry-400`;

// first used for the "refresh" button on cohost reader, this button is
// black-on-longan in the light theme and white-on-cherry in the dark theme
const themeSensitive1Classes = `bg-longan-300 hover:bg-longan-400 
    active:bg-longan-500 dark:bg-cherry-700 dark:hover:bg-cherry-600 
    dark:active:bg-cherry-600 text-notBlack dark:text-notWhite`;

const makeClasses = <TTag extends ElementType>(props: BasicButtonProps<TTag>) =>
    classnames("rounded-lg", "px-3", "py-2", {
        [smallClasses]: props.buttonSize === "small",
        [regularClasses]: props.buttonSize === "regular",
        [cherryClasses]: props.buttonColor === "cherry",
        [mangoClasses]: props.buttonColor === "mango",
        [greenClasses]: props.buttonColor === "green",
        [destructiveClasses]: props.buttonColor === "destructive",
        [themeSensitive1Classes]: props.buttonColor === "theme-sensitive-1",
        [strokeClasses]: props.buttonColor === "stroke",
    });

function UnwrappedBasicButton<TTag extends ElementType>(
    { as: Component = "button", ...props }: BasicButtonProps<TTag>,
    ref: React.Ref<unknown>
) {
    const { buttonSize, buttonColor, extraClasses, ...otherProps } = props;
    const layoutClasses =
        "flex flex-row justify-center items-center text-center"; // to normalize layout between buttons and anchors
    let classes: TailwindClasses;

    switch (buttonColor) {
        case "post-box-filled":
            classes = classnames(
                makeClasses(props),
                extraClasses,
                layoutClasses,
                "co-filled-button"
            ) as TailwindClasses;
            break;
        default:
            classes = classnames(
                makeClasses(props),
                extraClasses,
                layoutClasses
            ) as TailwindClasses;
    }

    return (
        <Component {...otherProps} className={classes} ref={ref}>
            {props.children}
        </Component>
    );
}

export const BasicButton = React.forwardRef(UnwrappedBasicButton);
