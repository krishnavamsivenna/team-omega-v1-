import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.interview import InterviewSession, InterviewQuestionAnswer
from app.schemas.interview import (
    CreateInterviewRequest,
    InterviewSessionResponse,
    InterviewSessionSummary,
    SubmitAnswerRequest,
    InterviewQuestionAnswerResponse
)
from app.services.ai_provider import get_ai_provider
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interview", tags=["Mock Interview"])

@router.post("/generate", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def generate_interview(
    request: CreateInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a targeted mock interview session with tailored questions
    based on job role, experience level, interview category, and optional resume.
    """
    resume_context = None
    if request.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if resume:
            resume_context = resume.raw_text[:2500]

    ai_service = get_ai_provider()
    questions_data = ai_service.generate_interview_questions(
        job_role=request.job_role,
        experience_level=request.experience_level,
        interview_type=request.interview_type,
        resume_context=resume_context,
        count=request.question_count
    )

    if not questions_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interview questions. Please try again."
        )

    # Create session record
    session = InterviewSession(
        user_id=current_user.id,
        job_role=request.job_role,
        experience_level=request.experience_level,
        interview_type=request.interview_type,
        overall_score=None
    )
    db.add(session)
    db.flush()

    # Create question entries
    for q in questions_data:
        qa = InterviewQuestionAnswer(
            session_id=session.id,
            question_text=q.get("question_text", ""),
            question_type=q.get("question_type", request.interview_type),
            category=q.get("category", "General"),
            expected_criteria=q.get("expected_criteria", [])
        )
        db.add(qa)

    db.commit()
    db.refresh(session)
    return session

@router.post("/evaluate", response_model=InterviewQuestionAnswerResponse)
def evaluate_answer(
    request: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a candidate answer for rigorous 4-axis AI evaluation and personalized feedback.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == request.session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    qa = db.query(InterviewQuestionAnswer).filter(
        InterviewQuestionAnswer.id == request.question_id,
        InterviewQuestionAnswer.session_id == session.id
    ).first()

    if not qa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found in session.")

    user_answer = request.user_answer.strip()
    if len(user_answer) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer is too short. Please provide a substantive response."
        )

    ai_service = get_ai_provider()
    evaluation = ai_service.evaluate_interview_answer(
        question=qa.question_text,
        answer=user_answer,
        job_role=session.job_role,
        experience_level=session.experience_level,
        interview_type=session.interview_type
    )

    qa.user_answer = user_answer
    qa.evaluation = evaluation
    qa.score = evaluation.get("overall_score", 0.0)

    # Recalculate session overall score across answered questions
    all_questions = db.query(InterviewQuestionAnswer).filter(
        InterviewQuestionAnswer.session_id == session.id
    ).all()
    answered = [q for q in all_questions if q.score is not None]
    if answered:
        avg_score = sum(q.score for q in answered) / len(answered)
        session.overall_score = round(avg_score, 1)

    db.commit()
    db.refresh(qa)
    return qa

@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
def get_interview_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific interview session with full question and answer history."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    return session

@router.get("/history", response_model=List[InterviewSessionSummary])
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all past interview sessions for the current user."""
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    summary_list = []
    for s in sessions:
        q_count = len(s.questions)
        ans_count = len([q for q in s.questions if q.score is not None])
        summary_list.append(
            InterviewSessionSummary(
                id=s.id,
                job_role=s.job_role,
                experience_level=s.experience_level,
                interview_type=s.interview_type,
                overall_score=s.overall_score,
                questions_count=q_count,
                answered_count=ans_count,
                created_at=s.created_at
            )
        )
    return summary_list

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an interview session and associated records."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    db.delete(session)
    db.commit()
    return None
