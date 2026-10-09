import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import { StatsOverview } from "../components/StatsOverview";
import { useAuth } from "../contexts/AuthContext";
import { useCollection } from "../contexts/CollectionContext";
import { api, errorMessage } from "../services/api";
import { Stats } from "../types/api";
import "./stats.css";
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
      <div className="stats-dashboard">
        <header className="stats-header">
          <div>
            <h1>Mes statistiques</h1>
          </div>
          <Link className="stats-link" to="/collection">
            Ma collection →
          </Link>
        </header>
        {loading ? (
          <p className="stats-panel" role="status">
            Chargement des statistiques…
          </p>
        ) : error ? (
          <p className="stats-panel stats-error" role="alert">
            {error}{" "}
            <button onClick={() => setRetry(retry + 1)}>Réessayer</button>
          </p>
        ) : (
          data && <StatsOverview data={data} />
        )}
      </div>
    </PageLayout>
  );
}
