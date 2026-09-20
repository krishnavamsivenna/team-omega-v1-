from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.job_opportunity import JobOpportunity
from app.schemas.job_opportunity import (
    JobOpportunityCreate,
    JobOpportunityUpdate,
    JobOpportunityResponse,
    JobSearchResultItem
)
from app.services.job_search_service import search_jobs
from app.api.deps import get_current_user

router = APIRouter(prefix="/jobs", tags=["Job Opportunities & Search"])

@router.get("/search", response_model=List[JobSearchResultItem])
def search_job_listings(
    q: Optional[str] = Query(None, description="Search term across title, company, or skills"),
    remote: Optional[bool] = Query(False, description="Filter remote positions only"),
    experience_level: Optional[str] = Query(None, description="e.g. Senior, Mid-Level, Staff"),
    skill: Optional[str] = Query(None, description="Specific technology required"),
    current_user: User = Depends(get_current_user)
):
    """Searches live technology job opportunities across roles, locations, and technologies."""
    return search_jobs(
        query=q,
        remote_only=bool(remote),
        experience_level=experience_level,
        skill_filter=skill
    )

@router.get("/saved", response_model=List[JobOpportunityResponse])
def get_saved_jobs(
    status_filter: Optional[str] = Query(None, description="Filter by saved, applied, interviewing, etc."),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all tracked and bookmarked job opportunities for the current user."""
    query = db.query(JobOpportunity).filter(JobOpportunity.user_id == current_user.id)
    if status_filter:
        query = query.filter(JobOpportunity.status == status_filter.lower())
    return query.order_by(JobOpportunity.updated_at.desc()).all()

@router.post("/saved", response_model=JobOpportunityResponse, status_code=status.HTTP_201_CREATED)
def save_job_opportunity(
    payload: JobOpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmarks or creates a tracked job opportunity on the user's board."""
    existing = db.query(JobOpportunity).filter(
        JobOpportunity.user_id == current_user.id,
        JobOpportunity.title == payload.title,
        JobOpportunity.company == payload.company
    ).first()

    if existing:
        # Update existing record status if provided
        existing.status = payload.status or existing.status
        existing.salary_range = payload.salary_range or existing.salary_range
        existing.match_score = payload.match_score or existing.match_score
        db.commit()
        db.refresh(existing)
        return existing

    job = JobOpportunity(
        user_id=current_user.id,
        title=payload.title,
        company=payload.company,
        location=payload.location,
        workplace_type=payload.workplace_type,
        salary_range=payload.salary_range,
        status=payload.status,
        job_description=payload.job_description,
        url=payload.url,
        match_score=payload.match_score
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.patch("/saved/{job_id}/status", response_model=JobOpportunityResponse)
def update_job_status(
    job_id: int,
    payload: JobOpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates tracking status for a saved job (e.g., applied, interviewing, offer)."""
    job = db.query(JobOpportunity).filter(
        JobOpportunity.id == job_id,
        JobOpportunity.user_id == current_user.id
    ).first()

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved job not found.")

    if payload.status:
        job.status = payload.status.lower()
    if payload.salary_range:
        job.salary_range = payload.salary_range
    if payload.match_score is not None:
        job.match_score = payload.match_score

    db.commit()
    db.refresh(job)
    return job

@router.delete("/saved/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Removes a job opportunity from the user's saved board."""
    job = db.query(JobOpportunity).filter(
        JobOpportunity.id == job_id,
        JobOpportunity.user_id == current_user.id
    ).first()

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved job not found.")

    db.delete(job)
    db.commit()
    return None
