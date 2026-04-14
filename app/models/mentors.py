from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Mentor(Base):
    __tablename__ = "mentors"

    # ── Primary key ───────────────────────────────────────────────────────────
    id          = Column(Integer, primary_key=True, index=True)

    # ── Identity ──────────────────────────────────────────────────────────────
    name        = Column(String(100), nullable=False)
    avatar_url  = Column(String(500), nullable=True)    # profile picture URL

    # ── Their skill info ──────────────────────────────────────────────────────
    expertise   = Column(String(255), nullable=False)   # e.g. "Backend, DSA"
    current_level = Column(Integer, default=1)          # 1–6 — where they are now

    # ── Advice they give to juniors ───────────────────────────────────────────
    advice_text = Column(Text, nullable=True)

    # ── Optional contact ──────────────────────────────────────────────────────
    linkedin_url = Column(String(500), nullable=True)
    github_url   = Column(String(500), nullable=True)

    # ── Is this mentor currently active / accepting requests? ─────────────────
    is_active   = Column(Integer, default=1)  # 1 = active, 0 = not available

    def __repr__(self):
        return f"<Mentor id={self.id} name={self.name!r} expertise={self.expertise!r}>"