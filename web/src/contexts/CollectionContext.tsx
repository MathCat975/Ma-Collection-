import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { api, errorMessage } from "../services/api";
import { Entry, EntryUpdate } from "../types/api";
type CollectionValue = {
  entries: Entry[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  add: (id: number) => Promise<void>;
  update: (id: number, data: EntryUpdate) => Promise<void>;
  remove: (id: number) => Promise<void>;
};
const Context = createContext<CollectionValue | undefined>(undefined);
export function CollectionProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const currentToken = useRef(token);
  currentToken.current = token;
  const refresh = useCallback(async (): Promise<void> => {
    const current = ++generation.current;
    if (!token || !user) {
      setEntries([]);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.collection(token);
      if (current === generation.current) setEntries(data);
    } catch (cause) {
      if (current === generation.current) setError(errorMessage(cause));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [token, user]);
  useEffect(() => {
    setEntries([]);
    void refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);
  async function mutate(
    action: (auth: string) => Promise<unknown>,
  ): Promise<void> {
    if (!token)
      throw new Error("Connectez-vous pour modifier votre collection.");
    await action(token);
    if (currentToken.current === token) await refresh();
  }
  return (
    <Context.Provider
      value={{
        entries: user ? entries : [],
        loading,
        error,
        refresh,
        add: (id) => mutate((auth) => api.add(auth, id)),
        update: (id, data) => mutate((auth) => api.update(auth, id, data)),
        remove: (id) => mutate((auth) => api.remove(auth, id)),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCollection(): CollectionValue {
  const value = useContext(Context);
  if (!value) throw new Error("CollectionProvider manquant");
  return value;
}
