from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class GeneratedRoadmap(Base):
    """Stores AI-generated roadmaps so users can revisit them."""
    __tablename__ = "generated_roadmaps"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    goal       = Column(String(500), nullable=False)
    roadmap    = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="generated_roadmaps")

    def __repr__(self):
        return f"<GeneratedRoadmap id={self.id} goal='{self.goal}' user_id={self.user_id}>"