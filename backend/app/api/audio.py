import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.core.config import settings
from app.services.stt_service import STTService
from app.services.intent_service import IntentService
from app.services.summary_service import SummaryService
from app.services.suggestion_service import SuggestionService
from app.schemas.schemas import AudioTranscribeResponse, IntentRequest, IntentResponse, SummaryRequest, SummaryResponse, SuggestionResponse

router = APIRouter(tags=["Audio & STT"])

@router.post("/upload-audio", response_model=AudioTranscribeResponse)
async def upload_audio(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.webm', '.ogg', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid audio file format. Allowed formats: MP3, WAV, M4A, WEBM, OGG")

    file_path = os.path.join(settings.UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    res = STTService.process_audio(file_path)
    return {
        "filename": file.filename,
        "transcript": res["transcript"],
        "duration_seconds": res["duration_seconds"]
    }

@router.post("/transcribe")
async def transcribe_audio(file_path: str = Form(...)):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found at path: {file_path}")
    res = STTService.process_audio(file_path)
    return res

@router.post("/intent", response_model=IntentResponse)
def detect_intent(payload: IntentRequest):
    if not payload.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript content cannot be empty.")
    res = IntentService.classify_intent(payload.transcript)
    return res

@router.post("/summary", response_model=SummaryResponse)
def generate_call_summary(payload: SummaryRequest):
    if not payload.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript content cannot be empty.")
    res = SummaryService.generate_summary(payload.transcript, payload.intent or "Interested")
    return res

@router.post("/suggestions", response_model=SuggestionResponse)
def get_sales_suggestions(payload: SummaryRequest):
    res = SuggestionService.get_suggestions(payload.transcript, payload.intent or "Interested")
    return res
