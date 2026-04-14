from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.levels import Level
from app.schemas.learning import LevelOut
from app.services.auth_utils import get_current_user
from app.models.users import User

router = APIRouter()


# ── GET /levels ───────────────────────────────────────────────────────────────
@router.get("/", response_model=List[LevelOut])
def get_all_levels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all 6 learning levels ordered by sequence."""
    return db.query(Level).order_by(Level.order).all()


# ── GET /levels/{level_id} ────────────────────────────────────────────────────
@router.get("/{level_id}", response_model=LevelOut)
def get_level(
    level_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a single level by ID."""
    from fastapi import HTTPException, status
    level = db.query(Level).filter(Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Level {level_id} not found")
    return level