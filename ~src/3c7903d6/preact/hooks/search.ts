import { useCallback } from "react";
import { trpc } from "@/client/lib/trpc";

export const useTagSearch = (searchToken: string) => {
    const results = trpc.tags.query.useQuery(
        { query: searchToken },
        {
            trpc: {
                ssr: true,
            },
            suspense: true,
            initialData: () => {
                if (searchToken.length < 3) {
                    return { result: [] };
                }
            },
        }
    );
    return {
        suggestions: results.data,
        mappedSuggestions: results.data?.result.map((tag) => tag.content) ?? [],
    };
};

export const useProjectSearch = (
    searchToken: string,
    { skipMinimum = false }: { skipMinimum?: boolean }
) => {
    const results = trpc.projects.searchByHandle.useQuery(
        { query: searchToken, skipMinimum },
        {
            trpc: {
                ssr: true,
            },
            suspense: true,
            initialData: () => {
                if (searchToken.length < 3 && !skipMinimum) {
                    return { projects: [] };
                }
            },
        }
    );

    return { projects: results.data?.projects };
};

export const useEmailSearch = (searchToken: string) => {
    const utils = trpc.useContext();
    const results = trpc.moderation.user.findByEmail.useQuery(
        { query: searchToken },
        {}
    );
    const invalidate = useCallback(
        (newSearchToken: string) => {
            return utils.moderation.user.findByEmail.invalidate({
                query: newSearchToken,
            });
        },
        [utils]
    );

    return { invalidate, users: results.data?.users };
};
