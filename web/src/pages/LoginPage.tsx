import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

export function LoginPage(): JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setMessage(email && password ? "La connexion à l’API sera ajoutée prochainement." : "Renseignez votre e-mail et votre mot de passe.");
    }

    return <main className="login-page"><style>{`body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#171a21;color:#d6d7d8}.login-page{min-height:100vh;background:linear-gradient(180deg,#1b2838 0,#171a21 260px);box-sizing:border-box}.login-header{background:#171a21;padding:22px max(24px,7vw);border-bottom:1px solid #2a475e}.login-brand{color:#66c0f4;font-size:1.35rem;font-weight:700;letter-spacing:.08em}.login-card{width:min(100% - 48px,430px);box-sizing:border-box;margin:70px auto;padding:32px;background:#1b2838;box-shadow:0 8px 24px #0009}.login-card h1{margin:0 0 8px;color:#fff;font-size:1.7rem;font-weight:400}.login-card p{color:#8f98a0;line-height:1.5}.login-form{display:grid;gap:9px;margin-top:26px}.login-form label{color:#d6d7d8;font-size:.82rem;text-transform:uppercase}.login-form input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #000;background:#101822;color:#fff;font:inherit}.login-form input:focus{outline:1px solid #66c0f4}.login-form button{margin-top:9px;padding:12px;border:0;color:#fff;background:#1a9fff;font-weight:700;cursor:pointer}.login-form button:hover{background:#66c0f4}.login-message{color:#66c0f4!important}.login-link{margin-top:24px;text-align:center}.login-link a{color:#66c0f4;text-decoration:none}.login-link a:hover{text-decoration:underline}`}</style><header className="login-header"><div className="login-brand">MA COLLECTION</div></header><section className="login-card"><h1>Se connecter</h1><p>Connectez-vous pour accéder à votre ludothèque.</p><form className="login-form" onSubmit={handleSubmit}><label htmlFor="email">Adresse e-mail</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><label htmlFor="password">Mot de passe</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="submit">Se connecter</button>{message && <p className="login-message" role="status">{message}</p>}</form><p className="login-link">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p></section></main>;
}
