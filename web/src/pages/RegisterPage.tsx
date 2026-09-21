import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

export function RegisterPage(): JSX.Element {
    const [message, setMessage] = useState("");
    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setMessage("Le compte sera créé lorsque l’API d’inscription sera activée.");
    }

    return <main className="login-page"><style>{`body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#171a21;color:#d6d7d8}.login-page{min-height:100vh;display:grid;place-items:center;background:linear-gradient(180deg,#1b2838 0,#171a21 260px);padding:24px}.register-card{width:min(100%,430px);box-sizing:border-box;padding:32px;background:#1b2838;box-shadow:0 8px 24px #0009}.register-card h1{margin:0 0 8px;color:#fff;font-weight:400}.register-card p{color:#8f98a0}.register-form{display:grid;gap:9px;margin-top:24px}.register-form label{font-size:.82rem;text-transform:uppercase}.register-form input{box-sizing:border-box;width:100%;padding:12px;border:0;background:#101822;color:#fff;font:inherit}.register-form button{margin-top:8px;padding:12px;border:0;color:#fff;background:#1a9fff;font-weight:700;cursor:pointer}.register-message{color:#66c0f4!important}.register-link{text-align:center}.register-link a{color:#66c0f4}`}</style><section className="register-card"><h1>Créer un compte</h1><p>Rejoignez votre ludothèque personnelle.</p><form className="register-form" onSubmit={handleSubmit}><label htmlFor="register-email">Adresse e-mail</label><input id="register-email" type="email" required /><label htmlFor="register-password">Mot de passe</label><input id="register-password" type="password" minLength={8} required /><label htmlFor="register-confirmation">Confirmer le mot de passe</label><input id="register-confirmation" type="password" minLength={8} required /><button type="submit">Créer mon compte</button>{message && <p className="register-message" role="status">{message}</p>}</form><p className="register-link">Déjà un compte ? <Link to="/login">Se connecter</Link></p></section></main>;
}
