import { GameCarousel } from "../components/GameCarousel";
import { useEffect, useMemo, useState } from "react";
import { GameActions } from "../components/GameActions";
import { useCollection } from "../contexts/CollectionContext";
import "./catalogue.css";
import { Link } from "react-router-dom";
import { GameCover } from "../components/GameCover";
import { games } from "../data/games";

export function CataloguePage({ mode = "catalogue" }: { mode?: "catalogue" | "collection" | "favorites" }): JSX.Element {
    const { collection, favorites, error } = useCollection();
    const heading = mode === "collection" ? "Ma collection" : mode === "favorites" ? "Mes favoris" : "Catalogue des jeux";
    const selected = mode === "collection" ? collection : favorites;
    const source = mode === "catalogue" ? games : games.filter((game) => selected.includes(game.title));
    const [query, setQuery] = useState("");
    const [genre, setGenre] = useState("");
    const [page, setPage] = useState(1);
    const limit = 12;
    const genres = [...new Set(games.map((game) => game.genre))];
    const backdropGames = games.filter((game) => game.imageUrl).slice(0, 24);
    useEffect(() => {
        const select = document.querySelector<HTMLSelectElement>(".filters select");
        const filters = document.querySelector<HTMLElement>(".filters");
        if (!select || !filters || filters.querySelector(".genre-pills")) return;
        const pills = document.createElement("div");
        pills.className = "genre-pills";
        const options = Array.from(select.options);
        const selectGenre = (option: HTMLOptionElement, button: HTMLButtonElement): void => {
            select.value = option.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            pills.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
            button.classList.add("selected");
        };
        const allButton = document.createElement("button");
        allButton.type = "button";
        allButton.textContent = "Tous les genres";
        allButton.className = "selected";
        allButton.onclick = () => selectGenre(options[0], allButton);
        pills.appendChild(allButton);
        const groups: Record<string, string[]> = {
            "Action & Aventure": ["Action & Aventure"], RPG: ["RPG", "RPG & Narration"],
            Multijoueur: ["Multijoueur & Coopération", "Multijoueur & Party", "Multijoueur & Sport", "Multijoueur & Horreur", "Multijoueur & Tir"],
            Tir: ["Tir", "Tir & Coopération"], Gestion: ["Gestion", "Gestion & Stratégie"],
            Stratégie: ["Stratégie"], Réflexion: ["Réflexion"], Narration: ["Narration"],
            Indépendant: ["Indépendant & Plateforme", "Indépendant & Survie", "Indépendant & Exploration", "Indépendant & RPG", "Indépendant & Action"]
        };
        Object.entries(groups).forEach(([name, values]) => {
            const group = document.createElement("div");
            group.className = "genre-group";
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "genre-parent";
            toggle.innerHTML = `${name}<span>+</span>`;
            const children = document.createElement("div");
            children.className = "genre-children";
            values.forEach((value) => {
                const option = options.find((item) => item.value === value);
                if (!option) return;
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = value;
                button.onclick = () => selectGenre(option, button);
                children.appendChild(button);
            });
            toggle.onclick = () => {
                filters.querySelectorAll<HTMLElement>(".genre-group.open").forEach((item) => {
                    if (item !== group) {
                        item.classList.remove("open");
                        item.querySelector(".genre-parent span")!.textContent = "+";
                    }
                });
                const open = group.classList.toggle("open");
                toggle.querySelector("span")!.textContent = open ? "−" : "+";
            };
            group.append(toggle, children);
            pills.appendChild(group);
        });
        filters.appendChild(pills);
        const closeMenus = (event: MouseEvent): void => {
            if (filters.contains(event.target as Node)) return;
            filters.querySelectorAll<HTMLElement>(".genre-group.open").forEach((item) => {
                item.classList.remove("open");
                item.querySelector(".genre-parent span")!.textContent = "+";
            });
        };
        document.addEventListener("click", closeMenus);
        return () => { document.removeEventListener("click", closeMenus); pills.remove(); };
    }, [genres.length]);
    useEffect(() => {
        const shell = document.querySelector<HTMLElement>(".catalogue-shell");
        const content = document.querySelector<HTMLElement>(".content");
        if (!shell || !content || content.querySelector(".sidebar-toggle")) return;
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "sidebar-toggle";
        toggle.setAttribute("aria-label", "Ouvrir ou fermer la navigation");
        toggle.innerHTML = "☰";
        toggle.onclick = () => {
            const collapsed = shell.classList.toggle("sidebar-collapsed");
            toggle.innerHTML = collapsed ? "☰" : "×";
        };
        content.prepend(toggle);
        return () => toggle.remove();
    }, []);
    const filtered = useMemo(() => source.filter((game) => (!query || `${game.title} ${game.description}`.toLowerCase().includes(query.toLowerCase())) && (!genre || game.genre === genre)), [query, genre, collection, favorites, mode]);
    
    const pages = Math.max(1, Math.ceil(filtered.length / limit));
    const currentPage = Math.min(page, pages);
    const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit);

    const isEmpty = visible.length === 0 && !query && !genre;
    return <main className="catalogue-shell"><aside className="sidebar"><p className="brand"><span>◆</span> Ma Collection</p><p className="nav-title">Navigation</p><Link className={mode === "catalogue" ? "nav-link active" : "nav-link"} to="/catalogue">▦ Catalogue</Link><Link className={mode === "collection" ? "nav-link active" : "nav-link"} to="/collection">♥ Ma collection</Link><Link className={mode === "favorites" ? "nav-link active" : "nav-link"} to="/favoris">★ Favoris</Link><Link className="nav-link" to="/login">♙ Se connecter</Link></aside><div className="content"><header className="topbar"><input className="search" aria-label="Rechercher un jeu" placeholder="Rechercher un jeu..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /><Link className="login-button" to="/login">Se connecter</Link></header><div className="page">{mode === "catalogue" ? <GameCarousel /> : <section className={`hero hero-${mode}`}><div className="hero-collage" aria-hidden="true">{backdropGames.map((game, index) => <img key={game.id} src={game.imageUrl} alt="" style={{ "--i": index } as React.CSSProperties} />)}</div><div className="hero-content"><p className="eyebrow">{mode === "favorites" ? "VOTRE SÉLECTION" : "VOTRE UNIVERS"}</p><h1>{heading}</h1><p>{mode === "favorites" ? "Retrouvez ici les jeux que vous aimez le plus." : "Organisez les jeux que vous souhaitez garder dans votre collection."}</p></div><div className="hero-count"><strong>{selected.length}</strong><span>jeu{selected.length > 1 ? "x" : ""}</span></div></section>}<div className="section-heading"><div><h2>{heading}</h2><p className="section-subtitle">{mode === "catalogue" ? "Découvrez votre prochain jeu préféré" : `${selected.length} jeu${selected.length > 1 ? "x" : ""} enregistré${selected.length > 1 ? "s" : ""}`}</p></div><span>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span></div><section className="filters"><select aria-label="Filtrer par genre" value={genre} onChange={(event) => { setGenre(event.target.value); setPage(1); }}><option value="">Tous les genres</option>{genres.map((value) => <option key={value} value={value}>{value}</option>)}</select></section>{error && <p role="alert">{error}</p>}{isEmpty ? <section className={`empty-state empty-${mode}`} role="status"><div className="empty-icon">{mode === "favorites" ? "♥" : "◆"}</div><h3>{mode === "favorites" ? "Aucun favori pour le moment" : "Votre collection est encore vide"}</h3><p>{mode === "favorites" ? "Ajoutez vos coups de cœur pour les retrouver rapidement." : "Ajoutez des jeux depuis le catalogue pour construire votre sélection."}</p><Link className="primary-action" to="/catalogue">Explorer le catalogue</Link></section> : <><section className="game-grid">{visible.map((game) => <article className="game-card" key={game.id}><GameCover key={game.imageUrl} title={game.title} imageUrl={game.imageUrl} /><h3>{game.title}</h3><p>{game.genre}</p><p className="stars" aria-label={`Note ${game.rating} sur 5`}>{"★".repeat(Math.round(game.rating))}{"☆".repeat(5 - Math.round(game.rating))} <span>{game.rating}/5</span></p><p className="platforms">{game.platforms.join(" · ")}</p><GameActions title={game.title} /><Link to={`/catalogue/${game.id}`}>Voir la fiche</Link></article>)}</section>{visible.length === 0 && <p role="status">Aucun jeu ne correspond à la recherche.</p>}</>}<nav className="pagination" aria-label="Pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Précédent</button><span>Page {currentPage} / {pages}</span><button disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Suivant</button></nav></div></div></main>;
}
