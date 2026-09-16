import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function CollectionPage(): JSX.Element {
    const { token } = useAuth();
    return token ? <main className="login-page"><section className="login-card"><h1>Ma collection</h1><p className="intro">Connexion réussie.</p></section></main> : <Navigate to="/login" replace />;
}
