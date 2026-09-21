import {
  Credentials,
  Entry,
  EntryUpdate,
  Item,
  PaginatedItems,
  Stats,
  Token,
  User,
} from "../types/api";
const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}
export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Une erreur est survenue.";
async function request<T>(
  path: string,
  token?: string | null,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "Impossible de joindre le serveur. Vérifiez que l’API est démarrée.",
    );
  }
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    let message = `Erreur HTTP ${response.status}`;
    if (typeof data === "object" && data !== null && "erreur" in data) {
      const detail = data.erreur;
      if (
        typeof detail === "object" &&
        detail !== null &&
        "message" in detail &&
        typeof detail.message === "string"
      )
        message = detail.message;
    }
    if (response.status === 401 && token)
      window.dispatchEvent(new CustomEvent("auth:expired", { detail: token }));
    throw new ApiError(response.status, message);
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}
export const api = {
  getItems: (params: URLSearchParams) =>
    request<PaginatedItems>(`/items?${params}`),
  getItem: (id: number) => request<Item>(`/items/${id}`),
  register: (data: Credentials) =>
    request<User>("/auth/register", null, "POST", data),
  login: (data: Credentials) =>
    request<Token>("/auth/login", null, "POST", data),
  me: (token: string) => request<User>("/auth/me", token),
  collection: (token: string, params = new URLSearchParams()) =>
    request<Entry[]>(`/me/collection?${params}`, token),
  add: (token: string, item_id: number) =>
    request<Entry>("/me/collection", token, "POST", {
      item_id,
      statut: "a_decouvrir",
    }),
  update: (token: string, id: number, data: EntryUpdate) =>
    request<Entry>(`/me/collection/${id}`, token, "PATCH", data),
  remove: (token: string, id: number) =>
    request<void>(`/me/collection/${id}`, token, "DELETE"),
  stats: (token: string) => request<Stats>("/me/stats", token),
  catalogue: async (): Promise<Item[]> => {
    const first = await api.getItems(new URLSearchParams({ limit: "50" }));
    const rest = await Promise.all(
      Array.from({ length: Math.ceil(first.total / 50) - 1 }, (_, i) =>
        api.getItems(new URLSearchParams({ limit: "50", page: String(i + 2) })),
      ),
    );
    return [...first.results, ...rest.flatMap((page) => page.results)];
  },
};
