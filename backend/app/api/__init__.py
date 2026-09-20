from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.analysis import router as analysis_router
from app.api.health import router as health_router
from app.api.interview import router as interview_router
from app.api.roadmap import router as roadmap_router
from app.api.jobs import router as jobs_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(resumes_router)
api_router.include_router(analysis_router)
api_router.include_router(interview_router)
api_router.include_router(roadmap_router)
api_router.include_router(jobs_router)

__all__ = ["api_router"]


