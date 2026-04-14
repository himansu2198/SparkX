from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.users import User
from app.schemas.user import LeaderboardEntry
from app.services.auth_utils import get_current_user

router = APIRouter()


# ── GET /leaderboard — unified endpoint with type filter ──────────────────────
@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(
    type: str = Query(default="global", regex="^(global|college|level)$",
                      description="Filter type: global | college | level"),
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Leaderboard with 3 filter modes:
      - global  → all users sorted by XP
      - college → same college_name as current user
      - level   → same level as current user
    """
    query = db.query(User).filter(User.is_active == True)

    if type == "college":
        if current_user.college_name:
            query = query.filter(User.college_name == current_user.college_name)
        else:
            # User has no college — return only them
            query = query.filter(User.id == current_user.id)

    elif type == "level":
        query = query.filter(User.level == current_user.level)

    users = query.order_by(User.xp.desc()).limit(limit).all()

    result = []
    for rank, user in enumerate(users, start=1):
        result.append(LeaderboardEntry(
            rank=rank,
            id=user.id,
            name=user.name,
            level=user.level,
            xp=user.xp,
            streak=user.streak,
            college_name=user.college_name,
        ))
    return result


# ── KEEP: backward compatible same-level endpoint ─────────────────────────────
@router.get("/same-level", response_model=List[LeaderboardEntry])
def get_same_level_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all users at the same level as the current user, ranked by XP.
    Kept for backward compatibility.
    """
    users = (
        db.query(User)
        .filter(User.level == current_user.level, User.is_active == True)
        .order_by(User.xp.desc())
        .all()
    )

    result = []
    for rank, user in enumerate(users, start=1):
        result.append(LeaderboardEntry(
            rank=rank,
            id=user.id,
            name=user.name,
            level=user.level,
            xp=user.xp,
            streak=user.streak,
            college_name=user.college_name,
        ))
    return result