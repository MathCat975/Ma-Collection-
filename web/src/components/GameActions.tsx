import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCollection } from "../contexts/CollectionContext";
import { errorMessage } from "../services/api";
import { Item } from "../types/api";
export function GameActions({ item }: { item: Item }): JSX.Element {
  const { user } = useAuth();
  const {
    entries,
    add,
    remove,
    loading,
    error: collectionError,
  } = useCollection();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const entry = entries.find((value) => value.item.id === item.id);
  async function toggle(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      if (entry) await remove(entry.id);
      else await add(item.id);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Link to="/login">Se connecter pour ajouter ce jeu</Link>;
  return (
    <div className="game-actions">
      <button
        disabled={busy || loading || Boolean(collectionError)}
        aria-pressed={Boolean(entry)}
        aria-label={`Ma collection : ${item.titre}`}
        onClick={() => void toggle()}
      >
        {busy
          ? "Enregistrement…"
          : entry
            ? "✓ Retirer de ma collection"
            : "+ Ma collection"}
      </button>
      {(error || collectionError) && (
        <p role="alert">{error || collectionError}</p>
      )}
    </div>
  );
}
