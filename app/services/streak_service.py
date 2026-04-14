"""
streak_service.py
─────────────────
Correct streak logic:
- Same day → no change (already active today)
- Next day → increment streak
- Gap > 1 day → reset to 1 + fire streak broken email
"""

from datetime import datetime, timezone, timedelta, date
from sqlalchemy.orm import Session
from app.models.users import User
import logging

logger = logging.getLogger(__name__)


async def update_streak(user: User, db: Session) -> dict:
    """
    Call after every task completion.
    Uses last_active_date (DATE only, no time) for accurate day comparison.
    Returns dict with streak info and whether it was broken.
    """
    today = datetime.now(timezone.utc).date()
    prev_streak = user.streak

    if user.last_active_date is None:
        # First ever activity
        user.streak         = 1
        user.current_streak = 1
        streak_broken       = False

    else:
        last_date = user.last_active_date
        # last_active_date might be a date or datetime — normalise
        if hasattr(last_date, 'date'):
            last_date = last_date.date()

        diff = (today - last_date).days

        if diff == 0:
            # Already completed a task today — no change
            streak_broken = False
        elif diff == 1:
            # Completed yesterday → keep streak going
            user.streak         += 1
            user.current_streak  = user.streak
            streak_broken        = False
        else:
            # Missed one or more days → reset
            streak_broken        = True
            user.streak          = 1
            user.current_streak  = 1

    # Update personal best
    if user.streak > user.longest_streak:
        user.longest_streak = user.streak

    # Always update last_active_date to today
    user.last_active_date = today
    user.last_active      = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    return {
        "streak":       user.streak,
        "streak_broken": streak_broken,
        "prev_streak":  prev_streak,
    }