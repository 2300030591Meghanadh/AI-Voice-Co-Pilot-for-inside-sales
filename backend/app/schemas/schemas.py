from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: Optional[str] = "sales_agent"

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    phone: str
    email: str
    interest_status: Optional[str] = "Pending"
    kyc_status: Optional[str] = "Pending"
    call_date: Optional[datetime] = None
    followup_date: Optional[datetime] = None
    call_summary: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    interest_status: Optional[str] = None
    kyc_status: Optional[str] = None
    call_date: Optional[datetime] = None
    followup_date: Optional[datetime] = None
    call_summary: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Speech-to-text / Audio Schemas
class AudioTranscribeResponse(BaseModel):
    filename: str
    transcript: str
    duration_seconds: float

# Intent Schemas
class IntentRequest(BaseModel):
    transcript: str

class IntentResponse(BaseModel):
    intent: str
    confidence: float
    analysis: str

# RAG Schemas
class RAGQueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 3

class RAGQueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[str]
    context_retrieved: bool

# Call Summary & AI Suggestions Schemas
class SummaryRequest(BaseModel):
    transcript: str
    intent: Optional[str] = None

class SummaryResponse(BaseModel):
    customer_intent: str
    key_discussion_points: List[str]
    next_best_action: str
    follow_up_recommendation: str
    summary_text: str

class SuggestionResponse(BaseModel):
    suggestions: List[str]
    talking_points: List[str]

# CRM Auto Save Schema
class CRMSaveRequest(BaseModel):
    customer_id: Optional[int] = None
    customer_name: str
    phone: str
    email: str
    transcript: str
    summary: str
    intent: str
    followup_date: Optional[datetime] = None
    interest_status: str
    kyc_status: Optional[str] = "Pending"

# Followup Schemas
class FollowupCreate(BaseModel):
    customer_id: int
    scheduled_date: datetime
    notes: Optional[str] = None

class FollowupResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    scheduled_date: datetime
    notes: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
