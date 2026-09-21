import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 400): T {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setResult(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return result;
}
