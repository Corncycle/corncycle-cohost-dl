import { CategoryMatch, SortOrder } from "@/shared/api-types/artist-alley-v1";
import { ArtistAlleyAdultDisplayMode } from "@/shared/types/artist-alley";
import React, { useContext } from "react";

export const ArtistAlleyFilterProvider = React.createContext<{
    adultFilterMode: ArtistAlleyAdultDisplayMode;
    isAdult: boolean;
    categories: Set<string>;
    setAdultFilterMode: (mode: ArtistAlleyAdultDisplayMode) => void;
    categoryMatch: CategoryMatch;
    setCategoryMatch: (mode: CategoryMatch) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
}>({
    adultFilterMode: "hide",
    isAdult: false,
    categories: new Set(),
    setAdultFilterMode: () => {},
    categoryMatch: "any",
    setCategoryMatch: () => {},
    sortOrder: "random",
    setSortOrder: () => {},
});

export const useArtistAlleyFilters = () => {
    return useContext(ArtistAlleyFilterProvider);
};
