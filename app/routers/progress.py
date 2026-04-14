from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.models.progress import Progress
from app.models.tasks import Task
from app.models.levels import Level
from app.schemas.learning import CompleteTaskRequest, CompleteTaskResponse, ProgressSummary
from app.services.auth_utils import get_current_user
from app.services.xp_service import award_xp
from app.services.streak_service import update_streak
from app.services.email_service import send_streak_broken_email, send_xp_milestone_email
from app.models.users import User

router = APIRouter()

# XP milestones that trigger a level-up email
LEVEL_XP_THRESHOLDS = {2: 200, 3: 500, 4: 900, 5: 1200, 6: 1600}
LEVEL_NAMES = {1:'Basics', 2:'DSA', 3:'Projects', 4:'Resume', 5:'Interview Prep', 6:'Job Apply'}


# ── POST /progress/complete-task ──────────────────────────────────────────────
@router.post("/complete-task", response_model=CompleteTaskResponse)
async def complete_task(
    payload: CompleteTaskRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == payload.task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Already completed?
    existing = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.task_id == payload.task_id,
        Progress.status  == "completed",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Task already completed")

    # Mark complete
    progress_row = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.task_id == payload.task_id,
    ).first()

    if progress_row:
        progress_row.status       = "completed"
        progress_row.completed_at = datetime.now(timezone.utc)
    else:
        progress_row = Progress(
            user_id=current_user.id,
            task_id=payload.task_id,
            status="completed",
            completed_at=datetime.now(timezone.utc),
        )
        db.add(progress_row)
    db.flush()

    # Update streak (async — handles date comparison)
    streak_result = await update_streak(current_user, db)

    # If streak broke → send warning email in background
    if streak_result["streak_broken"] and streak_result["prev_streak"] >= 3:
        background_tasks.add_task(
            send_streak_broken_email,
            current_user.email,
            current_user.name,
            streak_result["prev_streak"],
        )

    # Award XP + check level-up
    xp_result = award_xp(current_user, task.xp_reward, db)

    # If leveled up → send email in background
    if xp_result["leveled_up"]:
        background_tasks.add_task(
            send_xp_milestone_email,
            current_user.email,
            current_user.name,
            xp_result["total_xp"],
            xp_result["new_level_name"] or LEVEL_NAMES.get(current_user.level, ""),
        )

    return CompleteTaskResponse(
        message="Task completed! 🎉",
        **xp_result,
    )


# ── GET /progress ─────────────────────────────────────────────────────────────
@router.get("/", response_model=List[ProgressSummary])
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    levels  = db.query(Level).order_by(Level.order).all()
    result  = []

    for level in levels:
        tasks = db.query(Task).filter(Task.level_id == level.id).all()
        total = len(tasks)
        if total == 0:
            continue

        task_ids = [t.id for t in tasks]

        completed = (
            db.query(func.count(Progress.id))
            .filter(
                Progress.user_id == current_user.id,
                Progress.task_id.in_(task_ids),
                Progress.status  == "completed",
            )
            .scalar()
        )

        completed_task_ids = {
            row.task_id for row in db.query(Progress.task_id)
            .filter(
                Progress.user_id == current_user.id,
                Progress.task_id.in_(task_ids),
                Progress.status  == "completed",
            ).all()
        }

        xp_earned    = sum(t.xp_reward for t in tasks if t.id in completed_task_ids)
        xp_available = sum(t.xp_reward for t in tasks)

        result.append(ProgressSummary(
            level_id=level.id,
            level_name=level.name,
            total_tasks=total,
            completed_tasks=completed,
            percent_complete=round((completed / total) * 100, 1),
            xp_earned=xp_earned,
            xp_available=xp_available,
        ))

    return result