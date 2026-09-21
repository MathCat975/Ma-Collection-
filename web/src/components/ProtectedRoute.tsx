import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { token, user, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status">Vérification de la session…</p>;
  if (!token)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (error)
    return (
      <p role="alert">
        {error}{" "}
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </p>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
