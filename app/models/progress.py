from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Progress(Base):
    __tablename__ = "progress"

    # ── Composite primary key via unique constraint ────────────────────────────
    id           = Column(Integer, primary_key=True, index=True)

    # ── Foreign keys ──────────────────────────────────────────────────────────
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                          nullable=False, index=True)
    task_id      = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"),
                          nullable=False, index=True)

    # ── Status: "pending" | "completed" ──────────────────────────────────────
    status       = Column(String(20), default="pending", nullable=False)

    # ── Timestamps ────────────────────────────────────────────────────────────
    started_at   = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # ── Prevent duplicate progress rows for same user+task ───────────────────
    __table_args__ = (
        UniqueConstraint("user_id", "task_id", name="uq_user_task"),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user         = relationship("User", back_populates="progress")
    task         = relationship("Task", back_populates="progress")

    def __repr__(self):
        return f"<Progress user={self.user_id} task={self.task_id} status={self.status!r}>"