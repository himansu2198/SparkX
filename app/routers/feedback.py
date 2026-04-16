import logging
import random
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.database import get_db
from app.models.users import User
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.services.auth_utils import get_current_user
from app.services.email_service import send_admin_feedback_email

logger = logging.getLogger(__name__)
router = APIRouter()


# ── POST /feedback — submit feedback (authenticated) ──────────────────────────
@router.post("/", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        existing = db.query(Feedback).filter(
            Feedback.user_id == current_user.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted feedback. Thank you!",
            )

        feedback = Feedback(
            user_id=current_user.id,
            message=payload.message,
            rating=payload.rating,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        logger.info("Feedback submitted by user %s (rating=%d)", current_user.email, payload.rating)

        send_admin_feedback_email(
            current_user.name,
            current_user.email,
            payload.message,
            payload.rating,
        )

        return FeedbackOut(
            id=feedback.id,
            message=feedback.message,
            rating=feedback.rating,
            user_name=current_user.name or "Anonymous",   # FIX: safe fallback
            created_at=feedback.created_at,
        )

    except HTTPException:
        raise
    except OperationalError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable.")
    except Exception as e:
        db.rollback()
        logger.error("Feedback error: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")


# ── GET /feedback — public top feedback (no auth) ─────────────────────────────
@router.get("/", response_model=List[FeedbackOut])
def get_top_feedback(
    limit: int = Query(default=6, le=20),
    db: Session = Depends(get_db),
):
    try:
        rows = (
            db.query(Feedback, User.name)
            .join(User, Feedback.user_id == User.id)
            .filter(Feedback.rating >= 4)
            .all()
        )

        random.shuffle(rows)
        rows = rows[:limit]

        return [
            FeedbackOut(
                id=fb.id,
                message=fb.message,
                rating=fb.rating,
                user_name=user_name or "Anonymous",   # FIX: safe fallback
                created_at=fb.created_at,
            )
            for fb, user_name in rows
        ]

    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    except Exception as e:
        logger.error("Get feedback error: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to load feedback: {str(e)}")


# ── GET /feedback/all — paginated (no auth) ───────────────────────────────────
@router.get("/all", response_model=List[FeedbackOut])
def get_all_feedback(
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        rows = (
            db.query(Feedback, User.name)
            .join(User, Feedback.user_id == User.id)
            .filter(Feedback.rating >= 4)
            .order_by(Feedback.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        return [
            FeedbackOut(
                id=fb.id,
                message=fb.message,
                rating=fb.rating,
                user_name=user_name or "Anonymous",   # FIX: safe fallback
                created_at=fb.created_at,
            )
            for fb, user_name in rows
        ]

    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    except Exception as e:
        logger.error("Get all feedback error: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to load feedback: {str(e)}")