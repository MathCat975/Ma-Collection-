import { games } from "../data/games";
import { GameCover } from "../components/GameCover";
import { Link, useParams } from "react-router-dom";
import { GameActions } from "../components/GameActions";
import { useCollection } from "../contexts/CollectionContext";
import { gameMetadata } from "../data/gameMetadata";
import "./catalogue.css";
import "./game-detail.css";

export function ItemDetailPage(): JSX.Element {
    const { id } = useParams();
    const { error } = useCollection();
    const item = games.find((game) => game.id === Number(id));
    if (!item) return <main className="game-detail"><h1>Jeu introuvable</h1><p>Cette fiche n’existe pas dans le catalogue.</p><Link to="/catalogue">Retour au catalogue</Link></main>;
    const genres = item.genre.split(" & ");
    const metadata = gameMetadata[item.title];
    return (
        <div className="detail-shell">
            <header className="detail-header">
                <Link className="detail-brand" to="/catalogue">Ma Collection</Link>
                <nav aria-label="Navigation principale">
                    <Link to="/catalogue">Catalogue</Link>
                    <Link to="/collection">Ma collection</Link>
                </nav>
            </header>
            <main className="game-detail">
                <Link className="detail-back" to="/catalogue">← Retour au catalogue</Link>
                <header className="detail-title">
                    <p className="detail-kicker">Fiche du jeu</p>
                    <h1>{item.title}</h1>
                    <div className="detail-tags">{genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
                </header>
                <div className="detail-overview">
                    <div className="detail-art"><GameCover key={item.imageUrl} title={item.title} imageUrl={item.imageUrl} /></div>
                    <aside className="detail-summary" aria-label="Résumé du jeu">
                        <h2>En quelques mots</h2>
                        <p>{item.description}</p>
                        <h3>Disponible sur</h3>
                        <div className="detail-tags">{item.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div>
                        <GameActions title={item.title} />
                        {error && <p role="alert">{error}</p>}
                        <p className="detail-muted">Votre collection est enregistrée dans ce navigateur.</p>
                    </aside>
                </div>
                <nav className="detail-tabs" aria-label="Sections de la fiche">
                    <a href="#description">À propos</a>
                    <a href="#informations">Informations</a>
                </nav>
                <div className="detail-sections">
                    <section id="description" className="detail-panel">
                        <h2>À propos du jeu</h2>
                        <p>{item.description}</p>
                    </section>
                    <section id="informations" className="detail-panel">
                        <h2>Informations principales</h2>
                        <dl>
                            <div><dt>Titre</dt><dd>{item.title}</dd></div>
                            <div><dt>Genres</dt><dd>{genres.join(" · ")}</dd></div>
                            <div><dt>Plateformes</dt><dd>{item.platforms.join(" · ")}</dd></div>
                            <div><dt>Développeur et éditeur</dt><dd>{metadata?.developer ?? "En cours de vérification"}</dd></div>
                            <div><dt>Date de sortie</dt><dd>{metadata?.releaseDate ?? "En cours de vérification"}</dd></div>
                            {metadata && <div><dt>Source</dt><dd><a href={metadata.source} target="_blank" rel="noreferrer">Steam</a></dd></div>}
                        </dl>
                    </section>
                </div>
            </main>
        </div>
    );
}
