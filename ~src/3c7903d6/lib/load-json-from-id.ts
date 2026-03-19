import ClientStateID from "@/shared/types/client-state-ids";

export const loadJSONFromID = <T>(id: ClientStateID): T => {
    const unparsed = document.getElementById(id)?.innerHTML;
    if (!unparsed) throw new Error(`Couldn't load config from ID: ${id}`);
    return JSON.parse(unparsed) as T;
};
