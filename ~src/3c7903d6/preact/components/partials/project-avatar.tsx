import { sitemap } from "@/shared/sitemap";
import {
    AvatarShape,
    ProjectPrivacy,
    WireProjectModel,
} from "@/shared/types/projects";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import React, { FunctionComponent, useMemo } from "react";
import { z } from "zod";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { IconEgg } from "../icons/text-egg";

// we don't use interpolation so that:
// (a) classes don't get jit'd out
// (b) we can have a default if there's no match
function avatarMaskClass(avatarShape: AvatarShape) {
    switch (avatarShape) {
        case "capsule-big":
            return "mask-capsule-big";
        case "capsule-small":
            return "mask-capsule-small";
        case "roundrect":
            return "mask-roundrect";
        case "squircle":
            return "mask-squircle";
        case "egg":
            return "mask-egg";
        default:
        case "circle":
            return "mask-circle";
    }
}

export const ProjectAvatarFilteredProject = WireProjectModel.pick({
    avatarPreviewURL: true,
    avatarURL: true,
    avatarShape: true,
    privacy: true,
    handle: true,
    flags: true,
    projectId: true,
});
export type ProjectAvatarFilteredProject = z.infer<
    typeof ProjectAvatarFilteredProject
>;

export const ProjectAvatar: FunctionComponent<{
    project: ProjectAvatarFilteredProject;
    noLink?: boolean;
    className?: string;
    hideLock?: boolean;
    forceAnimate?: boolean;
}> = ({
    project,
    noLink = false,
    className = "h-16 w-16 hidden lg:block cohost-shadow-light dark:cohost-shadow-dark",
    hideLock = false,
    forceAnimate = false,
}) => {
    const displayPrefs = useDisplayPrefs();
    const animate = forceAnimate || !displayPrefs.pauseProfileGifs;
    const noTransparentAvatar =
        project.flags.indexOf("noTransparentAvatar") > -1;

    const defaultAvatarBgStyle: React.CSSProperties = {
        backgroundImage: noTransparentAvatar
            ? `url(${sitemap.public.project
                  .defaultAvatar({
                      projectId: project.projectId,
                  })
                  .toString()})`
            : undefined,
    };

    const processedUrl = useMemo(() => {
        const src = animate ? project.avatarURL : project.avatarPreviewURL;

        const parsedSrc = new URL(src);
        // hardcode this to 2 because it doesn't matter that much from a size
        // standpoint and eliminates any flashing or double loading.
        parsedSrc.searchParams.append("dpr", "2");
        // hardcode width and height to the max size we ever display avatars at
        parsedSrc.searchParams.append("width", "80");
        parsedSrc.searchParams.append("height", "80");
        parsedSrc.searchParams.append("fit", "cover");
        parsedSrc.searchParams.append("auto", "webp");

        return parsedSrc.toString();
    }, [animate, project.avatarPreviewURL, project.avatarURL]);

    const image = (
        <>
            <img
                src={processedUrl}
                className={`mask ${avatarMaskClass(
                    project.avatarShape
                )} h-full w-full object-cover`}
                alt={project.handle}
                style={defaultAvatarBgStyle}
            />
            {!hideLock && project.privacy === ProjectPrivacy.Private ? (
                <IconEgg
                    className="cohost-shadow-light dark:cohost-shadow-dark absolute -bottom-1 -right-1 h-5 fill-foreground-500 text-notWhite"
                    scale={0.6}
                >
                    <LockClosedIcon />
                </IconEgg>
            ) : null}
        </>
    );
    if (!noLink) {
        return (
            <a
                href={sitemap.public.project
                    .mainAppProfile({ projectHandle: project.handle })
                    .toString()}
                className={`flex-0 mask relative aspect-square ${className}`}
                title={`@${project.handle}`}
            >
                {image}
            </a>
        );
    } else {
        return (
            <div className={`flex-0 mask relative aspect-square ${className}`}>
                {image}
            </div>
        );
    }
};
