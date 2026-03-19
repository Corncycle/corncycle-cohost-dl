import { useSearchParams } from "react-router-dom";

export const useQueryState = (query: string, defaultValue?: string) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const val = searchParams.get(query) ?? defaultValue;
    const setVal = (newVal: string) => {
        setSearchParams((params) => {
            params.set(query, newVal);
            return params;
        });
    };
    return [val, setVal] as const;
};
