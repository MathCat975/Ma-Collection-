import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GameCarousel } from "../components/GameCarousel";
import { GameCover } from "../components/GameCover";
import { GameActions } from "../components/GameActions";
import { PageLayout } from "../components/PageLayout";
import { useDebounce } from "../hooks/useDebounce";
import { api, errorMessage } from "../services/api";
import { Item, PaginatedItems } from "../types/api";
export function CataloguePage(): JSX.Element {
  const [query, setQuery] = useState("");
  const q = useDebounce(query.trim());
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [catalogue, setCatalogue] = useState<Item[]>([]);
  const [data, setData] = useState<PaginatedItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [catalogueError, setCatalogueError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setCatalogueError("");
    api
      .catalogue()
      .then((items) => {
        if (active) setCatalogue(items);
      })
      .catch((cause: unknown) => {
        if (active) setCatalogueError(errorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (q.length >= 2) params.set("q", q);
    if (genre) params.set("categorie", genre);
    api
      .getItems(params)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [q, genre, page, retry]);
  const genres = [...new Set(catalogue.map((item) => item.categorie))].sort();
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 12));
  return (
    <PageLayout>
      {catalogueError && !error && (
        <p role="alert">
          {catalogueError}{" "}
          <button onClick={() => setRetry(retry + 1)}>Réessayer</button>
        </p>
      )}
      {catalogue.length > 0 && <GameCarousel games={catalogue} />}
      <div className="section-heading">
        <h1>Catalogue des jeux</h1>
        <span>{data?.total ?? 0} résultats</span>
      </div>
      <input
        className="search"
        aria-label="Rechercher un jeu"
        placeholder="Rechercher un jeu…"
        maxLength={100}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />
      {query.trim().length === 1 && (
        <p role="status">Saisissez au moins deux caractères pour rechercher.</p>
      )}
      <section className="filters">
        <select
          aria-label="Filtrer par genre"
          value={genre}
          onChange={(event) => {
            setGenre(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Tous les genres</option>
          {genres.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </section>
      {loading ? (
        <p role="status">Chargement du catalogue…</p>
      ) : error ? (
        <p role="alert">
          {error} <button onClick={() => setRetry(retry + 1)}>Réessayer</button>
        </p>
      ) : (
        <>
          {data?.results.length === 0 && (
            <p role="status">Aucun jeu ne correspond à la recherche.</p>
          )}
          <section className="game-grid">
            {data?.results.map((item) => (
              <article className="game-card" key={item.id}>
                <GameCover title={item.titre} imageUrl={item.image_url} />
                <h3>{item.titre}</h3>
                <p>{item.categorie}</p>
                <p className="platforms">{item.plateforme}</p>
                <GameActions item={item} />
                <Link to={`/catalogue/${item.id}`}>Voir la fiche</Link>
              </article>
            ))}
          </section>
          <nav className="pagination" aria-label="Pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Précédent
            </button>
            <span>
              Page {page} / {pages}
            </span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
              Suivant
            </button>
          </nav>
        </>
      )}
    </PageLayout>
  );
}
