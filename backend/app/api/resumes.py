import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse
from app.services.resume_parser import ResumeParser
from app.api.deps import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt", "md"}

class ParseTextRequest(BaseModel):
    title: str = "Pasted Resume"
    text: str

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "resume.txt"
    extension = filename.lower().split(".")[-1]
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{extension}'. Supported formats: PDF, DOCX, TXT."
        )

    # Read bytes and validate size
    content = await file.read()
    file_size = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save to disk
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse resume text & sections
    try:
        raw_text = ResumeParser.extract_text_from_bytes(content, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from file: {str(e)}"
        )

    if not raw_text or len(raw_text.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded file contains very little or no readable text. Please provide a standard resume document."
        )

    parsed_data = ResumeParser.parse_resume(raw_text)

    # Create Resume DB record
    resume = Resume(
        user_id=current_user.id,
        filename=filename,
        file_path=file_path,
        file_type=extension,
        file_size=file_size,
        raw_text=raw_text,
        parsed_data=parsed_data
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume

@router.post("/parse-text", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def parse_resume_text(
    payload: ParseTextRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows submitting resume as plain text directly."""
    raw_text = payload.text.strip()
    if len(raw_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is too short. Please provide at least 50 characters."
        )

    parsed_data = ResumeParser.parse_resume(raw_text)
    
    # Save a virtual txt record
    filename = f"{payload.title or 'Text_Resume'}.txt"
    resume = Resume(
        user_id=current_user.id,
        filename=filename,
        file_path="inline://text",
        file_type="txt",
        file_size=len(raw_text.encode("utf-8")),
        raw_text=raw_text,
        parsed_data=parsed_data
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/", response_model=List[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    # Remove file from disk if local
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except OSError:
            pass

    db.delete(resume)
    db.commit()
    return None

@router.patch("/{resume_id}/primary", response_model=ResumeResponse)
def set_primary_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sets the designated resume as primary, clearing primary status on other resumes."""
    target_resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not target_resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    # Reset all user's resumes to is_primary = 0
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": 0})
    target_resume.is_primary = 1
    db.commit()
    db.refresh(target_resume)
    return target_resume

@router.patch("/{resume_id}/metadata", response_model=ResumeResponse)
def update_resume_metadata(
    resume_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates custom version label or target role on a resume document."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    if "target_role" in payload:
        resume.target_role = payload["target_role"]
    if "version_tag" in payload:
        resume.version_tag = payload["version_tag"]

    db.commit()
    db.refresh(resume)
    return resume

