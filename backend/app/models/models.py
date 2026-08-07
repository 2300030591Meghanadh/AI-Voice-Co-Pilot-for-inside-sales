from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="sales_agent")
    created_at = Column(DateTime, default=datetime.utcnow)

    calls = relationship("Call", back_populates="agent")
    followups = relationship("Followup", back_populates="agent")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    interest_status = Column(String(50), default="Pending")  # Interested, Not Interested, Wants Callback, EMI Query, Eligibility Query, KYC Query, Complaint
    kyc_status = Column(String(50), default="Pending")       # Pending, In Review, Approved, Rejected
    call_date = Column(DateTime, nullable=True)
    followup_date = Column(DateTime, nullable=True)
    call_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    calls = relationship("Call", back_populates="customer", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="customer", cascade="all, delete-orphan")


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=True)
    agent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    audio_file_path = Column(String(500), nullable=True)
    duration_seconds = Column(Integer, default=0)
    intent = Column(String(100), nullable=True)
    intent_confidence = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="calls")
    agent = relationship("User", back_populates="calls")
    transcript = relationship("Transcript", uselist=False, back_populates="call", cascade="all, delete-orphan")


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), unique=True)
    full_text = Column(Text, nullable=False)
    speaker_segments = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="transcript")


class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scheduled_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="followups")
    agent = relationship("User", back_populates="followups")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    document_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
