import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Item } from "../types/api";
import "./game-carousel.css";

export function GameCarousel({ games }: { games: Item[] }): JSX.Element {
  const featured = games.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (hovered || focused || reducedMotion || featured.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setIndex((current) => (current + 1) % featured.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [hovered, focused, reducedMotion, featured.length]);
  function move(direction: number): void {
    setIndex(
      (current) => (current + direction + featured.length) % featured.length,
    );
  }
  function moveFromArrow(
    direction: number,
    event: MouseEvent<HTMLButtonElement>,
  ): void {
    move(direction);
    event.currentTarget.blur();
  }
  return (
    <section
      className="game-carousel"
      aria-label="Jeux à découvrir"
      aria-roledescription="carrousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="carousel-stage">
        {featured.map((game, position) => (
          <article
            key={game.id}
            className={
              position === index ? "carousel-slide is-active" : "carousel-slide"
            }
            aria-hidden={position !== index}
            aria-label={`${position + 1} sur ${featured.length} : ${game.titre}`}
          >
            <img
              src={game.image_url}
              alt=""
              loading={position === 0 ? "eager" : "lazy"}
            />
            <div className="carousel-caption">
              <span>{game.categorie}</span>
              <h2>{game.titre}</h2>
              <Link
                to={`/catalogue/${game.id}`}
                tabIndex={position === index ? 0 : -1}
              >
                Voir la fiche →
              </Link>
            </div>
          </article>
        ))}
        <button
          className="carousel-arrow carousel-arrow-prev"
          type="button"
          onClick={(event) => moveFromArrow(-1, event)}
          aria-label="Jeu précédent"
        >
          ‹
        </button>
        <button
          className="carousel-arrow carousel-arrow-next"
          type="button"
          onClick={(event) => moveFromArrow(1, event)}
          aria-label="Jeu suivant"
        >
          ›
        </button>
      </div>
    </section>
  );
}
