import { renderMarkdownReactNoHTML } from "@/client/lib/markdown/other-rendering";
import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap from "@/shared/sitemap";
import {
    ArtistAlleyWireAttachment,
    WireArtistAlley,
} from "@/shared/types/artist-alley";
import { WireProjectModel } from "@/shared/types/projects";
import React, { useContext, useMemo, useState } from "react";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { useDisplayPrefs } from "../../hooks/use-display-prefs";
import { useImageOptimizer } from "../../hooks/use-image-optimizer";
import { BasicButton } from "../elements/basic-button";
import { PlayPauseButton } from "../elements/play-pause-button";
import { ProjectAvatar } from "../partials/project-avatar";
import { useArtistAlleyFilters } from "./artist-alley-filter-provider";
import { Menu } from "@headlessui/react";
import {
    EyeIcon as EyeIconOutline,
    EyeSlashIcon as EyeSlashIconOutline,
    ShareIcon,
    ShieldExclamationIcon as ShieldExclamationIconOutline,
    TrashIcon as TrashIconOutline,
} from "@heroicons/react/24/outline";
import {
    ArrowUturnLeftIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import { MeatballMenuItem } from "../elements/meatball-menu-item";
import { ReportingUIContext } from "@/client/reporting/machine";

const ASPECT_RATIO = 300 / 250;

const ArtistAlleyAttachment: React.FC<{
    attachment: ArtistAlleyWireAttachment;
}> = ({ attachment }) => {
    const displayPrefs = useDisplayPrefs();
    const [src, setSrc] = useState(
        displayPrefs.gifsStartPaused
            ? attachment.previewURL
            : attachment.fileURL
    );
    const [isPlaying, setIsPlaying] = useState(!displayPrefs.gifsStartPaused);

    const srcWithDpr = useImageOptimizer(src, 300, ASPECT_RATIO);

    const handlePause = () => {
        setIsPlaying(false);
        setSrc(attachment.previewURL);
    };

    const handlePlay = () => {
        setIsPlaying(true);
        setSrc(attachment.fileURL);
    };

    return (
        <div className="group relative">
            <img
                src={srcWithDpr(1)}
                srcSet={`
                ${srcWithDpr(1)} 1x,
                ${srcWithDpr(2)} 2x,
                ${srcWithDpr(3)} 3x,
            `}
                alt={attachment.altText}
                className="co-border aspect-[300/250] w-full border-b object-cover"
            />

            {attachment.previewURL !== attachment.fileURL && (
                <PlayPauseButton
                    isPlaying={isPlaying}
                    showPlay={attachment.previewURL !== attachment.fileURL}
                    extraClasses="absolute bottom-3 right-3 w-12"
                    onPlay={handlePlay}
                    onPause={handlePause}
                />
            )}
        </div>
    );
};

const ArtistAlleyMeatballMenu: React.FC<{ listing: WireArtistAlley }> = ({
    listing,
}) => {
    const reportingUIContext = useContext(ReportingUIContext);

    return (
        // explicit height is required to vertically align the
        // meatballs with the rest of the action buttons
        <Menu as="div" className="relative h-6">
            <Menu.Button className="co-action-button cursor-pointer text-sm font-bold hover:underline">
                <EllipsisHorizontalIcon className="h-6 w-6 transition-transform ui-open:rotate-90" />
            </Menu.Button>

            <Menu.Items className="co-meatball-items absolute right-0 top-8 z-30 flex min-w-max flex-col divide-y rounded-lg p-3  focus:!outline-none">
                <Menu.Item>
                    <MeatballMenuItem
                        disabled={false}
                        onClick={() => {
                            reportingUIContext.send({
                                type: "START_REPORT",
                                artistAlleyListingId: listing.id,
                            });
                        }}
                        ItemIcon={ShieldExclamationIconOutline}
                        text="report"
                    />
                </Menu.Item>
            </Menu.Items>
        </Menu>
    );
};

export const ArtistAlleyListing: React.FC<{
    listing: WireArtistAlley;
    project: WireProjectModel;
}> = ({ listing, project }) => {
    const rendered = useMemo(() => {
        return renderMarkdownReactNoHTML(listing.body, new Date(), {
            disableEmbeds: true,
            externalLinksInNewTab: true,
            hasCohostPlus: false,
            renderingContext: "artistAlley",
        });
    }, [listing.body]);

    const theme = useDynamicTheme();

    return (
        <div
            data-theme={theme.current}
            className="co-themed-box co-artist-alley-listing flex w-full flex-col rounded-lg border"
        >
            <div className="co-border flex flex-row items-center gap-2 border-b px-2 py-3">
                <ProjectAvatar project={project} className="h-8" />
                <a
                    href={sitemap.public.project
                        .mainAppProfile({ projectHandle: project.handle })
                        .toString()}
                >
                    @{project.handle}
                </a>
                <div className="flex-1">&nbsp;</div>
                {listing.adultContent ? (
                    <span className="co-18-plus rounded-lg p-1 text-xs ">
                        18+
                    </span>
                ) : null}
                <ArtistAlleyMeatballMenu listing={listing} />
            </div>
            {listing.attachment && (
                <ArtistAlleyAttachment attachment={listing.attachment} />
            )}
            <div className="co-prose prose p-2">{rendered}</div>

            <div className="mx-2 my-3">
                <BasicButton
                    as="a"
                    buttonColor=""
                    buttonSize="regular"
                    href={listing.cta.link}
                    extraClasses="co-cta-button"
                    target="_blank"
                >
                    {listing.cta.text}
                </BasicButton>
            </div>

            {listing.categories.length > 0 && (
                <ListingTags tags={listing.categories} />
            )}
        </div>
    );
};

const ListingTags: React.FC<{ tags: string[] }> = ({ tags }) => {
    const { categories } = useArtistAlleyFilters();
    const filteredTags = tags.filter((tag) => tag != "");

    return filteredTags.length ? (
        <div className="w-full max-w-full p-3">
            <div
                className={tw`co-tags relative w-full overflow-y-hidden break-words leading-none`}
            >
                <div>
                    {filteredTags.map((tag) => (
                        <button
                            key={tag}
                            className={`mr-2 inline-block text-sm hover:underline ${
                                // bold currently filtered tags
                                categories.has(tag) ? "font-bold" : ""
                            }`}
                            onClick={() => {
                                categories.has(tag)
                                    ? categories.delete(tag)
                                    : categories.add(tag);
                            }}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    ) : null;
};
