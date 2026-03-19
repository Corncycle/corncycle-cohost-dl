import { tw } from "@/client/lib/tw-tagged-literal";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import classnames from "classnames";
import React, { FunctionComponent, ReactElement, useContext } from "react";
import { z } from "zod";

export const InfoBoxLevel = z.enum([
    "info",
    "warning",
    "done",
    "post-box-info",
    "post-box-warning",
]);
export type InfoBoxLevel = z.infer<typeof InfoBoxLevel>;

type InfoBoxProps = {
    level: InfoBoxLevel;
    className?: string;
    textSize?: "base" | "sm";
};

export const InfoBox: FunctionComponent<
    React.PropsWithChildren<InfoBoxProps>
> = ({ level, className: moreClasses, textSize = "sm", children }) => {
    let bgClasses: string;
    let iconElement: ReactElement;
    let textSizeClasses: string;

    switch (level) {
        case "info":
            bgClasses = "bg-mango-100";
            iconElement = (
                <InformationCircleIcon className="w-6 self-start text-cherry" />
            );
            break;
        case "warning":
            bgClasses = "bg-strawberry-100";
            iconElement = (
                <ExclamationTriangleIcon className="w-6 self-start text-strawberry" />
            );
            break;
        case "done":
            bgClasses = "bg-green-100";
            iconElement = (
                <CheckCircleIcon className="w-6 self-start text-green-800" />
            );
            break;
        case "post-box-info":
            bgClasses = tw`co-info-box co-info`;
            iconElement = <InformationCircleIcon className="w-6 self-start" />;
            break;
        case "post-box-warning":
            bgClasses = tw`co-info-box co-warning`;
            iconElement = (
                <ExclamationTriangleIcon className="w-6 self-start" />
            );
            break;
    }

    switch (textSize) {
        case "base":
            textSizeClasses = "text-base";
            break;
        case "sm":
        default:
            textSizeClasses = "text-sm";
            break;
    }

    return (
        <div
            className={classnames(
                bgClasses,
                textSizeClasses,
                "mx-auto flex w-full flex-row gap-4 rounded-lg p-3",
                moreClasses
            )}
        >
            {iconElement}
            <div className="flex-1 self-center">{children}</div>
        </div>
    );
};
