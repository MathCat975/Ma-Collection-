import { useCallback, useState } from "react";
export function useLocalStorage<T>(
  cle: string,
  valeurInitiale: T,
): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(cle) ?? "null");
      return parsed === null ? valeurInitiale : (parsed as T);
    } catch {
      return valeurInitiale;
    }
  });
  const save = useCallback(
    (next: T): void => {
      try {
        localStorage.setItem(cle, JSON.stringify(next));
      } catch {}
      setValue(next);
    },
    [cle],
  );
  return [value, save];
}
