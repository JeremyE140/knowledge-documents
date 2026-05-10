#!/usr/bin/env python3

import json
import os
import subprocess
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from rag_with_llm import vector_store, generate_response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
JSON_FILE = os.path.join(DATA_DIR, "pdf_urls.json")


PDF_BASE_URL = os.getenv("PDF_BASE_URL", "http://10.214.11.138:3000")


class PdfItem(BaseModel):
    url: str
    title: Optional[str] = None


class AskRequest(BaseModel):
    pdfs: List[PdfItem]
    question: str


class AskResponse(BaseModel):
    answer: str


app = FastAPI(title="RAG API", version="1.0.0")


def update_pdf_json(pdfs: List[PdfItem]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    payload = {
        "pdfs": [
            {
                "url": pdf.url,
                "title": pdf.title or pdf.url.split("/")[-1],
            }
            for pdf in pdfs
        ]
    }
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def run_loader() -> None:
    try:
        python_executable = os.getenv("PYTHON_EXECUTABLE", "python3")
        loader_script = os.path.join(BASE_DIR, "load_pdf_from_json.py")
        
        subprocess.run(
            [python_executable, loader_script],
            cwd=BASE_DIR,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'indexation des PDFs: {e}",
        )


@app.post("/rag", response_model=AskResponse)
def ask_rag(payload: AskRequest) -> AskResponse:
    if not payload.pdfs:
        raise HTTPException(status_code=400, detail="La liste 'pdfs' ne peut pas être vide.")

    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="La question ne peut pas être vide.")

    update_pdf_json(payload.pdfs)

    run_loader()

    filenames = []
    for pdf in payload.pdfs:
        if '/files/' in pdf.url:
            filename = pdf.url.split("/files/")[-1]
        else:
            filename = pdf.url.split("/")[-1]
        filenames.append(filename)
    
    if len(filenames) == 1:
        filter_dict = {"filename": {"$eq": filenames[0]}}
    else:
        filter_dict = {"$or": [{"filename": {"$eq": fn}} for fn in filenames]}
    
    results = vector_store.similarity_search(
        payload.question,
        k=3,
        filter=filter_dict
    )
    
    if not results:
        results = vector_store.similarity_search(payload.question, k=3)
        if not results:
            return AskResponse(answer="Aucun document pertinent trouvé dans les fichiers spécifiés.")

    context = "\n\n---\n\n".join(doc.page_content for doc in results)
    answer = generate_response(payload.question, context)
    return AskResponse(answer=answer)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )

