import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OMEGA - AI Job Application & Interview Coach"
    API_V1_STR: str = "/api"
    
    # Database
    # Default is PostgreSQL. If unreachable, session manager falls back to SQLite for smooth dev.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/omega_db"
    )
    
    # JWT & Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "omega_jwt_secret_dev_key_level1_2026_unsecure_change_me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Uploads
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # AI Provider Mode: "baseline" (Level 1), "gemini" / "openai" (Level 2 ready)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "baseline")

    model_config = {"env_file": ".env", "extra": "allow"}

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
