import { Link } from "react-router-dom";
import { Stats, Statut, statusLabels } from "../types/api";

const statuses: Statut[] = ["a_decouvrir", "en_cours", "termine"];

export function StatsOverview({ data }: { data: Stats }): JSX.Element {
  const completed = data.par_statut.termine;
  const percentage = data.total
    ? Math.round((completed / data.total) * 100)
    : 0;
  const metrics = [
    {
      label: "Jeux dans la collection",
      value: String(data.total),
    },
    {
      label: "Note moyenne",
      value:
        data.note_moyenne === null
          ? "Aucune note"
          : `${data.note_moyenne.toFixed(1)} / 5`,
      detail: "",
    },
    {
      label: "Jeux en cours",
      value: String(data.par_statut.en_cours),
    },
  ];

  return (
    <>
      <section className="stats-metrics" aria-label="Vue d’ensemble">
        {metrics.map((metric) => (
          <article className="stats-metric" key={metric.label}>
            <h2>{metric.label}</h2>
            <p className="stats-value">{metric.value}</p>
            <p className="stats-caption">{metric.detail}</p>
          </article>
        ))}
      </section>
      {data.total === 0 ? (
        <section className="stats-panel stats-empty" role="status">
          <span className="stats-kicker">Tout commence par un jeu</span>
          <h2>Votre prochaine aventure vous attend.</h2>
          <p>
            Votre collection est vide. Ajoutez votre premier jeu pour voir vos
            statistiques prendre forme.
          </p>
          <Link className="stats-link" to="/catalogue">
            Explorer le catalogue →
          </Link>
        </section>
      ) : (
        <div className="stats-breakdown">
          <section
            className="stats-panel stats-completion"
            aria-labelledby="completion-title"
          >
            <div>
              <h2 className="stats-kicker">Votre progression</h2>
            </div>
            <div
              className="stats-ring"
              role="img"
              aria-label={`${completed} jeux terminés sur ${data.total}, soit ${percentage} %`}
            >
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="stats-ring-track" cx="50" cy="50" r="46" />
                <circle
                  className="stats-ring-fill"
                  cx="50"
                  cy="50"
                  r="46"
                  pathLength="100"
                  strokeDasharray={`${percentage} 100`}
                />
              </svg>
              <div>
                <strong>
                  {percentage}
                  <small> %</small>
                </strong>
                <span>terminés</span>
              </div>
            </div>
            <p className="stats-caption">
              {completed} sur {data.total} jeux terminés
            </p>
          </section>
          <section className="stats-panel" aria-labelledby="distribution-title">
            <h2 className="stats-kicker">Votre collection</h2>
            <ul className="stats-statuses">
              {statuses.map((statut) => {
                const count = data.par_statut[statut];
                const share = Math.round((count / data.total) * 100);
                return (
                  <li key={statut}>
                    <div className="stats-status-label">
                      <span>{statusLabels[statut]}</span>
                      <span>
                        <strong>{count}</strong> · {share} %
                      </span>
                    </div>
                    <progress
                      className={`stats-progress stats-progress-${statut}`}
                      value={count}
                      max={data.total}
                      aria-label={statusLabels[statut]}
                    />
                  </li>
                );
              })}
            </ul>
            <Link className="stats-text-link" to="/collection">
              Retrouver ma collection →
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
