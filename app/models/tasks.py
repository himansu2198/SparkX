from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    # ── Primary key ───────────────────────────────────────────────────────────
    id          = Column(Integer, primary_key=True, index=True)

    # ── Which level this task belongs to ─────────────────────────────────────
    level_id    = Column(Integer, ForeignKey("levels.id", ondelete="CASCADE"),
                         nullable=False, index=True)

    # ── Task content ──────────────────────────────────────────────────────────
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # ── Ordering within the level ─────────────────────────────────────────────
    order       = Column(Integer, default=0)

    # ── Gamification ──────────────────────────────────────────────────────────
    xp_reward   = Column(Integer, default=10)       # XP given on completion
    is_optional = Column(Boolean, default=False)    # optional bonus tasks

    # ── Resource link (docs, video, article) ─────────────────────────────────
    resource_url = Column(String(500), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    level       = relationship("Level", back_populates="tasks")
    progress    = relationship("Progress", back_populates="task",
                               cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Task id={self.id} title={self.title!r} xp={self.xp_reward}>"