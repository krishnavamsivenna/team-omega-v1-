import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class JobOpportunity(Base):
    __tablename__ = "job_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="Remote")
    workplace_type = Column(String, default="Remote")  # "Remote", "Hybrid", "On-site"
    salary_range = Column(String, nullable=True)       # e.g., "$150k - $190k"
    status = Column(String, default="saved")           # "saved", "applied", "interviewing", "offer", "rejected"
    
    job_description = Column(Text, nullable=False)
    url = Column(String, nullable=True)
    match_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user = relationship("User", back_populates="job_opportunities")
