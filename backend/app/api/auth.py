from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, SignupRequest, Token
from app.core.security import verify_password, create_access_token, get_password_hash

router = APIRouter(tags=["Authentication"])

@router.post("/signup", response_model=Token)
def signup(signup_data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == signup_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please login."
        )

    new_user = User(
        email=signup_data.email,
        password_hash=get_password_hash(signup_data.password),
        full_name=signup_data.full_name,
        role=signup_data.role or "sales_agent"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "user_id": new_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }

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
