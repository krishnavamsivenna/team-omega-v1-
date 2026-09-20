import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.analysis import AnalysisResult
from app.models.roadmap import LearningRoadmap
from app.schemas.roadmap import (
    RoadmapRequest,
    RoadmapResponse,
    RoadmapSummary
)
from app.services.ai_provider import get_ai_provider
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])

@router.post("/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a personalized, phased learning curriculum to bridge detected skill gaps
    for a target engineering role.
    """
    skill_gaps = [s.strip() for s in request.skill_gaps if s.strip()]
    target_role = request.target_role.strip()

    # If linked to an analysis_id, enrich gaps if empty
    if request.analysis_id and not skill_gaps:
        analysis = db.query(AnalysisResult).filter(
            AnalysisResult.id == request.analysis_id,
            AnalysisResult.user_id == current_user.id
        ).first()
        if analysis and analysis.missing_skills:
            skill_gaps = [
                m["name"] if isinstance(m, dict) else str(m)
                for m in analysis.missing_skills
            ][:6]
            if not target_role:
                target_role = analysis.job_title

    if not skill_gaps:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one target skill gap must be provided to generate a roadmap."
        )

    ai_service = get_ai_provider()
    roadmap_content = ai_service.generate_learning_roadmap(
        skill_gaps=skill_gaps,
        target_role=target_role or "Software Engineer",
        current_skills=request.current_skills,
        timeframe_weeks=request.timeframe_weeks
    )

    roadmap_record = LearningRoadmap(
        user_id=current_user.id,
        analysis_id=request.analysis_id,
        target_role=target_role or "Software Engineer",
        skill_gaps=skill_gaps,
        roadmap_data=roadmap_content
    )
    db.add(roadmap_record)
    db.commit()
    db.refresh(roadmap_record)

    return roadmap_record

@router.get("/history", response_model=List[RoadmapSummary])
def get_roadmap_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all generated roadmaps for the current user."""
    roadmaps = db.query(LearningRoadmap).filter(
        LearningRoadmap.user_id == current_user.id
    ).order_by(LearningRoadmap.created_at.desc()).all()

    return roadmaps

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific learning roadmap by ID."""
    roadmap = db.query(LearningRoadmap).filter(
        LearningRoadmap.id == roadmap_id,
        LearningRoadmap.user_id == current_user.id
    ).first()

    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning roadmap not found.")

    return roadmap

@router.delete("/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a learning roadmap."""
    roadmap = db.query(LearningRoadmap).filter(
        LearningRoadmap.id == roadmap_id,
        LearningRoadmap.user_id == current_user.id
    ).first()

    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning roadmap not found.")

    db.delete(roadmap)
    db.commit()
    return None
