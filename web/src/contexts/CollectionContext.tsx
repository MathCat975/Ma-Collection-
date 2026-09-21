import { createContext, ReactNode, useContext, useState } from "react";

type Lists = { collection: string[]; favorites: string[] };
type ListName = keyof Lists;
type CollectionValue = Lists & { error: string; toggle: (list: ListName, title: string) => void };
const storageKey = "ma-collection:lists:v1";
const empty: Lists = { collection: [], favorites: [] };
const Context = createContext<CollectionValue | undefined>(undefined);

function readLists(): Lists {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        if (typeof value !== "object" || value === null) return empty;
        const valid = (list: unknown): list is string[] =>
            Array.isArray(list) && list.every((title: unknown) => typeof title === "string");
        if ("collection" in value && "favorites" in value &&
            valid(value.collection) && valid(value.favorites)) {
            return { collection: [...new Set(value.collection)], favorites: [...new Set(value.favorites)] };
        }
    } catch { /* Un stockage absent ou illisible ne bloque pas la navigation. */ }
    return empty;
}

export function CollectionProvider({ children }: { children: ReactNode }): JSX.Element {
    const [lists, setLists] = useState<Lists>(readLists);
    const [error, setError] = useState("");
    function toggle(list: ListName, title: string): void {
        const next = { ...lists, [list]: lists[list].includes(title)
            ? lists[list].filter((entry) => entry !== title) : [...lists[list], title] };
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
            setLists(next);
            setError("");
        } catch {
            setError("La sauvegarde est impossible. Vérifiez que le stockage du navigateur est autorisé.");
        }
    }
    return <Context.Provider value={{ ...lists, error, toggle }}>{children}</Context.Provider>;
}

export function useCollection(): CollectionValue {
    const context = useContext(Context);
    if (!context) throw new Error("CollectionProvider manquant");
    return context;
}
