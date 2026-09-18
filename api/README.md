API REST de la ludothèque de jeux vidéo **Ma Collection**, développée avec FastAPI, SQLModel et PostgreSQL.

Elle permet de consulter le catalogue public, de créer un compte et de gérer une collection personnelle de jeux vidéo.

## Prérequis

- Python 3.12 ou une version plus récente ;
- une base PostgreSQL, par exemple une base Neon ;
- Git.

Toutes les commandes suivantes doivent être exécutées depuis le dossier `api`.

## Installation

### 1. Créer l'environnement virtuel

Sous Windows PowerShell :

```powershell
python -m venv .venv
```

### 2. Activer l'environnement virtuel

```powershell
.\.venv\Scripts\Activate.ps1
```

Si PowerShell refuse l'activation, les commandes peuvent être exécutées directement avec `.\.venv\Scripts\python.exe`.

### 3. Installer les dépendances

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Configuration

Copier le fichier d'exemple :

```powershell
Copy-Item .env.example .env
```

Compléter ensuite le fichier `.env` :

```dotenv
JWT_SECRET_KEY=remplacer-par-un-secret-long-et-aleatoire
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Pour générer une clé JWT aléatoire :

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

La valeur de `DATABASE_URL` est disponible dans le tableau de bord du fournisseur PostgreSQL. Avec Neon, elle peut aussi être récupérée avec le CLI :

```powershell
neon connection-string production --project-id PROJECT_ID
```

Le fichier `.env` contient des secrets et ne doit jamais être ajouté à Git. Seul `.env.example` doit être versionné.

## Peupler le catalogue

Le script ajoute les 40 jeux du catalogue dans PostgreSQL :

```powershell
python seed.py
```

Le script peut être relancé sans créer de doublons.

## Lancer le serveur

```powershell
python -m uvicorn app.main:app --reload
```

Le serveur est alors accessible aux adresses suivantes :

- API : <http://127.0.0.1:8000>
- documentation Swagger : <http://127.0.0.1:8000/docs>
- schéma OpenAPI : <http://127.0.0.1:8000/openapi.json>

Pour arrêter le serveur, utiliser `Ctrl+C`.

La commande doit contenir `app.main:app` : le premier `app` désigne le package, `main` le fichier `main.py` et le dernier `app` l'instance FastAPI.

## Routes principales

### Authentification

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Créer un compte |
| `POST` | `/auth/login` | Se connecter et obtenir un JWT |
| `GET` | `/auth/me` | Consulter l'utilisateur connecté |

### Catalogue public

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/items` | Rechercher, filtrer et paginer le catalogue |
| `GET` | `/items/{item_id}` | Consulter la fiche d'un jeu |

### Collection personnelle

Les routes `/me/*` nécessitent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/me/collection` | Consulter et filtrer sa collection |
| `POST` | `/me/collection` | Ajouter un jeu à sa collection |
| `PATCH` | `/me/collection/{entry_id}` | Modifier une entrée |
| `DELETE` | `/me/collection/{entry_id}` | Supprimer une entrée |
| `GET` | `/me/stats` | Consulter ses statistiques |

## Lancer les tests

Les tests doivent utiliser une base PostgreSQL réservée aux tests, jamais la branche `production`.

Définir `TEST_DATABASE_URL` avec l'adresse de la branche de test :

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@TEST_HOST/DATABASE?sslmode=require"
```

Puis lancer :

```powershell
python -m pytest -q
```

Sans `TEST_DATABASE_URL`, les tests PostgreSQL sont ignorés afin d'éviter toute écriture accidentelle dans la base de production.

## Structure du backend

```text
api/
|-- app/
|   |-- core/          # Configuration et sécurité JWT
|   |-- db/            # Connexion et initialisation PostgreSQL
|   |-- dependencies/  # Dépendances FastAPI
|   |-- models/        # Modèles SQLModel
|   |-- routers/       # Routes de l'API
|   |-- schemas/       # Schémas d'entrée et de sortie
|   |-- services/      # Logique métier
|   `-- main.py        # Assemblage de l'application
|-- tests/             # Tests pytest
|-- .env.example       # Exemple de configuration
|-- requirements.txt   # Dépendances Python
`-- seed.py            # Peuplement du catalogue
```

## CORS

L'API autorise uniquement le serveur de développement Vite disponible sur `http://localhost:5173`.
