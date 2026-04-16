"""
pathforge.py — PathForge AI Roadmap Router
POST /pathforge/generate  → generate + optionally save
GET  /pathforge/history   → user's saved roadmaps
GET  /pathforge/{id}      → single saved roadmap
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.users import User
from app.models.pathforge import GeneratedRoadmap
from app.services.auth_utils import get_current_user
from app.services.pathforge_service import generate_roadmap_sync
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    goal:       str  = Field(..., min_length=3, max_length=300)
    user_level: str  = Field(default="beginner")
    save:       bool = Field(default=True)

    model_config = {"json_schema_extra": {"example": {
        "goal": "Become a Backend Developer",
        "user_level": "beginner",
        "save": True
    }}}


class RoadmapHistoryItem(BaseModel):
    id:         int
    goal:       str
    created_at: datetime
    total_xp:   Optional[int] = None

    model_config = {"from_attributes": True}


# ── POST /pathforge/generate ──────────────────────────────────────────────────

@router.post("/generate")
def generate(
    payload: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI-powered learning roadmap."""

    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PathForge is not configured. Add GEMINI_API_KEY to .env "
                   "(FREE at https://aistudio.google.com/apikey)",
        )

    # ── Call AI — NO silent fallback ──
    try:
        logger.info(
            "📨 PathForge request | User: %s | Goal: '%s' | Level: '%s'",
            current_user.id, payload.goal, payload.user_level,
        )
        roadmap_data = generate_roadmap_sync(payload.goal, payload.user_level)
    except ValueError as e:
        logger.error("❌ PathForge ValueError: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        logger.error("❌ PathForge unexpected error: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}. Please try again.",
        )

    # ── Verify we got real data ──
    if not roadmap_data.get("levels"):
        logger.error("❌ PathForge returned 0 levels for goal: '%s'", payload.goal)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI generated an empty roadmap. Please try again with a different goal.",
        )

    # ── Save to DB ──
    saved_id = None
    if payload.save:
        record = GeneratedRoadmap(
            user_id=current_user.id,
            goal=payload.goal,
            roadmap=roadmap_data,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        saved_id = record.id
        logger.info("💾 Roadmap saved | ID: %d | Levels: %d", saved_id, len(roadmap_data["levels"]))

    return {
        "id": saved_id,
        "roadmap": roadmap_data,
        "saved": payload.save,
    }


# ── GET /pathforge/history ────────────────────────────────────────────────────

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's saved roadmap history."""

    records = (
        db.query(GeneratedRoadmap)
        .filter(GeneratedRoadmap.user_id == current_user.id)
        .order_by(GeneratedRoadmap.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id":          r.id,
            "goal":        r.goal,
            "created_at":  r.created_at,
            "total_xp":    r.roadmap.get("total_xp", 0) if r.roadmap else 0,
            "level_count": len(r.roadmap.get("levels", [])) if r.roadmap else 0,
        }
        for r in records
    ]


# ── GET /pathforge/{roadmap_id} ───────────────────────────────────────────────

@router.get("/{roadmap_id}")
def get_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific saved roadmap."""

    record = db.query(GeneratedRoadmap).filter(
        GeneratedRoadmap.id == roadmap_id,
        GeneratedRoadmap.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    return {
        "id":         record.id,
        "goal":       record.goal,
        "roadmap":    record.roadmap,
        "created_at": record.created_at,
    }