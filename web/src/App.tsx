import { FormEvent, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { RegisterPage } from "./pages/RegisterPage";
import { CollectionPage } from "./pages/CollectionPage";

type LoginForm = { email: string; password: string };

export function App(): JSX.Element {
    return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/collection" element={<CollectionPage />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
}

function LoginPage(): JSX.Element {
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { token, login } = useAuth();
    const navigate = useNavigate();

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setMessage(""); setIsLoading(true);
        login(form).then(() => navigate("/collection")).catch((error: Error) => setMessage(error.message)).finally(() => setIsLoading(false));
    }

    return (
        <main className="login-page">
            <style>{`body{margin:0;font-family:system-ui,sans-serif;background:#101827;color:#f8fafc}.login-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top left,#263a70 0,#101827 46%,#090e18 100%)}.login-card{width:min(100%,440px);padding:42px 40px;border:1px solid #334155;border-radius:24px;background:#0f172add;box-shadow:0 24px 70px #0005}.brand-mark{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;color:#172554;background:#a5f3fc;font-weight:800}.eyebrow{margin:22px 0 8px;color:#67e8f9;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em}h1{margin:0;font-size:clamp(1.8rem,5vw,2.35rem)}.intro{margin:14px 0 30px;color:#cbd5e1;line-height:1.6}.login-form{display:grid;gap:10px}label{color:#e2e8f0;font-size:.9rem;font-weight:600}input{width:100%;margin-bottom:12px;padding:13px 14px;border:1px solid #334155;border-radius:10px;color:#f8fafc;background:#111c31;font:inherit;outline:none}input:focus{border-color:#67e8f9}button{margin-top:8px;padding:13px 16px;border:0;border-radius:10px;color:#082f49;background:#67e8f9;font:inherit;font-weight:800;cursor:pointer}.form-message{color:#a5f3fc}.signup-link{text-align:center;color:#94a3b8;font-size:.9rem}a{color:#67e8f9;font-weight:700}@media(max-width:480px){.login-card{padding:32px 24px}}`}</style>
            <section className="login-card" aria-labelledby="login-title">
                <div className="brand-mark" aria-hidden="true">MC</div>
                <p className="eyebrow">Ma Collection</p>
                <h1 id="login-title">Bon retour parmi nous</h1>
                <p className="intro">Connectez-vous pour retrouver votre ludothèque.</p>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Adresse e-mail</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                    <label htmlFor="password">Mot de passe</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Votre mot de passe" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                    <button type="submit" disabled={isLoading}>{isLoading ? "Connexion..." : "Se connecter"}</button>
                    {message && <p className="form-message" role="status">{message}</p>}
                </form>
                <p className="signup-link">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
            </section>
        </main>
    );
}
