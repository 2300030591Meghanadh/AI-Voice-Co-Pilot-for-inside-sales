import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.rag_service import rag_service
from app.models.db import get_db
from app.models.models import Product

router = APIRouter(tags=["Knowledge Base"])

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF or TXT documents are allowed for knowledge base indexing.")

    doc_path = os.path.join(settings.KNOWLEDGE_BASE_DIR, file.filename)
    with open(doc_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Re-initialize vector store index
    try:
        rag_service.initialize_vector_store()
    except Exception as e:
        print(f"Vector store indexing notice: {e}")

    # Track in DB
    try:
        prod = db.query(Product).filter(Product.code == "PAY_IN_3_EMI").first()
        if not prod:
            prod = Product(
                name="Pay-in-3 Zero-Cost EMI",
                code="PAY_IN_3_EMI",
                description="Official Product Document Knowledge Base",
                document_path=doc_path
            )
            db.add(prod)
            db.commit()
    except Exception as db_err:
        print(f"DB tracking notice: {db_err}")

    return {
        "message": f"Successfully uploaded and indexed document '{file.filename}' into FAISS vector database.",
        "filename": file.filename,
        "path": doc_path
    }

@router.get("/documents")
def list_documents():
    kb_dir = settings.KNOWLEDGE_BASE_DIR
    files = []
    if os.path.exists(kb_dir):
        for f in os.listdir(kb_dir):
            fpath = os.path.join(kb_dir, f)
            size_kb = round(os.path.getsize(fpath) / 1024.0, 1)
            files.append({
                "name": f,
                "size": f"{size_kb} KB",
                "type": "PDF" if f.endswith(".pdf") else "TXT",
                "path": fpath
            })
    return files
