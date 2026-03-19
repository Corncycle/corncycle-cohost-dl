import { useState } from "react";

type AsJson<T> = T extends string | number | boolean | null
    ? T
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function
    ? never
    : T extends object
    ? { [K in keyof T]: AsJson<T[K]> }
    : never;

export function useLocalStorage<T>(
    key: string,
    initialValue: T & AsJson<T>
): [T, (value: (T & AsJson<T>) | ((oldVal: T) => T & AsJson<T>)) => void] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.error(error);
            return initialValue;
        }
    });
    // Return a wrapped version of useState's setter function that persists the
    // new value to localStorage.
    const setValue = (
        value: (T & AsJson<T>) | ((oldVal: T) => T & AsJson<T>)
    ) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };
    return [storedValue, setValue];
}
