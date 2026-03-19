import { trpc } from "@/client/lib/trpc";
import { useUserInfo } from "../providers/user-info-provider";

export const useEditedProjects = () => {
    const { loggedIn } = useUserInfo();
    const result = trpc.projects.listEditedProjects.useQuery(undefined, {
        suspense: true,
        enabled: loggedIn,
        placeholderData: { projects: [] },
    });
    // will never actually be undefined due to inclusion of placeholder data.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return result.data!;
};
