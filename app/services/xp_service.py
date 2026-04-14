from sqlalchemy.orm import Session
from app.models.users import User
from app.models.levels import Level

# XP thresholds per level (matches seed data)
LEVEL_XP = {1: 0, 2: 200, 3: 500, 4: 900, 5: 1200, 6: 1600}
MAX_LEVEL = 6


def award_xp(user: User, xp_amount: int, db: Session) -> dict:
    """
    Add XP to user. Check if they should level up.
    Returns info about what changed.
    """
    user.xp += xp_amount
    leveled_up = False
    new_level_name = None

    # Check for level up (don't go beyond max level)
    if user.level < MAX_LEVEL:
        next_level = user.level + 1
        required_xp = LEVEL_XP.get(next_level, 9999)

        if user.xp >= required_xp:
            user.level = next_level
            leveled_up = True
            # Fetch level name for response
            level_obj = db.query(Level).filter(Level.id == next_level).first()
            new_level_name = level_obj.name if level_obj else f"Level {next_level}"

    db.commit()
    db.refresh(user)

    return {
        "xp_earned":      xp_amount,
        "total_xp":       user.xp,
        "level":          user.level,
        "leveled_up":     leveled_up,
        "new_level_name": new_level_name,
    }


def get_xp_to_next_level(user: User) -> int:
    """How many more XP points until next level."""
    if user.level >= MAX_LEVEL:
        return 0
    return max(0, LEVEL_XP[user.level + 1] - user.xp)