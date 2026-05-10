# Knowledge Documents — Projet Intensif

Ce dépôt contient une application web de gestion et de recherche documentaire, ainsi qu'un module RAG (Retrieval Augmented Generation) pour répondre à des questions sur des PDFs.

## Structure du dépôt

- `back/` : API backend (Express) — serveur Node (fichiers sources, routes, services)
- `front/` : Frontend React + Vite (interface utilisateur et administration)
- `rag/` : Module RAG (Python, FastAPI, ChromaDB, Ollama) pour indexation et QA
- `public/`, `LICENSE`, etc. : ressources et métadonnées du projet

Pour des informations détaillées par sous-projet, consultez leurs README respectifs :

- [back/README.md](back/README.md)
- [front/README.md](front/README.md)
- [rag/README.md](rag/README.md)

## Prérequis

- Node.js (version 24.12.0 recommandée par les README locaux)
- npm
- Python 3.10+
- Ollama (pour le module RAG)

## Installation et exécution

Remarque : exécutez les commandes depuis la racine du dépôt sauf indication contraire.

### Backend (Express)

```bash
cd back
npm install
# Copier l'exemple de config de base de données
cp src/config/db.json.example src/config/db.json
# (si présent) dupliquer et personnaliser .env
cp .env.example .env

# Lancer en développement (nodemon)
npm run dev
```

Le backend écoute par défaut sur `http://localhost:3000` (voir `back/README.md`).

### Frontend (React + Vite)

```bash
cd front
npm install
# Créer un fichier .env à la racine ou dans front contenant :
# VITE_BACKEND_API_URL=http://localhost:3000
npm run dev
```

Vite affiche l'URL locale (ex. `http://localhost:5173`) dans le terminal.

### RAG (Python, FastAPI, ChromaDB, Ollama)

```bash
cd rag/src
python -m venv venv
# Windows
venv\\Scripts\\activate
# Linux / macOS
source venv/bin/activate
pip install -r requirements.txt

# Démarrer Ollama (voir configuration locale)
ollama serve

# Lancer l'API RAG
python api.py
```

L'API RAG écoute généralement sur `http://localhost:8000` (voir `rag/README.md`).

## Données et configuration

- Déposez vos fichiers PDF dans le dossier `/files` à la racine comme indiqué dans `back/README.md`.
- Le RAG utilise `rag/src/data/pdf_urls.json` pour lister les PDFs à indexer.
- Vérifiez et personnalisez les fichiers de configuration `src/config/db.json` (backend) et `.env` pour indiquer les URLs/credentials nécessaires.

## Licence

Ce projet est accompagné du fichier `LICENSE` à la racine.

---

Pour toute précision ou si vous voulez que je crée un README plus détaillé (exemples d'API, captures d'écran, CI/CD, ou un script d'installation), dites-le et je l'ajoute.
