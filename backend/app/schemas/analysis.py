import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class MatchRequest(BaseModel):
    resume_id: Optional[int] = None
    resume_text: Optional[str] = None
    job_title: str
    company: Optional[str] = "Target Company"
    experience_level: Optional[str] = "Mid-Senior"
    job_description: str

class ScoreBreakdown(BaseModel):
    hard_skills: float
    keyword_relevance: float
    ats_readability: float
    experience_alignment: float

class SkillItem(BaseModel):
    name: str
    category: str
    importance: str = "medium"  # high, medium, low
    frequency_in_jd: int = 1
    found_in_resume: bool = False

class KeywordFrequency(BaseModel):
    keyword: str
    jd_count: int
    resume_count: int
    match_status: str  # "matched", "missing", "overused"

class RecommendationItem(BaseModel):
    id: str
    type: str  # "skill_gap", "ats_format", "experience_bullet", "action_verb"
    title: str
    description: str
    impact: str  # "High Impact", "Medium Impact", "Low Impact"

class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_id: Optional[int] = None
    job_title: str
    company: Optional[str] = None
    overall_score: float
    scores_breakdown: ScoreBreakdown
    matched_skills: List[SkillItem]
    missing_skills: List[SkillItem]
    bonus_skills: List[SkillItem] = []
    keyword_analysis: Dict[str, Any]
    recommendations: List[RecommendationItem]
    provider_name: str
    
    # Level 2 Extended AI Intelligence Fields
    match_percentage: Optional[float] = None
    matching_skills: Optional[List[SkillItem]] = None
    resume_improvements: List[Dict[str, Any]] = []
    recommended_skills: List[Dict[str, Any]] = []
    interview_focus_areas: List[str] = []
    application_guidance: Dict[str, Any] = {}
    job_recommendations: List[str] = []
    
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class AnalysisHistoryItem(BaseModel):
    id: int
    job_title: str
    company: Optional[str] = None
    overall_score: float
    matched_skills_count: int
    missing_skills_count: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
