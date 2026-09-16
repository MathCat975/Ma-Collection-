import { ApiError, AuthCredentials, AuthToken } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
    });

    if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as ApiError;
        throw new Error(error.detail ?? error.erreur?.message ?? "Une erreur est survenue.");
    }

    return (await response.json()) as T;
}

export const api = {
    login: (credentials: AuthCredentials) =>
        request<AuthToken>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
};
