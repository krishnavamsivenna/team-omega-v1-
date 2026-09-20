from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import init_db
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database tables
    init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OMEGA - AI Job Application & Interview Coach (Level 1 MVP Foundation)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global custom exception handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # If it's already an HTTPException, FastAPI handles it automatically.
    # This catches unexpected server-side errors.
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred.",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }
    )

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "OMEGA",
        "description": "AI Job Application & Interview Coach",
        "level": 1,
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
