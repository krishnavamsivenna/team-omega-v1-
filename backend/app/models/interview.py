import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_role = Column(String, nullable=False)
    experience_level = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)  # "technical", "hr", "behavioral", "mixed"
    overall_score = Column(Float, nullable=True)
    summary_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    questions = relationship(
        "InterviewQuestionAnswer",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestionAnswer.id"
    )


class InterviewQuestionAnswer(Base):
    __tablename__ = "interview_question_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # "technical", "behavioral", "hr"
    category = Column(String, nullable=True)        # e.g., "System Design", "Conflict Resolution"
    expected_criteria = Column(JSON, nullable=True) # list of criteria / rubric
    user_answer = Column(Text, nullable=True)
    evaluation = Column(JSON, nullable=True)        # {relevance, technical_correctness, communication, completeness, strengths, weaknesses, suggestions, improved_answer}
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
