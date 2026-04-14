from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.tasks import Task
from app.models.progress import Progress
from app.schemas.learning import TaskWithStatus
from app.services.auth_utils import get_current_user
from app.models.users import User

router = APIRouter()


# ── GET /tasks/{level_id} ─────────────────────────────────────────────────────
@router.get("/{level_id}", response_model=List[TaskWithStatus])
def get_tasks_for_level(
    level_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all tasks for a given level, with the current user's
    completion status (pending / completed) for each task.
    """
    tasks = (
        db.query(Task)
        .filter(Task.level_id == level_id)
        .order_by(Task.order)
        .all()
    )
    if not tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No tasks found for level {level_id}",
        )

    # Fetch this user's completed task IDs for this level in one query
    completed_ids = {
        row.task_id
        for row in db.query(Progress.task_id)
        .filter(
            Progress.user_id == current_user.id,
            Progress.status == "completed",
        )
        .all()
    }

    # Merge status into each task
    result = []
    for task in tasks:
        task_dict = {
            "id":           task.id,
            "level_id":     task.level_id,
            "title":        task.title,
            "description":  task.description,
            "order":        task.order,
            "xp_reward":    task.xp_reward,
            "is_optional":  task.is_optional,
            "resource_url": task.resource_url,
            "status":       "completed" if task.id in completed_ids else "pending",
        }
        result.append(TaskWithStatus(**task_dict))

    return result