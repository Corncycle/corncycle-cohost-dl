import { trpc } from "@/client/lib/trpc";
import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap from "@/shared/sitemap";
import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { HashtagIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useMedia } from "react-use";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { BasicButton } from "../elements/basic-button";
import { useArtistAlleyFilters } from "./artist-alley-filter-provider";
import { useUserInfo } from "../../providers/user-info-provider";

const MultiSwitchButton: React.FC<{
    tabs: {
        label: string;
        onClick: () => void;
        active?: boolean;
    }[];
}> = ({ tabs }) => {
    return (
        <ul className="co-multi-button mx-auto my-2 flex w-auto max-w-fit flex-row items-center justify-evenly overflow-y-auto whitespace-nowrap rounded-lg">
            {tabs.map((tab) => (
                <li
                    key={`${tab.label}`}
                    className={`co-multi-button px-3 py-2 text-center text-sm first-of-type:rounded-l-lg last-of-type:rounded-r-lg ${
                        tab.active
                            ? "co-active rounded-lg rounded-b-lg font-bold first-of-type:rounded-bl-none last-of-type:rounded-br-none"
                            : ""
                    }`}
                >
                    <button onClick={tab.onClick}>{tab.label}</button>
                </li>
            ))}
        </ul>
    );
};

export const ArtistAlleyFilters: React.FC<{
    className?: string;
}> = ({ className }) => {
    const postBoxTheme = useDynamicTheme();

    const isDesktop = useMedia("(min-width: 1200px)", true);

    const [allCategories] =
        trpc.artistAlley.getCategoriesInUse.useSuspenseQuery(undefined, {
            refetchInterval: Infinity,
            keepPreviousData: true,
        });

    const { loggedIn } = useUserInfo();

    const { data: hasPurchasedListing } =
        trpc.artistAlley.hasPurchasedListing.useQuery(undefined, {
            enabled: loggedIn,
            suspense: true,
        });

    const {
        adultFilterMode,
        setAdultFilterMode,
        categories,
        isAdult,
        categoryMatch,
        setCategoryMatch,
        sortOrder,
        setSortOrder,
    } = useArtistAlleyFilters();

    return (
        <>
            <Disclosure
                as="div"
                data-theme={postBoxTheme.current}
                className={tw`co-themed-box co-artist-alley-filters cohost-shadow-light dark:cohost-shadow-dark col-span-1 flex h-fit max-h-max min-h-0 w-full flex-col rounded-lg border ${
                    className ?? ""
                }`}
                defaultOpen={isDesktop}
            >
                <Disclosure.Button
                    as="header"
                    className="flex flex-row items-center justify-between rounded-t-lg p-3 ui-not-open:rounded-b-lg"
                >
                    <ChevronRightIcon className="h-5 w-5 ui-open:rotate-90 motion-safe:transition-transform" />
                    <span className="font-league text-xs uppercase">
                        filters
                    </span>
                </Disclosure.Button>
                <Disclosure.Panel as="div">
                    <div className="flex flex-row flex-wrap gap-2 px-3 py-2">
                        {allCategories.map((category) => (
                            <div
                                key={`selected-token-${category}`}
                                className="group h-max cursor-pointer select-none"
                            >
                                {/* this weird nested div thing is to prevent a bug caused by having the default click handler and our removal handler on the same element */}
                                <button
                                    className={tw`co-token flex items-center justify-start gap-1 rounded-lg px-2 py-1 leading-none ${
                                        categories.has(category)
                                            ? "co-active"
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        categories.has(category)
                                            ? categories.delete(category)
                                            : categories.add(category);
                                    }}
                                    type="button"
                                >
                                    <HashtagIcon className="inline-block h-3.5" />
                                    <span className="block">{category}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <MultiSwitchButton
                        tabs={[
                            {
                                label: "any",
                                onClick: () => setCategoryMatch("any"),
                                active: categoryMatch === "any",
                            },
                            {
                                label: "all",
                                onClick: () => setCategoryMatch("all"),
                                active: categoryMatch === "all",
                            },
                        ]}
                    />
                    {isAdult && (
                        <>
                            <hr className="border-notWhite" />
                            <MultiSwitchButton
                                tabs={[
                                    {
                                        label: "hide 18+",
                                        onClick: () => {
                                            setAdultFilterMode("hide");
                                        },
                                        active: adultFilterMode === "hide",
                                    },
                                    {
                                        label: "show 18+",
                                        onClick: () => {
                                            setAdultFilterMode("include");
                                        },
                                        active: adultFilterMode === "include",
                                    },
                                    {
                                        label: "only 18+",
                                        onClick: () => {
                                            setAdultFilterMode("only");
                                        },
                                        active: adultFilterMode === "only",
                                    },
                                ]}
                            />
                        </>
                    )}
                    <hr className="border-notWhite" />
                    <MultiSwitchButton
                        tabs={[
                            {
                                label: "random",
                                onClick: () => {
                                    setSortOrder("random");
                                },
                                active: sortOrder === "random",
                            },
                            {
                                label: "newest first",
                                onClick: () => {
                                    setSortOrder("newest");
                                },
                                active: sortOrder === "newest",
                            },
                            {
                                label: "oldest first",
                                onClick: () => {
                                    setSortOrder("oldest");
                                },
                                active: sortOrder === "oldest",
                            },
                        ]}
                    />
                </Disclosure.Panel>
            </Disclosure>
            <Disclosure
                as="div"
                data-theme={postBoxTheme.current}
                className={tw`co-themed-box co-artist-alley-filters cohost-shadow-light dark:cohost-shadow-dark col-span-1 mt-4 flex h-fit max-h-max min-h-0 w-full flex-col rounded-lg border ${
                    className ?? ""
                }`}
                defaultOpen={isDesktop}
            >
                <Disclosure.Button
                    as="header"
                    className="flex flex-row items-center justify-between rounded-t-lg p-3 ui-not-open:rounded-b-lg"
                >
                    <ChevronRightIcon className="h-5 w-5 ui-open:rotate-90 motion-safe:transition-transform" />
                    <span className="font-league text-xs uppercase">
                        your listing here!
                    </span>
                </Disclosure.Button>
                <Disclosure.Panel as="div" className="p-3">
                    <div className="co-prose prose mb-3">
                        <p>
                            are you an artist, musician, game developer, or
                            other creative? got something you want cohost users
                            to know about? get an artist alley listing! only $10
                            per week!
                        </p>
                    </div>
                    <BasicButton
                        buttonSize="regular"
                        buttonColor="post-box-filled"
                        as="a"
                        href={sitemap.public.artistAlley.create().toString()}
                        extraClasses="mt-2"
                    >
                        buy a listing
                    </BasicButton>
                    {hasPurchasedListing && (
                        <BasicButton
                            buttonSize="regular"
                            buttonColor="post-box-filled"
                            as="a"
                            href={sitemap.public.artistAlley
                                .ownerManage()
                                .toString()}
                            extraClasses="mt-2"
                        >
                            manage your listings
                        </BasicButton>
                    )}
                </Disclosure.Panel>
            </Disclosure>
        </>
    );
};
