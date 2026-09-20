import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("analysis_results.id", ondelete="SET NULL"), nullable=True)
    target_role = Column(String, nullable=False)
    skill_gaps = Column(JSON, nullable=False)   # list of skill strings
    roadmap_data = Column(JSON, nullable=False) # {title, summary, estimated_weeks, phases: [...]}
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user = relationship("User", back_populates="roadmaps")
    analysis = relationship("AnalysisResult", back_populates="roadmaps")
