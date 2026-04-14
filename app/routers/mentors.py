from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.mentors import Mentor
from app.schemas.learning import MentorOut
from app.services.auth_utils import get_current_user
from app.models.users import User

router = APIRouter()


# ── GET /mentors ──────────────────────────────────────────────────────────────
@router.get("/", response_model=List[MentorOut])
def get_mentors(
    level: Optional[int] = Query(default=None,
                                 description="Filter by mentor's current level"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return list of senior mentors.
    Optional ?level=X to filter by their current level.
    """
    query = db.query(Mentor).filter(Mentor.is_active == 1)
    if level is not None:
        query = query.filter(Mentor.current_level == level)
    return query.order_by(Mentor.current_level.desc()).all()