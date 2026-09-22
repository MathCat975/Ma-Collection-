# Ma Collection - Ludothèque de jeux vidéo

Application réalisée en binôme : une API FastAPI dans `api/` et une interface React dans `web/`. PostgreSQL est utilisé pour l'application **et pour les tests**, conformément au changement de consigne.

## Prérequis

- Git.
- Python 3.12 (version utilisée pour la validation).
- Node.js 24 avec npm.
- Une base PostgreSQL accessible : Neon ou un serveur local.
- Une seconde base ou branche PostgreSQL réservée aux tests.

## 1. Récupérer le projet

```powershell
git clone https://github.com/MathCat975/Ma-Collection-.git
cd Ma-Collection-
```

Toutes les commandes ci-dessous partent de la racine du dépôt, sauf indication contraire.

## 2. Préparer PostgreSQL

### Avec Neon

Créer un projet ou utiliser celui de l'équipe. Récupérer sa chaîne de connexion dans Neon et la placer dans `api/.env` à l'étape suivante. Ne pas partager le mot de passe dans Git.

Pour les tests du projet, la branche `testing` existe séparément de `production`. Chaque branche possède sa propre adresse de connexion.

### Avec un PostgreSQL local

Créer deux bases avec votre outil d'administration PostgreSQL :

```sql
CREATE DATABASE ma_collection;
CREATE DATABASE ma_collection_test;
```

Le rôle utilisé doit pouvoir créer des tables dans la base applicative et des schémas dans la base de test. Les commandes ci-dessus nécessitent un rôle autorisé à créer des bases.

Exemple de configuration locale : `postgresql://USER:PASSWORD@localhost:5432/ma_collection`. Remplacer les identifiants par ceux de votre serveur. Encoder les caractères réservés du mot de passe dans l'URL.

## 3. Installer et configurer le backend

```powershell
python -m venv api/.venv
./api/.venv/Scripts/python.exe -m pip install -r api/requirements-test.txt
Copy-Item api/.env.example api/.env
./api/.venv/Scripts/python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

La copie du fichier d'exemple est réservée à la première installation : conserver votre `.env` s'il existe déjà.

Dans `api/.env`, renseigner :

```dotenv
JWT_SECRET_KEY=COLLER_ICI_LE_SECRET_GENERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Pour PostgreSQL local sans SSL, retirer `?sslmode=require`. Les URL Neon sont adaptées automatiquement au pilote asynchrone `asyncpg`.

L'application lit `api/.env`, puis `.env.local` à la racine s'il existe. Ce dernier prend la priorité pour les clés présentes dans les deux fichiers ; les variables d'environnement du processus prennent la priorité sur les fichiers. Vérifier ces emplacements si une ancienne connexion reste utilisée.

## 4. Peupler le catalogue

```powershell
./api/.venv/Scripts/python.exe api/seed.py
```

Le script crée les tables puis synchronise les **59 jeux** de `api/seed_games.json`, répartis sur au moins quatre catégories. Il peut être relancé : les titres déjà présents sont mis à jour et les identifiants existants sont conservés. Les anciens jeux absents du fichier restent dans la base afin de préserver les collections.

Le catalogue provient du fichier fourni dans le dépôt, sans appel à une API externe. Les illustrations sont chargées depuis leurs URL distantes.

## 5. Lancer les deux serveurs

### Terminal 1 : API

```powershell
./api/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir api --reload
```

- Documentation interactive : [localhost:8000/docs](http://localhost:8000/docs).
- Catalogue : [localhost:8000/items](http://localhost:8000/items).
- Contrat OpenAPI : [localhost:8000/openapi.json](http://localhost:8000/openapi.json).

`app.main:app` désigne l'objet `app` du fichier `api/app/main.py`. Il ne faut pas inverser cette notation.

### Terminal 2 : frontend

```powershell
npm.cmd --prefix web ci
npm.cmd --prefix web run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173). Cette origine exacte est autorisée par CORS. Vite utilise le port 5173 et s'arrête si celui-ci est occupé.

L'URL API vaut `http://localhost:8000` par défaut. Pour la changer, copier `web/.env.example` vers `web/.env`, modifier `VITE_API_URL`, puis redémarrer Vite.

Arrêter chaque serveur avec `Ctrl+C`. Le serveur API et le serveur Vite doivent rester ouverts pendant l'utilisation.

### macOS et Linux

Utiliser `python3 -m venv api/.venv`, puis `./api/.venv/bin/python` à la place de l'exécutable Windows. Remplacer `Copy-Item` par `cp` et `npm.cmd` par `npm`. Les autres arguments sont identiques.

## 6. Tester l'application

### Tests backend sur PostgreSQL

Dans PowerShell, définir l'URL de la base de test, jamais celle de l'application :

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@TEST_HOST/DATABASE?sslmode=require"
$env:TEST_DATABASE_HOST="TEST_HOST"
./api/.venv/Scripts/python.exe -m pytest api/tests -q
```

`TEST_DATABASE_HOST` contient uniquement le nom du serveur, sans protocole ni port. Pour le PostgreSQL local de l'exemple, utiliser `localhost`, la base `ma_collection_test` et retirer le paramètre SSL.

Sur la machine déjà configurée de l'équipe, la variable Windows peut être récupérée sans afficher le secret :

```powershell
$env:TEST_DATABASE_URL = [Environment]::GetEnvironmentVariable("TEST_DATABASE_URL", "User")
./api/.venv/Scripts/python.exe -m pytest api/tests -q
```

Le serveur de test par défaut correspond à la branche Neon `testing` du projet. Pour un autre serveur, définir explicitement `TEST_DATABASE_HOST`. Sans URL PostgreSQL valide, avec un serveur non confirmé ou si la cible correspond à une URL applicative configurée, pytest refuse de démarrer.

Chaque test utilise un schéma PostgreSQL temporaire distinct des tables applicatives. Ce schéma est supprimé à la fin du test. Les tests couvrent les comptes, JWT, validations, catalogue, collections privées, statistiques, CORS, documentation OpenAPI et peuplement sans doublons.

Sous macOS/Linux, utiliser `export TEST_DATABASE_URL='...'` et `export TEST_DATABASE_HOST='...'`.

### Tests frontend et compilation

```powershell
npm.cmd --prefix web test
npm.cmd --prefix web run build
```

Vitest vérifie le client HTTP, les hooks et les routes protégées. Le build vérifie TypeScript en mode strict puis produit `web/dist/`.

Pour les parcours automatisés sur navigateur, arrêter le serveur Vite manuel puis lancer :

```powershell
cd web
npx.cmd playwright install chromium
npm.cmd run test:e2e
cd ..
```

Playwright démarre Vite et vérifie le parcours utilisateur sur ordinateur et en largeur **375 px**. Ces tests simulent les réponses HTTP ; ils ne remplacent pas les tests PostgreSQL ni la vérification manuelle de l'intégration réelle.

Pour vérifier également la connexion réelle React → FastAPI → PostgreSQL, garder les variables de test définies, puis lancer :

```powershell
npm.cmd --prefix web run test:integration
```

Cette commande démarre une API de test sur le port 8001 et Vite sur 5173. Elle peuple un schéma temporaire sur la base de test, vérifie l'inscription, la connexion, la fiche, l'enregistrement persistant d'une collection et les statistiques, puis supprime ce schéma. Les ports 8001 et 5173 doivent être libres.

## 7. Parcours de démonstration

1. Consulter le catalogue, rechercher un jeu, filtrer par catégorie et changer de page.
2. Ouvrir une fiche détaillée.
3. Créer un compte puis se connecter.
4. Ajouter un jeu, tenter un doublon, modifier son statut, sa note et son commentaire.
5. Filtrer et trier la collection, puis consulter les statistiques.
6. Se déconnecter et vérifier la redirection des pages privées.
7. Se connecter avec un autre compte : sa collection doit être distincte.

## Architecture et contrat

| Dossier | Responsabilité |
| --- | --- |
| `api/app/routers/` | Routes HTTP du contrat |
| `api/app/models/`, `schemas/` | Tables SQLModel et validation Pydantic |
| `api/app/services/` | Logique métier et requêtes asynchrones |
| `api/app/core/`, `db/`, `dependencies/` | Configuration, sécurité, sessions et dépendances |
| `web/src/types/api.ts` | Types du contrat écrits à la main |
| `web/src/services/api.ts` | Client HTTP unique |
| `web/src/contexts/` | AuthContext et CollectionContext |
| `web/src/hooks/` | Persistance générique et debounce de 400 ms |
| `web/src/pages/`, `components/` | Écrans et composants React |

Les routes imposées sont conservées : `/auth/register`, `/auth/login`, `/auth/me`, `/items`, `/items/{item_id}`, `/me/collection`, `/me/collection/{entry_id}` et `/me/stats`. Voir les [instructions backend](api/README.md) et les [instructions frontend](web/README.md).

## Sécurité

Les mots de passe sont hachés avec bcrypt et ne figurent dans aucune réponse. La limite de 72 octets UTF-8 évite leur troncature par bcrypt. Les jetons JWT expirent au bout de 30 minutes et les routes privées vérifient le propriétaire côté serveur.

La déconnexion efface le JWT côté navigateur. Un jeton déjà copié reste utilisable jusqu'à son expiration ; le contrat ne prévoit pas de route de révocation. Le stockage dans localStorage expose le jeton en cas de faille XSS. Une alternative serait un cookie HttpOnly, Secure et SameSite accompagné d'une protection CSRF.

Les fichiers `.env`, `.env.local`, les environnements virtuels et les dépendances sont ignorés par Git. Les variables `VITE_*` sont publiques dans le navigateur : elles ne doivent jamais contenir un secret JWT ou un mot de passe PostgreSQL.

## Dépannage

- **Uvicorn introuvable** : utiliser l'exécutable du venv avec `-m uvicorn`, comme dans les commandes ci-dessus.
- **Module main introuvable** : depuis la racine, conserver `--app-dir api` ; depuis `api/`, utiliser `app.main:app`.
- **Connexion PostgreSQL impossible** : vérifier la base, les identifiants, le réseau, le SSL et la priorité des fichiers de configuration.
- **Erreur CORS** : ouvrir le frontend sur `http://localhost:5173`.
- **Port 5173 occupé** : arrêter l'ancien serveur avant de relancer Vite ou Playwright.
