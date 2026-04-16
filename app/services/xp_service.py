from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.users import User
from app.models.levels import Level
from app.models.tasks import Task
from app.models.progress import Progress
import logging

logger = logging.getLogger(__name__)

LEVEL_XP = {1: 0, 2: 200, 3: 500, 4: 900, 5: 1200, 6: 1600}
MAX_LEVEL = 6


def check_level_completion(user: User, db: Session) -> dict:
    """
    Check if user completed all REQUIRED tasks in their current level.
    Uses Level.order == user.level to find current level.
    Excludes optional tasks from completion check.
    """
    if user.level >= MAX_LEVEL:
        return {"leveled_up": False, "new_level_name": None}

    # Find Level row where order == user.level
    current_level_obj = db.query(Level).filter(
        Level.order == user.level
    ).first()

    if not current_level_obj:
        logger.error("❌ No Level found with order=%s", user.level)
        return {"leveled_up": False, "new_level_name": None}

    logger.info("🔍 Checking | user.level=%s | level_id=%s | level_name=%s",
                user.level, current_level_obj.id, current_level_obj.name)

    # Count only REQUIRED tasks (is_optional=False)
    required_task_ids = [
        row.id for row in db.query(Task.id).filter(
            Task.level_id    == current_level_obj.id,
            Task.is_optional == False,
        ).all()
    ]

    total_required = len(required_task_ids)

    if total_required == 0:
        logger.warning("⚠️ Level %s has no required tasks", current_level_obj.name)
        return {"leveled_up": False, "new_level_name": None}

    completed_count = db.query(func.count(Progress.id)).filter(
        Progress.user_id == user.id,
        Progress.task_id.in_(required_task_ids),
        Progress.status  == "completed",
    ).scalar()

    logger.info("📊 '%s' | required=%s | completed=%s",
                current_level_obj.name, total_required, completed_count)

    if completed_count < total_required:
        return {"leveled_up": False, "new_level_name": None}

    # All required tasks done → increment level
    old_level  = user.level
    user.level = user.level + 1

    next_level_obj = db.query(Level).filter(Level.order == user.level).first()
    new_level_name = next_level_obj.name if next_level_obj else f"Level {user.level}"

    logger.info("🎉 LEVEL UP | user_id=%s | %s → %s (%s)",
                user.id, old_level, user.level, new_level_name)

    return {"leveled_up": True, "new_level_name": new_level_name}


def award_xp(user: User, xp_amount: int, db: Session) -> dict:
    """Add XP then check task-completion based level up."""
    user.xp += xp_amount

    level_result   = check_level_completion(user, db)
    leveled_up     = level_result["leveled_up"]
    new_level_name = level_result["new_level_name"]

    db.commit()
    db.refresh(user)

    logger.info("✅ XP | user_id=%s | +%s | total=%s | level=%s | up=%s",
                user.id, xp_amount, user.xp, user.level, leveled_up)

    return {
        "xp_earned":      xp_amount,
        "total_xp":       user.xp,
        "level":          user.level,
        "leveled_up":     leveled_up,
        "new_level_name": new_level_name,
    }


def get_xp_to_next_level(user: User) -> int:
    if user.level >= MAX_LEVEL:
        return 0
    return max(0, LEVEL_XP.get(user.level + 1, 9999) - user.xp)