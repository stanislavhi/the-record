import { useEffect, useState } from 'react';

const read = <T extends string>(key: string, fallback: T, isValid: (v: unknown) => v is T): T => {
    try {
        const saved = window.localStorage.getItem(key);
        return isValid(saved) ? saved : fallback;
    } catch {
        return fallback; // storage blocked (private mode, sandboxed iframe)
    }
};

/**
 * useState for a string-union value mirrored to localStorage under `key`.
 * Invalid or unreadable stored values fall back to `fallback`; write failures are ignored.
 */
export const usePersistentState = <T extends string>(
    key: string,
    fallback: T,
    isValid: (v: unknown) => v is T
) => {
    const [value, setValue] = useState<T>(() => read(key, fallback, isValid));
    useEffect(() => {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            /* non-essential */
        }
    }, [key, value]);
    return [value, setValue] as const;
};
