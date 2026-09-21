import { useEffect, useState } from "react";
import { api, errorMessage } from "../services/api";
import { Item } from "../types/api";
import { GameCover } from "../components/GameCover";
import { Link, useParams } from "react-router-dom";
import { GameActions } from "../components/GameActions";
import { useCollection } from "../contexts/CollectionContext";

import "./catalogue.css";
import "./game-detail.css";

export function ItemDetailPage(): JSX.Element {
  const { id } = useParams();
  const { error } = useCollection();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setItem(null);
    setFailure("");
    api
      .getItem(Number(id))
      .then((value) => {
        if (active) setItem(value);
      })
      .catch((cause: unknown) => {
        if (active) setFailure(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (loading)
    return (
      <main className="game-detail" role="status">
        Chargement de la fiche…
      </main>
    );
  if (failure)
    return (
      <main className="game-detail">
        <p role="alert">{failure}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
        <Link to="/catalogue">Retour au catalogue</Link>
      </main>
    );
  if (!item)
    return (
      <main className="game-detail">
        <h1>Jeu introuvable</h1>
        <p>Cette fiche n’existe pas dans le catalogue.</p>
        <Link to="/catalogue">Retour au catalogue</Link>
      </main>
    );
  const genres = item.categorie.split(" & ");
  return (
    <div className="detail-shell">
      <header className="detail-header">
        <Link className="detail-brand" to="/catalogue">
          Ma Collection
        </Link>
        <nav aria-label="Navigation principale">
          <Link to="/catalogue">Catalogue</Link>
          <Link to="/collection">Ma collection</Link>
        </nav>
      </header>
      <main className="game-detail">
        <Link className="detail-back" to="/catalogue">
          ← Retour au catalogue
        </Link>
        <header className="detail-title">
          <p className="detail-kicker">Fiche du jeu</p>
          <h1>{item.titre}</h1>
          <div className="detail-tags">
            {genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        </header>
        <div className="detail-overview">
          <div className="detail-art">
            <GameCover
              key={item.image_url}
              title={item.titre}
              imageUrl={item.image_url}
            />
          </div>
          <aside className="detail-summary" aria-label="Résumé du jeu">
            <h2>En quelques mots</h2>
            <p>{item.description}</p>
            <h3>Disponible sur</h3>
            <div className="detail-tags">
              {item.plateforme.split(", ").map((platform) => (
                <span key={platform}>{platform}</span>
              ))}
            </div>
            <GameActions item={item} />
            {error && <p role="alert">{error}</p>}
            <p className="detail-muted">
              Votre collection est enregistrée dans votre compte.
            </p>
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
              <div>
                <dt>Titre</dt>
                <dd>{item.titre}</dd>
              </div>
              <div>
                <dt>Genres</dt>
                <dd>{genres.join(" · ")}</dd>
              </div>
              <div>
                <dt>Plateformes</dt>
                <dd>{item.plateforme.split(", ").join(" · ")}</dd>
              </div>
              <div>
                <dt>Développeur et éditeur</dt>
                <dd>{item.studio}</dd>
              </div>
              <div>
                <dt>Date de sortie</dt>
                <dd>{item.annee}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </div>
  );
}
