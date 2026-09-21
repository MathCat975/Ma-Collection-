import { Item, PaginatedItems } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) throw new Error("Impossible de charger le catalogue.");
    return (await response.json()) as T;
}

export const api = {
    getItems: (params: URLSearchParams) => request<PaginatedItems>(`/items?${params}`),
    getItem: (id: number) => request<Item>(`/items/${id}`),
};
