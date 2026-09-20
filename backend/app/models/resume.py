import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    raw_text = Column(Text, nullable=False)
    parsed_data = Column(JSON, nullable=True)  # {contact, skills, education, experience, etc.}
    
    # Versioning & Profile management
    is_primary = Column(Integer, default=0) # 1 for primary, 0 otherwise (works seamlessly across SQLite and PG)
    target_role = Column(String, nullable=True) # e.g. "Full Stack Engineer"
    version_tag = Column(String, default="v1.0") # e.g. "v1.0 - Default"
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user = relationship("User", back_populates="resumes")
    analyses = relationship("AnalysisResult", back_populates="resume", cascade="all, delete-orphan")



class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    raw_text = Column(Text, nullable=False)
    parsed_skills = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user = relationship("User", back_populates="job_descriptions")
    analyses = relationship("AnalysisResult", back_populates="job_description")
