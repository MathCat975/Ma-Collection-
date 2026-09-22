import { useEffect, useRef, useState } from "react";
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
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLElement>(null);
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
  const genreGroups = [
    "Action & Aventure", "RPG", "Multijoueur", "Simulation", "Tir",
    "Réflexion", "Gestion", "Stratégie", "Narration", "Indépendant",
  ].map((label) => ({
    label,
    values: genres.filter((value) => value === label || value.startsWith(`${label} &`)),
  })).filter((group) => group.values.length > 0);
  const platformValues = [...new Set(catalogue.flatMap((item) => item.plateforme.split(/[,·]/).map((value) => value.trim()).filter(Boolean)))].sort();
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setOpenFilter(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
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
      <section className="filters" ref={filterRef}>
        <button className={`filter-pill ${!genre ? "selected" : ""}`} onClick={() => { setGenre(""); setPage(1); setOpenFilter(null); }}>
          Tous les genres
        </button>
        {genreGroups.map((group) => (
          <div className={`filter-group ${openFilter === group.label ? "open" : ""}`} key={group.label}>
            <button className="filter-pill" aria-expanded={openFilter === group.label} onClick={() => setOpenFilter(openFilter === group.label ? null : group.label)}>
              {group.label}<span className="filter-toggle" aria-hidden="true">{openFilter === group.label ? "−" : "+"}</span>
            </button>
            <div className="filter-menu">
              {group.values.map((value) => (
                <button className={genre === value ? "active" : ""} key={value} onClick={() => { setGenre(value); setPage(1); setOpenFilter(null); }}>
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className={`filter-group ${openFilter === "Plateforme" ? "open" : ""}`}>
          <button className="filter-pill" aria-expanded={openFilter === "Plateforme"} onClick={() => setOpenFilter(openFilter === "Plateforme" ? null : "Plateforme")}>
            Plateforme<span className="filter-toggle" aria-hidden="true">{openFilter === "Plateforme" ? "−" : "+"}</span>
          </button>
          <div className="filter-menu">
            {platformValues.map((value) => (
              <button key={value} onClick={() => setOpenFilter(null)}>{value}</button>
            ))}
          </div>
        </div>
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
