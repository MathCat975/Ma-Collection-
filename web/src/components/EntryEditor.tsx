import { FormEvent, useState } from "react";
import { useCollection } from "../contexts/CollectionContext";
import { errorMessage } from "../services/api";
import { Entry, Statut, statusLabels } from "../types/api";
export function EntryEditor({ entry }: { entry: Entry }): JSX.Element {
  const { update, remove } = useCollection();
  const [statut, setStatut] = useState<Statut>(entry.statut);
  const [note, setNote] = useState(entry.note?.toString() ?? "");
  const [commentaire, setCommentaire] = useState(entry.commentaire ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(!(entry.note !== null || entry.commentaire));
  async function act(deleting: boolean): Promise<void> {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (deleting) await remove(entry.id);
      else {
        await update(entry.id, {
          statut,
          note: note ? Number(note) : null,
          commentaire: commentaire || null,
        });
        setMessage("Modifications enregistrées.");
        setEditing(false);
      }
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void act(false);
  }
  if (!editing) {
    return (
      <div className="entry-summary">
        <div className="summary-line"><span>Note</span><strong>{note ? `${note}/5` : "Non noté"}</strong></div>
        <div className="summary-line"><span>Statut</span><strong>{statusLabels[statut]}</strong></div>
        <div className="summary-comment"><span>Commentaire</span><p>{commentaire || "Aucun commentaire"}</p></div>
        <div className="summary-actions">
          <button type="button" onClick={() => setEditing(true)}>Modifier</button>
          <button type="button" className="danger" disabled={busy} onClick={() => void act(true)}>Supprimer</button>
        </div>
      </div>
    );
  }
  return (
    <form className="entry-editor" onSubmit={submit}>
      <label>
        Statut
        <select
          value={statut}
          onChange={(event) => setStatut(event.target.value as Statut)}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Note
        <select value={note} onChange={(event) => setNote(event.target.value)}>
          <option value="">Non noté</option>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Commentaire
        <textarea
          maxLength={1000}
          value={commentaire}
          onChange={(event) => setCommentaire(event.target.value)}
        />
      </label>
      <p>Ajouté le {new Date(entry.date_ajout).toLocaleDateString("fr-FR")}</p>
      <button disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
      <button type="button" disabled={busy} onClick={() => void act(true)}>
        Supprimer
      </button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
