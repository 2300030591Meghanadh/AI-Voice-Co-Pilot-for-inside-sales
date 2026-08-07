from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, Token
from app.core.security import verify_password, create_access_token, get_password_hash

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Auto-seed demo agent if db is empty or user not found
    if not user and login_data.email == "agent@affordai.com":
        user = User(
            email="agent@affordai.com",
            password_hash=get_password_hash("password123"),
            full_name="Alex Mercer (Sales Lead)",
            role="sales_agent"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }
