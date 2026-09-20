import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True)
    
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    
    overall_score = Column(Float, nullable=False)
    scores_breakdown = Column(JSON, nullable=False)  # {hard_skills, keyword_relevance, ats_readability, experience_alignment}
    matched_skills = Column(JSON, nullable=False)     # list of matched skills with category/context
    missing_skills = Column(JSON, nullable=False)     # list of missing skills categorized
    bonus_skills = Column(JSON, nullable=True)        # skills in resume not in JD
    keyword_analysis = Column(JSON, nullable=True)    # {found_keywords: [], missing_keywords: []}
    recommendations = Column(JSON, nullable=False)    # list of actionable advice items
    
    # Metadata on provider used
    provider_name = Column(String, default="Baseline NLP Engine (Level 1)")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job_description = relationship("JobDescription", back_populates="analyses")
