import { useCollection } from "../contexts/CollectionContext";

export function GameActions({ title }: { title: string }): JSX.Element {
    const { collection, favorites, toggle } = useCollection();
    return <div className="game-actions">
        <button type="button" aria-pressed={collection.includes(title)}
            aria-label={`Ma collection : ${title}`} onClick={() => toggle("collection", title)}>
            {collection.includes(title) ? "✓ Dans ma collection" : "+ Ma collection"}
        </button>
    </div>;
}
