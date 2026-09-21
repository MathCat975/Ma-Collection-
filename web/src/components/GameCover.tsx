import { useState } from "react";

export function GameCover({ title, imageUrl }: { title: string; imageUrl?: string }): JSX.Element {
    const [failed, setFailed] = useState(false);
    return (
        <div style={{ aspectRatio: "460 / 215", background: "#101217", overflow: "hidden" }}>
            {imageUrl && !failed ? (
                <img src={imageUrl} alt={title} loading="lazy" onError={() => setFailed(true)}
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
                <span role="status">Image indisponible : {title}</span>
            )}
        </div>
    );
}
