import "./register.css";
import { api, errorMessage } from "../services/api";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function RegisterPage(): JSX.Element {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    if (password !== data.get("confirmation")) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await api.register({ email, password });
      form.reset();
      navigate("/login");
    } catch (cause) {
      setMessage(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Créer un compte</h1>
        <p>Rejoignez votre ludothèque personnelle.</p>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="register-email">Adresse e-mail</label>
          <input
            id="register-email"
            name="email"
            autoComplete="email"
            type="email"
            required
          />
          <label htmlFor="register-password">Mot de passe</label>
          <input
            id="register-password"
            name="password"
            autoComplete="new-password"
            maxLength={72}
            type="password"
            minLength={8}
            required
          />
          <label htmlFor="register-confirmation">
            Confirmer le mot de passe
          </label>
          <input
            id="register-confirmation"
            name="confirmation"
            autoComplete="new-password"
            maxLength={72}
            type="password"
            minLength={8}
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "Création…" : "Créer mon compte"}
          </button>
          {message && (
            <p className="register-message" role="alert">
              {message}
            </p>
          )}
        </form>
        <p className="register-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
