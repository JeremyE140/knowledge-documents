#!/usr/bin/env python3



from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from FlagEmbedding import BGEM3FlagModel
import fitz
import requests
import json
import os
import tempfile
from typing import List, Dict, Set

print("RAG - Chargement de PDFs depuis JSON")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(BASE_DIR, "data", "pdf_urls.json")
PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")
PDF_BASE_URL = os.getenv("PDF_BASE_URL", "http://10.214.11.138:3000")  

print("\n[1/4] Chargement du modèle d'embedding BGE-M3...")

class BGE_Embedding:
    def __init__(self):
        self.model = BGEM3FlagModel("BAAI/bge-m3", device="cpu", use_fp16=False)
        print("      Modèle BGE-M3 chargé")

    def embed_query(self, text):
        return self.model.encode([text], batch_size=1, max_length=512)["dense_vecs"][0].tolist()

    def embed_documents(self, texts):
        embeddings = self.model.encode(texts, batch_size=12, max_length=512)["dense_vecs"]
        return [emb.tolist() for emb in embeddings]

embedding_function = BGE_Embedding()

print("\n[2/4] Chargement de la base vectorielle existante...")

if os.path.exists(PERSIST_DIR):
    vector_store = Chroma(
        collection_name="test_collection",
        persist_directory=PERSIST_DIR,
        embedding_function=embedding_function,
    )
    print(f"      Base vectorielle chargée depuis {PERSIST_DIR}")
else:
    vector_store = Chroma(
        collection_name="test_collection",
        persist_directory=PERSIST_DIR,
        embedding_function=embedding_function,
    )
    print(f"      Nouvelle base vectorielle créée dans {PERSIST_DIR}")

def get_existing_filenames() -> Set[str]:
    try:
        collection = vector_store._collection
        results = collection.get(include=["metadatas"])
        existing_filenames = set()
        if results and results['metadatas']:
            for metadata in results['metadatas']:
                if metadata and 'filename' in metadata:
                    existing_filenames.add(metadata['filename'])
        print(f"      {len(existing_filenames)} fichier(s) déjà indexé(s) trouvé(s)")
        return existing_filenames
    except Exception as e:
        print(f"      Avertissement: impossible de récupérer les fichiers existants: {e}")
        return set()

existing_filenames = get_existing_filenames()

print("\n[3/4] Lecture du fichier JSON et téléchargement des PDFs...")

if not os.path.exists(JSON_FILE):
    print(f"      Erreur: le fichier {JSON_FILE} n'existe pas!")
    print(f"      Créez un fichier JSON avec la structure suivante:")
    print("""      {
        "pdfs": [
          {"url": "/files/document1.pdf", "title": "Document 1"},
          {"url": "/files/document2.pdf", "title": "Document 2"}
        ]
      }""")
    exit(1)

with open(JSON_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

pdf_urls = data.get('pdfs', [])
print(f"      {len(pdf_urls)} URL(s) trouvées dans le JSON")

documents = []
new_pdfs_count = 0
skipped_count = 0

for item in pdf_urls:
    url_path = item.get('url', '')  
    title = item.get('title', 'Sans titre')
    
    if not url_path:
        print(f"       Chemin vide ignoré")
        continue
    
    if '/files/' in url_path:
        filename = url_path.split("/files/")[-1] 
        
        if url_path.startswith('/files/'):
            full_url = PDF_BASE_URL + url_path
        else:
            full_url = url_path
    else:
        filename = url_path.split("/")[-1]
        full_url = url_path
    
    if filename in existing_filenames:
        print(f"      ⊘ Déjà indexé: {title} (fichier: {filename})")
        skipped_count += 1
        continue
    
    try:
        print(f"      ↓ Téléchargement: {title}...")
        resp = requests.get(full_url, timeout=60)
        resp.raise_for_status()
        
        content_type = resp.headers.get('Content-Type', '').lower()
        if 'application/pdf' not in content_type and not filename.lower().endswith('.pdf'):
            print(f"      ✗ Pas un PDF: {full_url} (Content-Type: {content_type})")
            continue
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmpf:
            tmpf.write(resp.content)
            tmp_path = tmpf.name
        
        try:
            doc = fitz.open(tmp_path)
            page_count = len(doc)
            
            for page_num, page in enumerate(doc):
                text = page.get_text()
                if text.strip():
                    documents.append(Document(
                        page_content=text,
                        metadata={
                            "filename": filename,  
                            "page": page_num + 1,
                            "title": title
                        }
                    ))
            
            doc.close()
            new_pdfs_count += 1
            print(f"      ✓ {title} ({page_count} pages) extrait depuis {full_url}")
            
        except Exception as e:
            print(f"      ✗ Erreur extraction PDF {full_url}: {e}")
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
                
    except requests.exceptions.RequestException as e:
        print(f"       Erreur téléchargement {full_url}: {e}")
    except Exception as e:
        print(f"       Erreur traitement {full_url}: {e}")

print(f"\n      Résumé:")
print(f"      - {new_pdfs_count} nouveau(x) PDF(s) téléchargé(s)")
print(f"      - {skipped_count} PDF(s) déjà indexé(s) ignoré(s)")
print(f"      - {len(documents)} page(s) extraites au total")

if not documents:
    print("\n      Aucun nouveau document à indexer. Terminé.")
    exit(0)

print("\n[4/4] Découpage et indexation dans ChromaDB...")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=30,
    separators=["\n## ", "\n\n", "\n", ". ", " "]
)
chunks = text_splitter.split_documents(documents)
print(f"      {len(chunks)} chunks créés")

vector_store.add_documents(chunks)
print(f"      ✓ Nouveaux documents ajoutés à la base vectorielle")

print("\nIndexation terminée !")
print(f"Total dans la base: {vector_store._collection.count()} chunks")
