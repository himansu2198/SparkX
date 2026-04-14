from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.roadmaps import Roadmap
from app.models.levels import Level
from app.schemas.learning import RoadmapOut
from app.services.auth_utils import get_current_user
from app.models.users import User

router = APIRouter()


# ── GET /roadmap/{level_id} ───────────────────────────────────────────────────
@router.get("/{level_id}", response_model=RoadmapOut)
def get_roadmap(
    level_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all step-by-step roadmap items for a given level.
    This tells the user exactly what to learn next.
    """
    level = db.query(Level).filter(Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Level {level_id} not found")

    steps = (
        db.query(Roadmap)
        .filter(Roadmap.level_id == level_id)
        .order_by(Roadmap.order)
        .all()
    )

    return RoadmapOut(
        level_id=level.id,
        level_name=level.name,
        steps=steps,
    )