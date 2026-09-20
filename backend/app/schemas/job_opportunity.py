import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class JobOpportunityBase(BaseModel):
    title: str
    company: str
    location: str = "Remote"
    workplace_type: str = "Remote" # Remote, Hybrid, On-site
    salary_range: Optional[str] = None
    status: str = "saved" # saved, applied, interviewing, offer, rejected
    job_description: str
    url: Optional[str] = None
    match_score: Optional[float] = None

class JobOpportunityCreate(JobOpportunityBase):
    pass

class JobOpportunityUpdate(BaseModel):
    status: Optional[str] = None
    salary_range: Optional[str] = None
    match_score: Optional[float] = None

class JobOpportunityResponse(JobOpportunityBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class JobSearchQuery(BaseModel):
    query: Optional[str] = None
    role_category: Optional[str] = None
    remote_only: Optional[bool] = False
    experience_level: Optional[str] = None

class JobSearchResultItem(BaseModel):
    id: str
    title: str
    company: str
    location: str
    workplace_type: str
    salary_range: str
    experience_level: str
    required_skills: List[str]
    description_snippet: str
    full_description: str
    posted_date: str
    apply_url: Optional[str] = None
