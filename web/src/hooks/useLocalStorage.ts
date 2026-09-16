import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? (JSON.parse(stored) as T) : initialValue;
    });

    function save(nextValue: T): void {
        setValue(nextValue);
        localStorage.setItem(key, JSON.stringify(nextValue));
    }

    return [value, save];
}
