# Frontend - Ma Collection

Interface de la ludothèque, développée avec React 18, TypeScript strict, React Router et Vite. Le [README racine](../README.md) décrit l'installation complète, PostgreSQL et le lancement des deux serveurs.

## Installation

Prérequis : Node.js 24 avec npm, et le backend démarré sur `http://localhost:8000`.

Depuis le dossier `web/` :

```powershell
npm.cmd ci
npm.cmd run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173). Le port est fixe pour respecter la configuration CORS de l'API. Sous macOS/Linux, remplacer `npm.cmd` par `npm`.

## Configuration

Le frontend utilise `http://localhost:8000` par défaut. Pour une autre adresse :

```powershell
Copy-Item .env.example .env
```

Renseigner dans `.env` :

```dotenv
VITE_API_URL=http://localhost:8000
```

Conserver un `.env` existant. Redémarrer Vite après un changement. Les variables Vite sont publiques : ne jamais y mettre l'URL PostgreSQL ou la clé JWT. Le navigateur accède à PostgreSQL uniquement par l'API.

## Pages

| Route | Accès | Fonction |
| --- | --- | --- |
| `/catalogue` | Public | Recherche, catégorie, pagination et carrousel |
| `/catalogue/:id` | Public | Fiche détaillée |
| `/register` | Public | Inscription |
| `/login` | Public | Connexion |
| `/collection` | Authentifié | Ajout, modification, suppression, filtre et tri |
| `/stats` | Authentifié | Total, répartition par statut et note moyenne |

Les routes privées redirigent vers `/login` sans session valide. La déconnexion efface le jeton et les données de session affichées. Les erreurs, chargements et listes vides sont présentés sur les écrans concernés.

## Organisation et contraintes du sujet

- `src/types/api.ts` : types écrits à la main, dont `Statut = "a_decouvrir" | "en_cours" | "termine"`.
- `src/services/api.ts` : seul point d'appel réseau, en-tête Bearer et conversion des erreurs `{ erreur: { code, message } }`.
- `src/contexts/AuthContext.tsx` : jeton, utilisateur courant, connexion et déconnexion.
- `src/contexts/CollectionContext.tsx` : collection serveur de l'utilisateur connecté.
- `src/hooks/useLocalStorage.ts` : hook générique de persistance.
- `src/hooks/useDebounce.ts` : recherche temporisée de 400 ms.
- `src/pages/` et `src/components/` : composants fonctionnels, props typées et clés stables.
- Feuilles CSS classiques, sans bibliothèque de composants prêts à l'emploi.

TypeScript est configuré avec `strict: true` et aucun `any` n'est utilisé dans le code frontend. Les composants restent sous 150 lignes et les parcours navigateur incluent une largeur de 375 px.

## Tests

```powershell
npm.cmd test
npm.cmd run build
```

Vitest teste les hooks, le client HTTP et les protections d'accès. Pour travailler en mode surveillance : `npm.cmd run test:watch`.

Pour vérifier le parcours utilisateur dans Chromium :

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Arrêter votre serveur Vite avant cette commande : Playwright démarre son propre serveur sur 5173. Les tests simulent l'API et couvrent inscription, connexion, recherche, collection, statistiques, déconnexion et panne réseau, sur ordinateur et mobile. Pour les tests de la vraie base PostgreSQL, suivre le README racine.

Pour le parcours navigateur avec une vraie API et PostgreSQL, configurer `TEST_DATABASE_URL` comme décrit dans le README racine, installer les dépendances Python dans `api/.venv`, puis lancer `npm.cmd run test:integration`. Les ports 5173 et 8001 doivent être libres. Le schéma temporaire est nettoyé après le test.

## Build et lisibilité

```powershell
npm.cmd run build
npm.cmd run format:check
```

Le build produit `dist/`. `npm.cmd run format` remet les sources en forme. `npm.cmd run preview` sert le build localement, mais son port par défaut n'est pas autorisé par le CORS du backend ; pour tester l'intégration, arrêter Vite puis utiliser `npm.cmd run preview -- --host localhost --port 5173 --strictPort`.

## Session et sécurité

Le mot de passe est transmis à l'API et n'est pas enregistré dans localStorage. Seul le JWT y est conservé ; sa validité est contrôlée via `/auth/me` et les réponses 401 ferment la session. Les contrôles de propriété restent côté serveur.

Une faille XSS pourrait lire ce jeton. L'alternative à expliquer en soutenance est le cookie HttpOnly/Secure/SameSite avec protection CSRF. Ne pas partager les tokens ni les secrets de configuration.
