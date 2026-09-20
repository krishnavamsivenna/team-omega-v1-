import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class RoadmapRequest(BaseModel):
    skill_gaps: List[str] = Field(..., description="List of missing skills / technologies")
    target_role: str = Field(..., description="Target job title / career track")
    current_skills: List[str] = Field([], description="Candidate's existing skills")
    analysis_id: Optional[int] = Field(None, description="Associated match analysis ID")
    timeframe_weeks: int = Field(8, ge=2, le=24, description="Target timeline in weeks")

class RoadmapResource(BaseModel):
    title: str
    type: str = "documentation"  # "documentation", "course", "project", "interactive"
    description: Optional[str] = None
    url_or_query: str

class RoadmapPhase(BaseModel):
    phase_number: int
    title: str
    duration: str  # e.g., "Weeks 1-2"
    goal: str
    skills_covered: List[str] = []
    topics: List[str] = []
    projects_to_build: List[str] = []
    resources: List[RoadmapResource] = []
    action_checklist: List[str] = []

class RoadmapData(BaseModel):
    target_role: str
    summary: str
    estimated_weeks: int
    phases: List[RoadmapPhase]

class RoadmapResponse(BaseModel):
    id: int
    target_role: str
    skill_gaps: List[str]
    roadmap_data: Dict[str, Any]
    analysis_id: Optional[int] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class RoadmapSummary(BaseModel):
    id: int
    target_role: str
    skill_gaps: List[str]
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
