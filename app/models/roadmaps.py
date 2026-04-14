from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    # ── Primary key ───────────────────────────────────────────────────────────
    id          = Column(Integer, primary_key=True, index=True)

    # ── Which level this step belongs to ─────────────────────────────────────
    level_id    = Column(Integer, ForeignKey("levels.id", ondelete="CASCADE"),
                         nullable=False, index=True)

    # ── Step content ──────────────────────────────────────────────────────────
    step_title  = Column(String(255), nullable=False)   # e.g. "Learn Python basics"
    description = Column(Text, nullable=True)           # detailed explanation

    # ── Display order inside the level ───────────────────────────────────────
    order       = Column(Integer, default=0)

    # ── Resource (doc/video/article) ─────────────────────────────────────────
    resource_url  = Column(String(500), nullable=True)
    resource_type = Column(String(50),  nullable=True)  # "video" | "article" | "doc"

    # ── Is this step completed by default? (unlocking logic) ─────────────────
    is_milestone  = Column(Boolean, default=False)      # major checkpoint step

    # ── Estimated hours to complete ───────────────────────────────────────────
    estimated_hours = Column(Integer, nullable=True)

    # ── Relationship ──────────────────────────────────────────────────────────
    level       = relationship("Level", back_populates="roadmap_steps")

    def __repr__(self):
        return f"<Roadmap id={self.id} level={self.level_id} step={self.step_title!r}>"