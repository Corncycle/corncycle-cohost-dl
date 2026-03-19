import { ChevronRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { IconEgg } from "../icons/text-egg";

export interface PaginationEggProps {
    backLink: string | undefined;
    forwardLink: string | undefined;
    condensed?: boolean | undefined;
    backOnClick?: React.MouseEventHandler | undefined;
    forwardOnClick?: React.MouseEventHandler | undefined;
}

const paginationEggStyles = classNames(
    "h-8",
    "pr-3",
    "fill-secondary",
    "text-notWhite",
    "cohost-shadow-light",
    "dark:cohost-shadow-dark",
    "dark:text-notBlack"
);

export const PaginationEggs: FunctionComponent<PaginationEggProps> = ({
    backLink,
    forwardLink,
    condensed = false,
    backOnClick,
    forwardOnClick,
}) => {
    return (
        <div className="mb-12 flex flex-row gap-x-6">
            {/* to take up the space occupied by the avatar column */}
            {!condensed ? (
                <span className="hidden w-16 lg:block">&nbsp;</span>
            ) : null}
            {backLink ? (
                <a href={backLink} onClick={backOnClick}>
                    <IconEgg className={`${paginationEggStyles} scale-x-[-1]`}>
                        <ChevronRightIcon />
                    </IconEgg>
                </a>
            ) : null}
            <span className="flex-grow">&nbsp;</span>
            {forwardLink ? (
                <a href={forwardLink} onClick={forwardOnClick}>
                    <IconEgg className={paginationEggStyles}>
                        <ChevronRightIcon />
                    </IconEgg>
                </a>
            ) : null}
        </div>
    );
};

export default PaginationEggs;
