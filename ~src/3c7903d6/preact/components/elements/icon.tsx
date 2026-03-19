import React, { FunctionComponent } from "react";
import { Bouba } from "../icons/bouba";
import { CohostEgg } from "../icons/cohost-egg";
import { CohostLogo } from "../icons/cohost-logo";
import { Kiki } from "../icons/kiki";
import { SilenceIcon } from "../icons/silence";

import { CohostEggBookman } from "../icons/cohost-egg-bookman";
import { CohostLogoBookman } from "../icons/cohost-logo-bookman";

import { z } from "zod";
import { PushpinIcon } from "../icons/pushpin";
import { HashtagIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const IconName = z.enum([
    "cohost-logo",
    "cohost-egg",
    "bouba",
    "kiki",
    "pushpin",
    "silence",
    "hashtag",
    "warning",
    "cohost-egg-bookman",
    "cohost-logo-bookman",
]);

export type IconName = z.infer<typeof IconName>;

export interface IconProps extends React.SVGAttributes<SVGElement> {
    iconName: IconName;
}

export * from "../icons/bouba";
export * from "../icons/cohost-egg";
export * from "../icons/cohost-logo";
export * from "../icons/kiki";

/**
 * Base component for our custom non-heroicons icons
 * @param param0
 * @returns
 */
export const Icon: FunctionComponent<IconProps> = ({ iconName, ...props }) => {
    switch (iconName) {
        case "kiki":
            return <Kiki {...props} />;
        case "bouba":
            return <Bouba {...props} />;
        case "cohost-egg":
            return <CohostEgg {...props} />;
        case "cohost-logo":
            return <CohostLogo {...props} />;
        case "cohost-egg-bookman":
            return <CohostEggBookman {...props} />;
        case "cohost-logo-bookman":
            return <CohostLogoBookman {...props} />;
        case "silence":
            return <SilenceIcon {...props} />;
        case "pushpin":
            return <PushpinIcon {...props} />;
        case "hashtag":
            return <HashtagIcon {...props} />;
        case "warning":
            return <ExclamationTriangleIcon {...props} />;
    }
};
