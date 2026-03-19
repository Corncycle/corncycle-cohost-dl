import { Disclosure } from "@headlessui/react";
import {
    ChevronDownIcon,
    HashtagIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import React, { FunctionComponent, useContext, useRef } from "react";
import { TagButton } from "../../elements/tag-button";
import { tw } from "@/client/lib/tw-tagged-literal";
import { useDynamicTheme } from "../../../hooks/dynamic-theme";
import { useLocalStorage } from "../../../hooks/use-local-storage";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { selectTags, setTags } from "./reducer";

export interface TagRecommendationBoxProps {
    categoryTitle: string;
    stateId: string;
    tags: string[];
}

export const TagRecommendationBox: FunctionComponent<
    TagRecommendationBoxProps
> = (props) => {
    const dynamicTheme = useDynamicTheme();

    const tags = useAppSelector(selectTags);
    const dispatch = useAppDispatch();
    const [storedState, setStoredState] = useLocalStorage<{ open: boolean }>(
        `tag-recommendations/${props.stateId}`,
        { open: false }
    );

    function appendTag(content: string) {
        if (
            tags.findIndex(
                (existingTag) =>
                    existingTag.toLowerCase() === content.toLowerCase()
            ) !== -1
        ) {
            // tag already present; do nothing.
            return;
        } else {
            // tag not currently present; add it.
            dispatch(setTags([...tags, content]));
        }
    }

    return (
        <div
            className={tw`co-themed-box w-full`}
            data-theme={dynamicTheme.current}
        >
            <Disclosure defaultOpen={storedState.open}>
                <Disclosure.Button className="co-accordion-header flex w-full max-w-prose flex-row rounded-lg px-3 py-1 ui-open:rounded-b-none">
                    {({ open }) => {
                        // without the conditional, this leads to an infinite render loop
                        if (open !== storedState.open) setStoredState({ open });

                        return (
                            <>
                                <span className="flex-1 text-left">
                                    {props.categoryTitle}
                                </span>
                                <ChevronDownIcon className="h-6 self-center ui-open:rotate-180" />
                            </>
                        );
                    }}
                </Disclosure.Button>
                <Disclosure.Panel className="co-accordion-body flex w-full max-w-prose flex-row flex-wrap gap-3 rounded-b-lg p-3">
                    <>
                        {props.tags.map((tag) => (
                            <TagButton
                                key={tag}
                                TagIcon={HashtagIcon}
                                MouseoverTagIcon={PlusIcon}
                                tagText={tag}
                                onClick={() => appendTag(tag)}
                            />
                        ))}
                    </>
                </Disclosure.Panel>
            </Disclosure>
        </div>
    );
};
