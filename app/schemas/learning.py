from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Level ─────────────────────────────────────────────────────────────────────
class LevelOut(BaseModel):
    id:          int
    name:        str
    description: Optional[str]
    order:       int
    xp_required: int
    badge_icon:  Optional[str]

    model_config = {"from_attributes": True}


# ── Task ──────────────────────────────────────────────────────────────────────
class TaskOut(BaseModel):
    id:           int
    level_id:     int
    title:        str
    description:  Optional[str]
    order:        int
    xp_reward:    int
    is_optional:  bool
    resource_url: Optional[str]

    model_config = {"from_attributes": True}


# Task with completion status (for authenticated users)
class TaskWithStatus(TaskOut):
    status: str = "pending"   # "pending" | "completed"


# ── Progress ──────────────────────────────────────────────────────────────────
class CompleteTaskRequest(BaseModel):
    task_id: int = Field(..., gt=0)

    model_config = {"json_schema_extra": {"example": {"task_id": 3}}}


class CompleteTaskResponse(BaseModel):
    message:     str
    xp_earned:   int
    total_xp:    int
    level:       int
    leveled_up:  bool
    new_level_name: Optional[str]


class ProgressSummary(BaseModel):
    level_id:         int
    level_name:       str
    total_tasks:      int
    completed_tasks:  int
    percent_complete: float
    xp_earned:        int
    xp_available:     int


# ── Mentor ────────────────────────────────────────────────────────────────────
class MentorOut(BaseModel):
    id:            int
    name:          str
    expertise:     str
    current_level: int
    advice_text:   Optional[str]
    linkedin_url:  Optional[str]
    github_url:    Optional[str]
    avatar_url:    Optional[str]

    model_config = {"from_attributes": True}


# ── Roadmap ───────────────────────────────────────────────────────────────────
class RoadmapStepOut(BaseModel):
    id:               int
    level_id:         int
    step_title:       str
    description:      Optional[str]
    order:            int
    resource_url:     Optional[str]
    resource_type:    Optional[str]
    is_milestone:     bool
    estimated_hours:  Optional[int]

    model_config = {"from_attributes": True}


class RoadmapOut(BaseModel):
    level_id:   int
    level_name: str
    steps:      List[RoadmapStepOut]