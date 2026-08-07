from fastapi import APIRouter, HTTPException
from app.schemas.schemas import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import rag_service

router = APIRouter(tags=["RAG Q&A"])

@router.post("/rag", response_model=RAGQueryResponse)
def perform_rag_query(payload: RAGQueryRequest):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question prompt cannot be empty.")
    
    res = rag_service.query(payload.question, top_k=payload.top_k or 3)
    return res
