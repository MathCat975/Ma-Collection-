import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useDebounce } from "../hooks/useDebounce";
import { useLocalStorage } from "../hooks/useLocalStorage";

test("la recherche attend 400 ms et annule la valeur précédente", () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
    initialProps: { value: "" },
  });
  rerender({ value: "ze" });
  act(() => vi.advanceTimersByTime(300));
  rerender({ value: "zelda" });
  act(() => vi.advanceTimersByTime(399));
  expect(result.current).toBe("");
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe("zelda");
});

test("localStorage récupère un JSON invalide et persiste une nouvelle valeur", () => {
  localStorage.setItem("preference", "{broken");
  const { result } = renderHook(() => useLocalStorage("preference", "initial"));
  expect(result.current[0]).toBe("initial");
  act(() => result.current[1]("nouveau"));
  expect(JSON.parse(localStorage.getItem("preference") ?? "")).toBe("nouveau");
});

test("la session reste utilisable si localStorage est bloqué", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage unavailable");
  });
  const { result } = renderHook(() =>
    useLocalStorage<string | null>("token", null),
  );
  act(() => result.current[1]("session"));
  expect(result.current[0]).toBe("session");
});
