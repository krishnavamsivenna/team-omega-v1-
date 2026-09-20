import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("omega.db")
logging.basicConfig(level=logging.INFO)

def create_db_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql"):
        try:
            # Test engine with a short timeout
            test_engine = create_engine(db_url, connect_args={"connect_timeout": 3})
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL database.")
            return test_engine
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection to '{db_url}' failed: {e}. "
                "Falling back to SQLite (sqlite:///./omega.db) for local execution. "
                "To connect to PostgreSQL, ensure PostgreSQL is running and update DATABASE_URL in .env."
            )
            return create_engine(
                "sqlite:///./omega.db", 
                connect_args={"check_same_thread": False}
            )
    elif db_url.startswith("sqlite"):
        return create_engine(
            db_url, 
            connect_args={"check_same_thread": False}
        )
    else:
        return create_engine(db_url)

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.db.base import Base
    # import models so they are registered on Base.metadata
    import app.models.user
    import app.models.resume
    import app.models.analysis
    import app.models.interview
    import app.models.roadmap
    import app.models.job_opportunity
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        with engine.connect() as conn:
            if "analysis_results" in tables:
                columns = [col["name"] for col in inspector.get_columns("analysis_results")]
                new_cols = [
                    ("resume_improvements", "JSON"),
                    ("recommended_skills", "JSON"),
                    ("interview_focus_areas", "JSON"),
                    ("application_guidance", "JSON"),
                    ("job_recommendations", "JSON"),
                ]
                for col_name, col_type in new_cols:
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE analysis_results ADD COLUMN {col_name} {col_type}"))
            
            if "resumes" in tables:
                resume_cols = [col["name"] for col in inspector.get_columns("resumes")]
                new_resume_cols = [
                    ("is_primary", "INTEGER DEFAULT 0"),
                    ("target_role", "VARCHAR"),
                    ("version_tag", "VARCHAR DEFAULT 'v1.0'"),
                ]
                for col_name, col_type in new_resume_cols:
                    if col_name not in resume_cols:
                        conn.execute(text(f"ALTER TABLE resumes ADD COLUMN {col_name} {col_type}"))
            conn.commit()
    except Exception as e:
        logger.warning(f"Column migration check note: {e}")
    logger.info("Database schema verified and tables initialized.")


