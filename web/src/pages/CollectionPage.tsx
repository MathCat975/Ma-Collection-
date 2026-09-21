import { useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../contexts/CollectionContext";
import { PageLayout } from "../components/PageLayout";
import { EntryEditor } from "../components/EntryEditor";
import { GameCover } from "../components/GameCover";
import { statusLabels } from "../types/api";
export function CollectionPage(): JSX.Element {
  const { entries, loading, error, refresh } = useCollection();
  const [statut, setStatut] = useState("");
  const [tri, setTri] = useState("date");
  const visible = entries
    .filter((entry) => !statut || entry.statut === statut)
    .sort((a, b) =>
      tri === "note"
        ? (b.note ?? 0) - (a.note ?? 0)
        : Date.parse(b.date_ajout) - Date.parse(a.date_ajout),
    );
  return (
    <PageLayout>
      <h1>Ma collection</h1>
      <section className="collection-filters">
        <label>
          Statut
          <select
            value={statut}
            onChange={(event) => setStatut(event.target.value)}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trier par
          <select value={tri} onChange={(event) => setTri(event.target.value)}>
            <option value="date">Date d’ajout</option>
            <option value="note">Note</option>
          </select>
        </label>
      </section>
      {loading && entries.length === 0 ? (
        <p role="status">Chargement de la collection…</p>
      ) : error ? (
        <p role="alert">
          {error} <button onClick={() => void refresh()}>Réessayer</button>
        </p>
      ) : (
        <>
          {visible.length === 0 && (
            <section className="empty-state" role="status">
              <h2>Aucun jeu dans cette sélection</h2>
              <Link to="/catalogue">Explorer le catalogue</Link>
            </section>
          )}
          <section className="game-grid">
            {visible.map((entry) => (
              <article className="game-card" key={entry.id}>
                <GameCover
                  title={entry.item.titre}
                  imageUrl={entry.item.image_url}
                />
                <h2>
                  <Link to={`/catalogue/${entry.item.id}`}>
                    {entry.item.titre}
                  </Link>
                </h2>
                <EntryEditor entry={entry} />
              </article>
            ))}
          </section>
        </>
      )}
    </PageLayout>
  );
}
