import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import { useCollection } from "../contexts/CollectionContext";
import { api, errorMessage } from "../services/api";
import { Stats, statusLabels } from "../types/api";
export function StatsPage(): JSX.Element {
  const { token } = useAuth();
  const { entries } = useCollection();
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    if (token)
      api
        .stats(token)
        .then((value) => {
          if (active) setData(value);
        })
        .catch((cause: unknown) => {
          if (active) setError(errorMessage(cause));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [token, entries, retry]);
  return (
    <PageLayout>
      <h1>Mes statistiques</h1>
      {loading ? (
        <p role="status">Chargement des statistiques…</p>
      ) : error ? (
        <p role="alert">
          {error} <button onClick={() => setRetry(retry + 1)}>Réessayer</button>
        </p>
      ) : (
        data && (
          <>
            {data.total === 0 && (
              <p role="status">
                Votre collection est vide.{" "}
                <Link to="/catalogue">Ajoutez votre premier jeu.</Link>
              </p>
            )}
            <section className="stats-grid">
              <article>
                <h2>Total</h2>
                <p>{data.total}</p>
              </article>
              <article>
                <h2>Note moyenne</h2>
                <p>
                  {data.note_moyenne === null
                    ? "Aucune note"
                    : `${data.note_moyenne.toFixed(1)} / 5`}
                </p>
              </article>
              {Object.entries(statusLabels).map(([value, label]) => (
                <article key={value}>
                  <h2>{label}</h2>
                  <p>{data.par_statut[value as keyof typeof statusLabels]}</p>
                </article>
              ))}
            </section>
          </>
        )
      )}
    </PageLayout>
  );
}
