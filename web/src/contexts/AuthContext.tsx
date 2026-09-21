import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { api, ApiError, errorMessage } from "../services/api";
import { Credentials, User } from "../types/api";
type AuthValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string;
  login: (data: Credentials) => Promise<void>;
  logout: () => void;
};
const Context = createContext<AuthValue | undefined>(undefined);
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [stored, save] = useLocalStorage<unknown>("ma-collection:token", null);
  const token = typeof stored === "string" ? stored : null;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setUser(null);
    setError("");
    setLoading(Boolean(token));
    if (token)
      api
        .me(token)
        .then((value) => {
          if (active) setUser(value);
        })
        .catch((cause: unknown) => {
          if (!active) return;
          if (cause instanceof ApiError && cause.code === 401) save(null);
          else setError(errorMessage(cause));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [token, save]);
  useEffect(() => {
    const expire = (event: Event): void => {
      if (event instanceof CustomEvent && event.detail === token) {
        save(null);
        setUser(null);
      }
    };
    window.addEventListener("auth:expired", expire);
    return () => window.removeEventListener("auth:expired", expire);
  }, [token, save]);
  useEffect(() => {
    if (!token) return;
    try {
      const payload: unknown = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("exp" in payload) ||
        typeof payload.exp !== "number"
      )
        return;
      const timer = window.setTimeout(
        () => {
          save(null);
          setUser(null);
        },
        Math.max(0, payload.exp * 1000 - Date.now()),
      );
      return () => window.clearTimeout(timer);
    } catch {}
  }, [token, save]);
  async function login(data: Credentials): Promise<void> {
    const result = await api.login(data);
    setLoading(true);
    save(result.access_token);
  }
  function logout(): void {
    save(null);
    setUser(null);
  }
  return (
    <Context.Provider value={{ token, user, loading, error, login, logout }}>
      {children}
    </Context.Provider>
  );
}
export function useAuth(): AuthValue {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider manquant");
  return value;
}
