# 📚 RAG - Retrieval Augmented Generation

> Système intelligent de question-réponse sur des documents PDF utilisant ChromaDB, BGE-M3 et Ollama

## 📖 Description

Ce projet implémente un système RAG (Retrieval Augmented Generation) complet permettant d'indexer des documents PDF et de répondre à des questions en utilisant uniquement le contenu pertinent des documents.

### 🎯 Fonctionnalités principales

- **Indexation intelligente** de documents PDF avec métadonnées
- **Recherche sémantique** utilisant des embeddings BGE-M3
- **Génération de réponses** contextuelles avec Ollama (Mistral)
- **API REST** FastAPI pour intégration facile
- **Gestion incrémentale** : évite de ré-indexer les documents déjà traités
- **Filtrage par document** : interroge uniquement les PDFs spécifiés
- **Détection de duplicatas** : évite l'indexation multiple du même contenu

## 🏗️ Architecture

```
┌─────────────────┐
│  Frontend/User  │
└────────┬────────┘
         │ HTTP POST /rag
         ▼
┌─────────────────┐
│   FastAPI API   │
│    (api.py)     │
└────────┬────────┘
         │
         ├──► 1. Mise à jour pdf_urls.json
         ├──► 2. Chargement PDFs (load_pdf_from_json.py)
         │         └──► Extraction texte (PyMuPDF)
         │         └──► Chunking (RecursiveCharacterTextSplitter)
         │         └──► Embeddings (BGE-M3)
         │         └──► Stockage (ChromaDB)
         │
         └──► 3. Recherche + Génération (rag_with_llm.py)
                   └──► Similarity Search (ChromaDB)
                   └──► LLM Generation (Ollama)
```

## 📋 Prérequis

### Système
- Python 3.10+
- Ollama installé et en cours d'exécution
- Au moins 4 GB de RAM disponible (pour le modèle BGE-M3)

### Services externes
- Serveur de fichiers PDF 
- Ollama avec le modèle Mistral

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://gitlab.ecole.ensicaen.fr/brissot/projet-intensif-knowledge-documents-rag.git
cd projet-intensif-knowledge-documents-rag/src
```

### 2. Créer un environnement virtuel

```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configurer Ollama

```bash
# Démarrer Ollama
ollama serve

# Dans un autre terminal, télécharger le modèle Mistral
ollama pull mistral
```

## ⚙️ Configuration

### Variables d'environnement

```bash
# URL du serveur de fichiers PDF
export PDF_BASE_URL="IP_ADDRESS_OF_THE_SERVER_FILE"
```

### Structure des fichiers

```
src/
├── api.py                    # API FastAPI principale
├── rag_with_llm.py          # Logique RAG et LLM
├── load_pdf_from_json.py    # Chargement et indexation des PDFs
├── data/
│   └── pdf_urls.json        # Configuration des PDFs (généré automatiquement)
└── chroma_db/               # Base de données vectorielle (généré automatiquement)
```

## 🎮 Utilisation

### Démarrer l'API

```bash
cd src
python3 api.py
```

L'API sera accessible sur `http://localhost:8000`

### Documentation interactive

Accédez à la documentation Swagger : `http://localhost:8000/docs`

### Exemple de requête

```bash
curl -X POST "http://localhost:8000/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "pdfs": [
      {
        "url": "/files/document1.pdf",
        "title": "Guide utilisateur"
      },
      {
        "url": "/files/document2.pdf",
        "title": "Documentation technique"
      }
    ],
    "question": "Comment configurer le système ?"
  }'
```

### Format de réponse

```json
{
  "answer": "Pour configurer le système, vous devez..."
}
```

## 🔧 Endpoints API

### `POST /rag`

Pose une question sur des documents PDF spécifiques.

**Body:**
```json
{
  "pdfs": [
    {
      "url": "string",      // URL ou chemin du PDF
      "title": "string"     // Titre optionnel
    }
  ],
  "question": "string"      // Question à poser
}
```

**Response:**
```json
{
  "answer": "string"        // Réponse générée
}
```

`

## 🧠 Composants techniques

### 1. Embeddings - BGE-M3

- **Modèle** : `BAAI/bge-m3`
- **Dimension** : 1024
- **Max tokens** : 512
- **Langue** : Multilingue (optimisé pour le français)

### 2. Base vectorielle - ChromaDB

- **Collection** : `test_collection`
- **Distance** : Cosine similarity
- **Persistance** : `./chroma_db`

### 3. LLM - Ollama (Mistral)

- **Modèle** : `mistral`
- **Température** : 0.3 (réponses factuelles)
- **Tokens max** : 500
- **Mode** : Non-streaming

### 4. Découpage de texte

- **Méthode** : RecursiveCharacterTextSplitter
- **Chunk size** : 1000 caractères
- **Overlap** : 200 caractères
- **Séparateurs** : `\n\n`, `\n`, `.`, ` `

## 📊 Métadonnées stockées

Chaque chunk de document contient :

```python
{
  "filename": "document.pdf",
  "title": "Titre du document",
  "page": 1,
  "chunk_id": 0,
  "total_chunks": 10
}
```

## 🛠️ Maintenance et dépannage

### Erreur : ChromaDB corrompu

```bash
# Réinitialiser la base de données
curl -X GET "http://localhost:8000/reset-db"

# Ou manuellement
rm -rf src/chroma_db
```

### Erreur : Ollama non disponible

```bash
# Vérifier qu'Ollama est lancé
curl http://localhost:11434/api/generate

# Redémarrer Ollama si nécessaire
ollama serve
```


### Réindexer tous les documents

```bash
# Supprimer la base et relancer l'API
rm -rf src/chroma_db
# Les documents seront réindexés automatiquement à la prochaine requête
```

## 📝 Licence

Projet Intensif - ENSICAEN 2026

