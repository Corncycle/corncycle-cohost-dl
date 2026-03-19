import { CustomEmoji, CustomEmojiSet, Emoji } from "@/client/lib/emoji";
import { tw } from "@/client/lib/tw-tagged-literal";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { autoUpdate, shift, useFloating } from "@floating-ui/react-dom";
import { Popover } from "@headlessui/react";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type EmojiButtonProps = {
    disabled: boolean;
    onSelectEmoji: (emoji: Emoji) => void;
    hasCohostPlus: boolean;
};

export const EmojiButton: FunctionComponent<EmojiButtonProps> = React.memo(
    ({ onSelectEmoji, disabled, hasCohostPlus }) => {
        const { refs, floatingStyles } = useFloating({
            whileElementsMounted: autoUpdate,
            middleware: [shift()],
            placement: "bottom",
        });

        const [customEmojiRef, setCustomEmojiRef] = useState<
            typeof import("@/client/lib/emoji") | null
        >(null);

        useEffect(() => {
            import("@/client/lib/emoji")
                .then((emoji) => {
                    setCustomEmojiRef(emoji);
                })
                .catch((err) => {
                    console.error(err);
                });
        }, []);

        const customEmojiList = useMemo<CustomEmojiSet>(() => {
            if (customEmojiRef) {
                if (hasCohostPlus) {
                    // sort the merged custom emoji by name so eggbugs are grouped
                    // together
                    const categories = [
                        ...customEmojiRef.customEmoji,
                        ...customEmojiRef.cohostPlusCustomEmoji,
                    ]
                        .sort((a, b) =>
                            a.name.localeCompare(b.name, "en", {
                                sensitivity: "base",
                            })
                        )
                        .reduce<{
                            eggbug: CustomEmoji[];
                            host: CustomEmoji[];
                            custom: CustomEmoji[];
                        }>(
                            (acc, emoji) => {
                                if (emoji.name.includes("eggbug")) {
                                    acc.eggbug.push(emoji);
                                } else if (emoji.name.includes("host")) {
                                    acc.host.push(emoji);
                                } else {
                                    acc.custom.push(emoji);
                                }

                                return acc;
                            },
                            {
                                eggbug: [],
                                host: [],
                                custom: [],
                            }
                        );

                    return [
                        {
                            id: "eggbug",
                            name: "eggbug! (by @dzuk)",
                            emojis: categories.eggbug,
                        },
                        {
                            id: "host",
                            name: "The Host (by @SilverStarsIllustration)",
                            emojis: categories.host,
                        },
                        {
                            id: "custom",
                            name: "everything else",
                            emojis: categories.custom,
                        },
                    ];
                }
                // sorting is unnecessary since the base custom emoji are already
                // sorted
                return [
                    {
                        id: "custom",
                        name: "custom emoji",
                        emojis: customEmojiRef.customEmoji,
                    },
                ];
            }
            return [];
        }, [customEmojiRef, hasCohostPlus]);

        return (
            <>
                <Popover>
                    <Popover.Button
                        ref={refs.setReference}
                        className={tw`co-link-button disabled:cursor-not-allowed disabled:text-foreground-300`}
                        disabled={disabled}
                        title="insert emoji"
                    >
                        <FaceSmileIcon className="inline-block h-6" />
                    </Popover.Button>
                    <Popover.Panel
                        // don't want this popover to pop under avatars
                        style={{ ...floatingStyles, zIndex: 9999 }}
                        ref={refs.setFloating}
                    >
                        {/* <style>{postBoxThemes["dark"]["emojimart"]}</style> */}
                        <Picker
                            onEmojiSelect={onSelectEmoji}
                            custom={customEmojiList}
                            data={data}
                            emojiButtonColors={[
                                "rgb(var(--color-secondary-200))",
                            ]}
                            set="native"
                            theme="auto"
                            title=""
                            emoji=""
                        />
                    </Popover.Panel>
                </Popover>
            </>
        );
    }
);
EmojiButton.displayName = "EmojiButton";
