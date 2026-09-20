import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class CreateInterviewRequest(BaseModel):
    job_role: str = Field(..., description="Target job title / role")
    experience_level: str = Field("Mid-Level (2-4 yrs)", description="Seniority level")
    interview_type: str = Field("technical", description="technical, hr, behavioral, or mixed")
    resume_id: Optional[int] = Field(None, description="Optional resume ID for tailored context")
    question_count: int = Field(4, ge=2, le=8, description="Number of questions to generate")

class InterviewQuestion(BaseModel):
    id: int
    question_text: str
    question_type: str
    category: Optional[str] = None
    expected_criteria: List[str] = []

class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_id: int
    user_answer: str

class EvaluationAxis(BaseModel):
    score: float = Field(..., ge=0, le=100)
    feedback: str

class AnswerEvaluation(BaseModel):
    relevance: EvaluationAxis
    technical_correctness: EvaluationAxis
    communication: EvaluationAxis
    completeness: EvaluationAxis
    overall_score: float = Field(..., ge=0, le=100)
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[str] = []
    improved_answer: str

class InterviewQuestionAnswerResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    category: Optional[str] = None
    expected_criteria: Optional[List[str]] = None
    user_answer: Optional[str] = None
    evaluation: Optional[Dict[str, Any]] = None
    score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class InterviewSessionResponse(BaseModel):
    id: int
    job_role: str
    experience_level: str
    interview_type: str
    overall_score: Optional[float] = None
    summary_feedback: Optional[str] = None
    questions: List[InterviewQuestionAnswerResponse] = []
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewSessionSummary(BaseModel):
    id: int
    job_role: str
    experience_level: str
    interview_type: str
    overall_score: Optional[float] = None
    questions_count: int
    answered_count: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
