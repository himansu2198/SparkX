from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Level(Base):
    __tablename__ = "levels"

    # ── Primary key ───────────────────────────────────────────────────────────
    id          = Column(Integer, primary_key=True, index=True)

    # ── Level identity ────────────────────────────────────────────────────────
    name        = Column(String(100), nullable=False)       # e.g. "Basics"
    description = Column(Text, nullable=True)               # longer explanation
    order       = Column(Integer, nullable=False, unique=True)  # display order

    # ── XP threshold to reach this level ─────────────────────────────────────
    xp_required = Column(Integer, default=0)

    # ── Badge / icon name (used by frontend) ─────────────────────────────────
    badge_icon  = Column(String(50), nullable=True)         # e.g. "rocket"

    # ── Relationships ─────────────────────────────────────────────────────────
    tasks       = relationship("Task",    back_populates="level",
                               cascade="all, delete-orphan")
    roadmap_steps = relationship("Roadmap", back_populates="level",
                                 cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Level id={self.id} name={self.name!r} order={self.order}>"