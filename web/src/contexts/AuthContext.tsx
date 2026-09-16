import { createContext, useContext, useMemo, ReactNode } from "react";
import { api } from "../services/api";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AuthCredentials } from "../types/api";

type AuthContextValue = {
    token: string | null;
    login: (credentials: AuthCredentials) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
    const [token, setToken] = useLocalStorage<string | null>("ma-collection-token", null);

    async function login(credentials: AuthCredentials): Promise<void> {
        const result = await api.login(credentials);
        setToken(result.access_token);
    }

    function logout(): void { setToken(null); }

    const value = useMemo(() => ({ token, login, logout }), [token]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
    return context;
}
