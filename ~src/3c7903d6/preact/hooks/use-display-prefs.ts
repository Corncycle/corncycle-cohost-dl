import { trpc } from "@/client/lib/trpc";
import { DisplayPrefs } from "@/shared/types/display-prefs";

export const useDisplayPrefs = () => {
    const result = trpc.users.displayPrefs.useQuery(undefined, {
        suspense: true,
        keepPreviousData: true,
        notifyOnChangeProps: ["data", "error"],
    });

    return result.data ?? DisplayPrefs.parse({});
};
