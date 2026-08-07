from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.db import get_db
from app.models.models import Customer, Call, Transcript, Followup
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerResponse, CRMSaveRequest

router = APIRouter(tags=["CRM & Customers"])

@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).order_by(Customer.created_at.desc()).all()
    # If DB is empty, seed dummy customers
    if not customers:
        seed_customers = [
            Customer(name="Rahul Sharma", phone="+91 9876543210", email="rahul.sharma@example.com", interest_status="Interested", kyc_status="Approved", call_date=datetime.now(), followup_date=datetime.now(), call_summary="Customer expressed high interest in 3-month zero cost EMI for smartphone."),
            Customer(name="Priya Patel", phone="+91 9812345678", email="priya.patel@example.com", interest_status="Wants Callback", kyc_status="Pending", call_date=datetime.now(), followup_date=datetime.now(), call_summary="Requested callback tomorrow to discuss eligibility rules."),
            Customer(name="Amit Kumar", phone="+91 9765432109", email="amit.k@example.com", interest_status="EMI Query", kyc_status="In Review", call_date=datetime.now(), followup_date=datetime.now(), call_summary="Asked if zero cost EMI has any hidden processing charges."),
            Customer(name="Ananya Gupta", phone="+91 9988776655", email="ananya.g@example.com", interest_status="Eligibility Query", kyc_status="Pending", call_date=datetime.now(), followup_date=datetime.now(), call_summary="Inquired about minimum salary requirements."),
            Customer(name="Vikram Singh", phone="+91 9845012345", email="vikram.singh@example.com", interest_status="Not Interested", kyc_status="Rejected", call_date=datetime.now(), call_summary="Prefers single credit card payment.")
        ]
        db.add_all(seed_customers)
        db.commit()
        customers = db.query(Customer).order_by(Customer.created_at.desc()).all()
    return customers

@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer_by_id(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust

@router.post("/customers", response_model=CustomerResponse)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    now = datetime.utcnow()
    if not data.get("call_date"):
        data["call_date"] = now
    data["created_at"] = now
    data["updated_at"] = now

    existing = db.query(Customer).filter(Customer.email == payload.email).first()
    if existing:
        existing.name = payload.name
        existing.phone = payload.phone
        existing.interest_status = payload.interest_status
        if payload.kyc_status:
            existing.kyc_status = payload.kyc_status
        if payload.call_summary:
            existing.call_summary = payload.call_summary
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return existing

    cust = Customer(**data)
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cust, key, value)
    
    cust.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(cust)
    return cust

@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(cust)
    db.commit()
    return {"message": "Customer deleted successfully"}

@router.post("/crm/save")
def auto_save_to_crm(payload: CRMSaveRequest, db: Session = Depends(get_db)):
    """
    Automated CRM Update post call:
    1. Updates or creates Customer record.
    2. Logs Call record.
    3. Saves Transcript.
    4. Automatically creates Followup task if followup_date provided.
    """
    followup_dt = payload.followup_date.replace(tzinfo=None) if payload.followup_date else None

    customer = None
    if payload.customer_id:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()

    if not customer:
        customer = db.query(Customer).filter(Customer.email == payload.email).first()

    if not customer:
        customer = Customer(
            name=payload.customer_name,
            phone=payload.phone,
            email=payload.email,
            interest_status=payload.interest_status,
            kyc_status=payload.kyc_status or "Pending",
            call_date=datetime.utcnow(),
            followup_date=followup_dt,
            call_summary=payload.summary
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    else:
        customer.name = payload.customer_name
        customer.phone = payload.phone
        customer.interest_status = payload.interest_status
        if payload.kyc_status:
            customer.kyc_status = payload.kyc_status
        customer.call_date = datetime.utcnow()
        customer.followup_date = followup_dt
        customer.call_summary = payload.summary
        customer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(customer)

    # Log Call
    new_call = Call(
        customer_id=customer.id,
        duration_seconds=45,
        intent=payload.intent,
        intent_confidence=0.92,
        summary=payload.summary
    )
    db.add(new_call)
    db.commit()
    db.refresh(new_call)

    # Save Transcript
    transcript_record = Transcript(
        call_id=new_call.id,
        full_text=payload.transcript
    )
    db.add(transcript_record)
    db.commit()

    # Create Followup reminder if specified
    if followup_dt:
        followup = Followup(
            customer_id=customer.id,
            scheduled_date=followup_dt,
            notes=f"Auto-generated callback for {customer.name} (Intent: {payload.intent})",
            status="Pending"
        )
        db.add(followup)
        db.commit()

    return {
        "status": "success",
        "message": f"Successfully updated CRM for customer '{customer.name}'.",
        "customer_id": customer.id,
        "call_id": new_call.id
    }
