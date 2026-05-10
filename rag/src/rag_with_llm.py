#!/usr/bin/env python3

from langchain_chroma import Chroma
from FlagEmbedding import BGEM3FlagModel
import requests
import os

LLM_PROVIDER = "ollama"
OLLAMA_MODEL = "mistral"
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_HOST}/api/generate"

class BGE_Embedding:
    def __init__(self):
        self.model = BGEM3FlagModel("BAAI/bge-m3", device="cpu", use_fp16=False)

    def embed_query(self, text):
        return self.model.encode([text], batch_size=1, max_length=512)["dense_vecs"][0].tolist()

    def embed_documents(self, texts):
        embeddings = self.model.encode(texts, batch_size=12, max_length=512)["dense_vecs"]
        return [emb.tolist() for emb in embeddings]

def call_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.3, "num_predict": 500}
            },
            timeout=120
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.ConnectionError:
        return "Erreur: Ollama n'est pas lancé. Lance-le avec: ollama serve"
    except Exception as e:
        return f"Erreur LLM: {e}"


def generate_response(question: str, context: str) -> str:
    prompt = f"""Tu es un assistant expert en analyse de documents.

OBJECTIF:
Répondre à la question en utilisant UNIQUEMENT les informations pertinentes du contexte.

RÈGLES IMPORTANTES:

Le contexte peut contenir des informations NON pertinentes
Ignore toute information qui ne répond pas directement à la question
Ne résume pas tout le contexte
Sélectionne uniquement les passages utiles
Si certaines informations manquent, dis-le clairement
N'invente rien
Si la réponse est une procedure ou une liste, formate-la correctement avec des puces ou des numéros, chaque élément sur une nouvelle ligne, et saute une ligne avant de donner la liste des procédures ou des éléments
Remplace les \n par des <br/>

CONTEXTE:
{context}

QUESTION: {question}

RÉPONSE:"""

    return call_ollama(prompt)


print("Chargement du modèle d'embedding BGE-M3...")
embedding_function = BGE_Embedding()

PERSIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
print("Chargement de la base vectorielle...")

vector_store = Chroma(
    collection_name="test_collection",
    persist_directory=PERSIST_DIR,
    embedding_function=embedding_function,
)
retriever = vector_store.as_retriever(search_kwargs={"k": 5})


def interactive_loop():
    print(f"Prêt ! (LLM: {LLM_PROVIDER}/{OLLAMA_MODEL})")
    print("Pose ta question (ou 'quit' pour quitter)\n")

    while True:
        question = input("Ta question: ").strip()

        if question.lower() in ["quit", "exit", "q"]:
            print("Au revoir !")
            break

        if not question:
            continue

        results = retriever.invoke(question)

        if not results:
            print("Aucun document pertinent trouvé.\n")
            continue

        context = "\n\n---\n\n".join([doc.page_content for doc in results])

        print(f"{len(results)} passage(s) trouvé(s)")
        print("Génération de la réponse...\n")

        response = generate_response(question, context)

        print("RÉPONSE:")
        print(response)
        print()


if __name__ == "__main__":
    interactive_loop()
