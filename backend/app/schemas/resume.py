import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    links: List[str] = []

class ParsedResumeData(BaseModel):
    contact: ContactInfo = ContactInfo()
    skills: List[str] = []
    categorized_skills: Dict[str, List[str]] = {}
    education: List[str] = []
    experience: List[str] = []
    word_count: int = 0
    detected_sections: List[str] = []

class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    raw_text: str
    parsed_data: Optional[Dict[str, Any]] = None
    is_primary: Optional[int] = 0
    target_role: Optional[str] = None
    version_tag: Optional[str] = "v1.0"
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeMetadataUpdate(BaseModel):
    target_role: Optional[str] = None
    version_tag: Optional[str] = None


class JobDescriptionCreate(BaseModel):
    title: str
    company: Optional[str] = None
    experience_level: Optional[str] = "Mid-Senior Level"
    raw_text: str

class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    company: Optional[str] = None
    experience_level: Optional[str] = None
    raw_text: str
    parsed_skills: Optional[List[str]] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
