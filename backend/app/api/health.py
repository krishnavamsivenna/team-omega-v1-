import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db, engine
from app.core.config import settings
from app.services.ai_provider import get_ai_provider

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    db_dialect = str(engine.url.drivername)
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    provider = get_ai_provider()

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": {
            "status": db_status,
            "dialect": db_dialect,
            "target": "PostgreSQL (with seamless local dev fallback)"
        },
        "uploads": {
            "directory": settings.UPLOAD_DIR,
            "writable": os.access(settings.UPLOAD_DIR, os.W_OK)
        },
        "ai_provider": {
            "mode": settings.AI_PROVIDER,
            "name": provider.get_provider_name(),
            "level": "Level 2 (AI Intelligence Layer: Multi-Provider with Graceful Fallback)"
        }
    }

