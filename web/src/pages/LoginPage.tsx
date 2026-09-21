import "./login.css";
import { useAuth } from "../contexts/AuthContext";
import { errorMessage } from "../services/api";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await login({ email, password });
      setPassword("");
      navigate("/collection");
    } catch (cause) {
      setMessage(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-brand">MA COLLECTION</div>
      </header>
      <section className="login-card">
        <h1>Se connecter</h1>
        <p>Connectez-vous pour accéder à votre ludothèque.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
          {message && (
            <p className="login-message" role="alert">
              {message}
            </p>
          )}
        </form>
        <p className="login-link">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </section>
    </main>
  );
}
