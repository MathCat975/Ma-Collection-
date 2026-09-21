import { useCollection } from "../contexts/CollectionContext";

export function GameActions({ title }: { title: string }): JSX.Element {
    const { collection, favorites, toggle } = useCollection();
    return <div className="game-actions">
        <button type="button" aria-pressed={collection.includes(title)}
            aria-label={`Ma collection : ${title}`} onClick={() => toggle("collection", title)}>
            {collection.includes(title) ? "✓ Dans ma collection" : "+ Ma collection"}
        </button>
        <button type="button" aria-pressed={favorites.includes(title)}
            aria-label={`Favori : ${title}`} onClick={() => toggle("favorites", title)}>
            {favorites.includes(title) ? "★ Favori" : "☆ Favori"}
        </button>
    </div>;
}
