import { CSSProperties, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../contexts/CollectionContext";
import { PageLayout } from "../components/PageLayout";
import { EntryEditor } from "../components/EntryEditor";
import { GameCover } from "../components/GameCover";
import { statusLabels } from "../types/api";
import { Item } from "../types/api";
import { api } from "../services/api";
export function CollectionPage(): JSX.Element {
  const { entries, loading, error, refresh } = useCollection();
  const [statut, setStatut] = useState("");
  const [tri, setTri] = useState("date");
  const [catalogue, setCatalogue] = useState<Item[]>([]);
  useEffect(() => {
    api.catalogue().then(setCatalogue).catch(() => setCatalogue([]));
  }, []);
  const visible = entries
    .filter((entry) => !statut || entry.statut === statut)
    .sort((a, b) =>
      tri === "note"
        ? (b.note ?? 0) - (a.note ?? 0)
        : Date.parse(b.date_ajout) - Date.parse(a.date_ajout),
    );
  const collage = entries.length > 0
    ? entries.slice(0, 8).map((entry) => entry.item)
    : catalogue.slice(0, 8);
  return (
    <PageLayout>
      <section className="hero hero-collection">
        <div className="hero-collage" aria-hidden="true">
          {collage.map((item, index) => (
            <img key={item.id} src={item.image_url} alt="" style={{ "--i": index } as CSSProperties} />
          ))}
        </div>
        <div className="hero-content">
          <p className="eyebrow">Votre univers</p>
          <h1>Ma collection</h1>
          <p>Organisez les jeux que vous souhaitez garder dans votre collection.</p>
        </div>
        <div className="hero-count"><strong>{entries.length}</strong><span>jeu{entries.length > 1 ? "x" : ""}</span></div>
      </section>
      <div className="section-heading collection-heading">
        <div><h2>Ma collection</h2><p className="section-subtitle">Retrouvez les jeux que vous avez ajoutés</p></div>
        <span>{visible.length} résultat{visible.length > 1 ? "s" : ""}</span>
      </div>
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
          <section className="game-grid collection-grid">
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
