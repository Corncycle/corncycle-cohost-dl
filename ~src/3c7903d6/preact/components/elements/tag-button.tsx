import { tw } from "@/client/lib/tw-tagged-literal";
import React, { FunctionComponent, MouseEventHandler } from "react";
import classNames from "classnames";

interface TagButtonProps {
    TagIcon: React.FunctionComponent<{ className: string }>;
    MouseoverTagIcon: React.FunctionComponent<{ className: string }> | null;
    tagText: string;
}

export const TagButton: FunctionComponent<
    TagButtonProps & { onClick: MouseEventHandler<HTMLElement> }
> = (props) => {
    const tokenIconClasses = classNames("inline-block h-3.5", {
        "group-hover:hidden": props.MouseoverTagIcon !== null,
    });

    return (
        <button
            className={tw`co-filled-button group flex items-center justify-start gap-1 rounded-full px-2 py-1 text-sm leading-none`}
            onClick={props.onClick}
            type="button"
        >
            <props.TagIcon className={tokenIconClasses} />
            {props.MouseoverTagIcon ? (
                <props.MouseoverTagIcon className="hidden h-3.5 group-hover:inline-block" />
            ) : null}
            <span className="block">{props.tagText}</span>
        </button>
    );
};

export const TagLinkButton: FunctionComponent<
    TagButtonProps & { href: string }
> = (props) => {
    const tokenIconClasses = classNames("inline-block h-3.5", {
        "group-hover:hidden": props.MouseoverTagIcon !== null,
    });

    return (
        <a
            className={tw`co-filled-button group flex items-center justify-start gap-1 rounded-full px-2 py-1 text-sm leading-none`}
            href={props.href}
        >
            <props.TagIcon className={tokenIconClasses} />
            {props.MouseoverTagIcon ? (
                <props.MouseoverTagIcon className="hidden h-3.5 group-hover:inline-block" />
            ) : null}
            <span className="block">{props.tagText}</span>
        </a>
    );
};
