import missingImage from "@/client/images/placeholders/attach_padding.svg";
import { AttachmentId, PostId } from "@/shared/types/ids";
import { AttachmentViewBlock } from "@/shared/types/post-blocks";
import { Dialog } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import React, {
    FunctionComponent,
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useSwipeable } from "react-swipeable";
import { IconEgg } from "./icons/text-egg";
import { ModalOverlay } from "./util";
import { noop } from "lodash";

export type LightboxImage = {
    src: string;
    alt?: string;
    width?: number | "auto";
    height?: number | "auto";
    thumbnail?: string;
};

const Lightbox = createContext<{
    openLightbox: (postId: PostId, attachmentId: AttachmentId) => void;
    closeLightbox: () => void;
    setLightboxContentForPost: (
        postId: PostId,
        content: AttachmentViewBlock[]
    ) => void;
}>({
    openLightbox: noop,
    closeLightbox: noop,
    setLightboxContentForPost: noop,
});

const paginationEggStyles = classNames(
    "h-8",
    "fill-cherry",
    "dark:fill-mango",
    "text-notWhite",
    "dark:text-notBlack",
    "cohost-shadow-dark",
    "flex-none",
    "cursor-pointer"
);

const LightboxCarousel: FunctionComponent<{
    content: AttachmentViewBlock[];
    onClick: () => void;
    carouselIndex: number;
    setCarouselIndex: (index: number) => void;
}> = ({ content, onClick, carouselIndex, setCarouselIndex }) => {
    const handlers = useSwipeable({
        onSwipedRight: () => {
            if (carouselIndex > 0) {
                setCarouselIndex(carouselIndex - 1);
            }
        },
        onSwipedLeft: () => {
            if (carouselIndex < content.length - 1) {
                setCarouselIndex(carouselIndex + 1);
            }
        },
    });

    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        container.current?.focus();
    }, [container]);

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        switch (e.key) {
            case "ArrowLeft":
            case "H":
            case "h":
                if (carouselIndex > 0) {
                    setCarouselIndex(carouselIndex - 1);
                }
                break;
            case "ArrowRight":
            case "L":
            case "l":
                if (carouselIndex < content.length - 1) {
                    setCarouselIndex(carouselIndex + 1);
                }
                break;
        }
    };

    // pre-load images
    useEffect(() => {
        content.forEach(({ attachment }) => {
            const img = new Image();
            img.src = attachment.fileURL;
        });
    });

    const setIndexFactory: (
        idx: number
    ) => React.MouseEventHandler<EventTarget> = (idx) => (e) => {
        setCarouselIndex(idx);
        e.stopPropagation();
    };

    const singleImage = content.length === 1;

    const imgMaxHeightClassName = singleImage
        ? "max-h-[calc(100vh_-_4rem)]"
        : // little extra room for the eggs and thumbnails
          "max-h-[calc(100vh_-_14rem)]";

    return (
        <div
            {...handlers}
            ref={container}
            onClick={onClick}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="container absolute inset-0 z-30 mx-auto my-0 overflow-hidden overflow-y-auto py-8 outline-none"
        >
            <div className="flex h-auto w-full flex-col items-center justify-between gap-6 overflow-auto">
                <div
                    className={`flex h-full min-h-0 w-full flex-1 flex-col items-center gap-2`}
                >
                    <img
                        src={
                            content[carouselIndex]?.attachment.fileURL ??
                            missingImage
                        }
                        className={`block ${imgMaxHeightClassName} mx-auto min-h-0 max-w-full object-scale-down`}
                        alt=""
                    />
                    {singleImage ? null : (
                        <div className="flex w-full max-w-prose flex-row items-center justify-between p-2">
                            <IconEgg
                                className={`${paginationEggStyles} scale-x-[-1] ${
                                    carouselIndex > 0 ? "visible" : "invisible"
                                }`}
                                onClick={setIndexFactory(carouselIndex - 1)}
                            >
                                <ChevronRightIcon />
                            </IconEgg>
                            <IconEgg
                                className={`${paginationEggStyles} ${
                                    carouselIndex < content.length - 1
                                        ? "visible"
                                        : "invisible"
                                }`}
                                onClick={setIndexFactory(carouselIndex + 1)}
                            >
                                <ChevronRightIcon />
                            </IconEgg>
                        </div>
                    )}
                    {content[carouselIndex]?.attachment.altText ? (
                        <p className="mx-auto max-w-prose p-3 text-center italic text-notWhite">
                            {content[carouselIndex]?.attachment.altText}
                        </p>
                    ) : null}
                </div>
                {singleImage ? null : (
                    <div className="flex flex-none flex-row items-center gap-4">
                        {content.map(({ attachment }, idx) => (
                            <button
                                key={attachment.attachmentId}
                                onClick={setIndexFactory(idx)}
                                type="button"
                            >
                                <img
                                    src={attachment.fileURL}
                                    className={`cohost-shadow-dark box-content aspect-square h-16 cursor-pointer rounded-lg object-cover ${
                                        idx === carouselIndex
                                            ? "border-2 border-cherry"
                                            : ""
                                    }`}
                                    alt={attachment.altText}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const LightboxHost: FunctionComponent<{ children: React.ReactNode }> = ({
    children,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [visiblePostId, setVisiblePostId] = useState<PostId>(0 as PostId);
    const [lightboxContent, setLightboxContent] = useState<
        Record<PostId, AttachmentViewBlock[]>
    >({});
    const [carouselIndex, setCarouselIndex] = useState(0);

    const openLightbox = (postId: PostId, attachmentId: AttachmentId) => {
        setVisiblePostId(postId);

        const index =
            lightboxContent[postId]?.findIndex(
                (block) => block.attachment.attachmentId === attachmentId
            ) ?? 0;

        setCarouselIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const setLightboxContentForPost = (
        postId: PostId,
        content: AttachmentViewBlock[]
    ) => {
        if (lightboxContent[postId]) return;
        lightboxContent[postId] = content;
        setLightboxContent(lightboxContent);
    };

    return (
        <>
            <Lightbox.Provider
                value={{
                    openLightbox,
                    closeLightbox,
                    setLightboxContentForPost,
                }}
            >
                {children}
            </Lightbox.Provider>
            <Dialog onClose={closeLightbox} open={isOpen}>
                <ModalOverlay className="bg-notBlack" />
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center py-20">
                        <LightboxCarousel
                            content={lightboxContent[visiblePostId] ?? []}
                            onClick={closeLightbox}
                            carouselIndex={carouselIndex}
                            setCarouselIndex={setCarouselIndex}
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export const useLightbox = () => useContext(Lightbox);
