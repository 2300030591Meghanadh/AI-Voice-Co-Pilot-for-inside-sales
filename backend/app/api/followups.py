from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models.db import get_db
from app.models.models import Followup, Customer
from app.schemas.schemas import FollowupCreate, FollowupResponse

router = APIRouter(tags=["Follow-ups"])

@router.get("/followups", response_model=List[FollowupResponse])
def get_followups(db: Session = Depends(get_db)):
    results = db.query(Followup).order_by(Followup.scheduled_date.asc()).all()
    out = []
    for f in results:
        cust = db.query(Customer).filter(Customer.id == f.customer_id).first()
        out.append({
            "id": f.id,
            "customer_id": f.customer_id,
            "customer_name": cust.name if cust else "Unknown Customer",
            "scheduled_date": f.scheduled_date,
            "notes": f.notes,
            "status": f.status,
            "created_at": f.created_at
        })
    
    # Seed dummy followups if empty
    if not out:
        c = db.query(Customer).first()
        if c:
            f1 = Followup(customer_id=c.id, scheduled_date=datetime.now(), notes="Callback regarding eligibility and salary slip verification", status="Pending")
            db.add(f1)
            db.commit()
            db.refresh(f1)
            out.append({
                "id": f1.id,
                "customer_id": f1.customer_id,
                "customer_name": c.name,
                "scheduled_date": f1.scheduled_date,
                "notes": f1.notes,
                "status": f1.status,
                "created_at": f1.created_at
            })
    return out

@router.post("/followups", response_model=FollowupResponse)
def create_followup(payload: FollowupCreate, db: Session = Depends(get_db)):
    sched_dt = payload.scheduled_date.replace(tzinfo=None) if payload.scheduled_date else datetime.utcnow()
    f = Followup(
        customer_id=payload.customer_id,
        scheduled_date=sched_dt,
        notes=payload.notes,
        status="Pending"
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    cust = db.query(Customer).filter(Customer.id == f.customer_id).first()
    return {
        "id": f.id,
        "customer_id": f.customer_id,
        "customer_name": cust.name if cust else "Unknown Customer",
        "scheduled_date": f.scheduled_date,
        "notes": f.notes,
        "status": f.status,
        "created_at": f.created_at
    }

@router.put("/followups/{followup_id}/toggle-status")
def toggle_followup_status(followup_id: int, db: Session = Depends(get_db)):
    f = db.query(Followup).filter(Followup.id == followup_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    f.status = "Completed" if f.status == "Pending" else "Pending"
    db.commit()
    return {"id": f.id, "status": f.status}
