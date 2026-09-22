import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../pages/catalogue.css";
export function PageLayout({ children, searchValue, onSearchChange }: { children: ReactNode; searchValue?: string; onSearchChange?: (value: string) => void }): JSX.Element {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <main className={`catalogue-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <p className="brand">
          <span>◆</span> Ma Collection
        </p>
        <p className="nav-title">Navigation</p>
        <NavLink className="nav-link" to="/catalogue">
          ▦ Catalogue
        </NavLink>
        <NavLink className="nav-link" to="/collection">
          ♥ Ma collection
        </NavLink>
        <NavLink className="nav-link" to="/stats">
          ▥ Statistiques
        </NavLink>
      </aside>
      <div className="content">
        <button
          className="sidebar-toggle"
          aria-label="Ouvrir ou fermer la navigation"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
        <header className="topbar">
          {searchValue !== undefined && onSearchChange && (
            <input className="topbar-search" aria-label="Rechercher un jeu" placeholder="Rechercher un jeu…" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} />
          )}
          {user ? (
            <button className="login-button" onClick={logout}>Se déconnecter</button>
          ) : (
            <Link className="login-button" to="/login">
              Se connecter
            </Link>
          )}
        </header>
        <div className="page">{children}</div>
      </div>
    </main>
  );
}
