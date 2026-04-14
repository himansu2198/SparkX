from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)

    # Identity
    name         = Column(String(100), nullable=False)
    email        = Column(String(255), unique=True, index=True, nullable=False)
    password     = Column(String(255), nullable=False)

    # College
    college_name = Column(String(255), nullable=True)
    college_id   = Column(Integer, nullable=True, index=True)

    # Gamification
    level          = Column(Integer, default=1)
    xp             = Column(Integer, default=0)
    streak         = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)

    # ── NEW: Streak logic fields ──────────────────────────────────────────────
    # last_active_date stores the DATE (not datetime) of last task completion
    # Used to compare "was yesterday" vs "was today" vs "missed days"
    last_active_date = Column(Date, nullable=True)
    current_streak   = Column(Integer, default=0)

    # ── NEW: Password reset fields ────────────────────────────────────────────
    reset_token        = Column(String(255), nullable=True, index=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    last_active  = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    # State
    is_active    = Column(Boolean, default=True)

    # Relationships
    progress     = relationship("Progress", back_populates="user",
                                cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} name={self.name!r} level={self.level} xp={self.xp}>"