import { CSSProperties, useEffect, useState } from "react";
import { api } from "../services/api";
import { Item } from "../types/api";
import { resolveGameImage } from "../data/imageSources";
function BackdropTile({ game, style }: { game: Item; style: CSSProperties }): JSX.Element {
  const [failed, setFailed] = useState(false);
  const image = resolveGameImage(game.titre, game.image_url);
  if (failed || !image) return <div className="auth-game-tile" style={style}>{game.titre}</div>;
  return <img src={image} alt="" style={style} onError={() => setFailed(true)} />;
}
export function AuthGameBackdrop(): JSX.Element {
  const [games, setGames] = useState<Item[]>([]);
  useEffect(() => { api.catalogue().then(setGames).catch(() => setGames([])); }, []);
  return <div className="auth-game-backdrop" aria-hidden="true">
    {(games.length ? games : []).slice(0, 72).map((game, index) => {
      const style = { left: `${(index % 12) * 9 - 3}%`, top: `${Math.floor(index / 12) * 22 - 7}%`, transform: `rotate(${index % 2 ? 7 : -7}deg)` } as CSSProperties;
      return <BackdropTile key={game.id} game={game} style={style} />;
    }
    )}
  </div>;
}
