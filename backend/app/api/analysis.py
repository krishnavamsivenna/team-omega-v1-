from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.resume import Resume, JobDescription
from app.models.analysis import AnalysisResult
from app.schemas.analysis import MatchRequest, AnalysisResponse, AnalysisHistoryItem
from app.services.ai_provider import get_ai_provider
from app.services.skill_taxonomy import extract_skills_from_text
from app.api.deps import get_current_user

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/match", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def match_resume_to_job(
    request: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Resolve Resume text and parsed data
    resume = None
    if request.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified resume not found.")
        resume_text = resume.raw_text
        parsed_resume = resume.parsed_data
    elif request.resume_text and len(request.resume_text.strip()) >= 50:
        # Create an ad-hoc inline resume for the user
        resume_text = request.resume_text.strip()
        from app.services.resume_parser import ResumeParser
        parsed_resume = ResumeParser.parse_resume(resume_text)
        resume = Resume(
            user_id=current_user.id,
            filename="Quick_Input_Resume.txt",
            file_path="inline://text",
            file_type="txt",
            file_size=len(resume_text.encode("utf-8")),
            raw_text=resume_text,
            parsed_data=parsed_resume
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a valid resume_id or resume_text (min 50 chars) must be provided."
        )

    # 2. Validate Job Description
    job_text = request.job_description.strip()
    if len(job_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too brief. Please provide a substantive job description (min 50 chars)."
        )

    # 3. Create JobDescription record
    jd_skills, _ = extract_skills_from_text(job_text)
    job_desc = JobDescription(
        user_id=current_user.id,
        title=request.job_title,
        company=request.company,
        experience_level=request.experience_level,
        raw_text=job_text,
        parsed_skills=jd_skills
    )
    db.add(job_desc)
    db.commit()
    db.refresh(job_desc)

    # 4. Invoke AI / Matching Provider
    provider = get_ai_provider()
    analysis_data = provider.analyze_job_fit(
        resume_text=resume_text,
        job_text=job_text,
        parsed_resume=parsed_resume,
        job_title=request.job_title,
        company=request.company
    )

    # 5. Persist AnalysisResult in Database
    analysis_record = AnalysisResult(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=job_desc.id,
        job_title=request.job_title,
        company=request.company,
        overall_score=analysis_data["overall_score"],
        scores_breakdown=analysis_data["scores_breakdown"],
        matched_skills=analysis_data["matched_skills"],
        missing_skills=analysis_data["missing_skills"],
        bonus_skills=analysis_data.get("bonus_skills", []),
        keyword_analysis=analysis_data.get("keyword_analysis", {}),
        recommendations=analysis_data["recommendations"],
        resume_improvements=analysis_data.get("resume_improvements", []),
        recommended_skills=analysis_data.get("recommended_skills", []),
        interview_focus_areas=analysis_data.get("interview_focus_areas", []),
        application_guidance=analysis_data.get("application_guidance", {}),
        job_recommendations=analysis_data.get("job_recommendations", []),
        provider_name=analysis_data.get("provider_name", provider.get_provider_name())
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)


    return analysis_record

@router.get("/history", response_model=List[AnalysisHistoryItem])
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(AnalysisResult).filter(
        AnalysisResult.user_id == current_user.id
    ).order_by(AnalysisResult.created_at.desc()).all()

    history_items = []
    for r in results:
        matched_count = len(r.matched_skills) if isinstance(r.matched_skills, list) else 0
        missing_count = len(r.missing_skills) if isinstance(r.missing_skills, list) else 0
        history_items.append(
            AnalysisHistoryItem(
                id=r.id,
                job_title=r.job_title,
                company=r.company,
                overall_score=r.overall_score,
                matched_skills_count=matched_count,
                missing_skills_count=missing_count,
                created_at=r.created_at
            )
        )
    return history_items

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_report(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.id == analysis_id,
        AnalysisResult.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found.")
    return analysis

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis_report(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.id == analysis_id,
        AnalysisResult.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found.")
    db.delete(analysis)
    db.commit()
    return None
