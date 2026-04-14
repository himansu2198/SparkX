import secrets
import hashlib
import bcrypt
import logging
from datetime import timezone, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.database import get_db
from app.models.users import User
from app.schemas.user import (
    UserCreate, UserLogin, Token, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.services.auth_utils import create_access_token, get_current_user
from app.services.email_service import (
    send_welcome_email,
    send_reset_password_email,
)

logger = logging.getLogger(__name__)
router = APIRouter()

RESET_TOKEN_EXPIRE_MINUTES = 30


# ── Password helpers ──────────────────────────────────────────────────────────
def _prepare(plain: str) -> bytes:
    return hashlib.sha256(plain.encode("utf-8")).hexdigest().encode("utf-8")

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_prepare(plain), bcrypt.gensalt(rounds=12)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(plain), hashed.encode("utf-8"))
    except Exception:
        return False


# ── POST /auth/signup ─────────────────────────────────────────────────────────
@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(
    payload: UserCreate,
    db: Session = Depends(get_db),
):
    try:
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please login instead.",
            )

        user = User(
            name=payload.name,
            email=payload.email,
            password=hash_password(payload.password),
            college_name=payload.college_name,
            level=1, xp=0, streak=0,
            last_active=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("New user signed up: %s (id=%s)", user.email, user.id)

        # ✅ Fire-and-forget — sends in background thread, returns IMMEDIATELY
        send_welcome_email(user.email, user.name)

        return user

    except HTTPException:
        raise
    except OperationalError as e:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable.")
    except Exception as e:
        db.rollback()
        logger.error("Signup error: %s", e)
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == payload.email).first()

        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive.",
            )

        token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}

    except HTTPException:
        raise
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


# ── GET /auth/me ──────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ── POST /auth/forgot-password ────────────────────────────────────────────────
@router.post("/forgot-password", status_code=200)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Always returns 200 even if email not found — prevents email enumeration.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if user and user.is_active:
        raw_token    = secrets.token_urlsafe(48)
        hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()

        user.reset_token        = hashed_token
        user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(
            minutes=RESET_TOKEN_EXPIRE_MINUTES
        )
        db.commit()

        # ✅ Fire-and-forget — sends in background thread, returns IMMEDIATELY
        send_reset_password_email(user.email, user.name, raw_token)

        logger.info("Password reset requested for: %s", user.email)

    return {"message": "If this email is registered, a reset link has been sent."}


# ── POST /auth/reset-password ─────────────────────────────────────────────────
@router.post("/reset-password", status_code=200)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    hashed_token = hashlib.sha256(payload.token.encode()).hexdigest()

    user = db.query(User).filter(
        User.reset_token == hashed_token
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link. Please request a new one.",
        )

    if user.reset_token_expiry is None:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    expiry = user.reset_token_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expiry:
        user.reset_token        = None
        user.reset_token_expiry = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link has expired (30 min limit). Please request a new one.",
        )

    user.password           = hash_password(payload.new_password)
    user.reset_token        = None
    user.reset_token_expiry = None
    db.commit()

    logger.info("Password reset successful for: %s", user.email)
    return {"message": "Password updated successfully. You can now login."}