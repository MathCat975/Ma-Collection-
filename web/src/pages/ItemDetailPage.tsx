import { games } from "../data/games";
import { GameCover } from "../components/GameCover";
import { Link, useParams } from "react-router-dom";

export function ItemDetailPage(): JSX.Element {
    const { id } = useParams();
    const item = games.find((game) => game.id === Number(id));
    if (!item) return <main><p role="alert">Jeu introuvable.</p><Link to="/catalogue">Retour au catalogue</Link></main>;
    return <main style={{ maxWidth: 900, margin: "32px auto", padding: 24, background: "#1b2028", color: "#fff" }}>
        <Link to="/catalogue" style={{ color: "#66c0f4" }}>← Retour au catalogue</Link>
        <h1>{item.title}</h1>
        <GameCover key={item.imageUrl} title={item.title} imageUrl={item.imageUrl} />
        <p>{item.genre}</p><p>{item.description}</p>
        <p><strong>Plateformes :</strong> {item.platforms.join(" · ")}</p>
    </main>;
}
