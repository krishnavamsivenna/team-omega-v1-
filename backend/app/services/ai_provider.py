from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.core.config import settings

class AIProviderInterface(ABC):
    """
    Abstract Service Interface for Resume & Job Fit Analysis.
    
    Level 1 provides the BaselineNLPProvider (deterministic NLP, TF-IDF cosine similarity,
    and taxonomy-based skill gap detection).
    
    Level 2 will implement this interface for LLM providers (e.g. Gemini, OpenAI, Claude)
    without altering any database models, API routes, or frontend contracts.
    """

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns the human-readable name and version of the analysis engine."""
        pass

    @abstractmethod
    def analyze_job_fit(
        self,
        resume_text: str,
        job_text: str,
        parsed_resume: Optional[Dict[str, Any]] = None,
        job_title: str = "",
        company: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes resume vs job description matching, calculates scores,
        identifies skill gaps, and produces actionable recommendations.
        """
        pass


def get_ai_provider() -> AIProviderInterface:
    """
    Factory to resolve the active AI / Analysis Provider.
    Configured via settings.AI_PROVIDER.
    """
    provider_type = settings.AI_PROVIDER.lower()
    
    if provider_type == "baseline":
        from app.services.baseline_matcher import BaselineNLPProvider
        return BaselineNLPProvider()
    elif provider_type in ["gemini", "openai", "llm"]:
        # Level 2 placeholder hook
        raise NotImplementedError(
            f"Provider '{provider_type}' is reserved for Level 2. "
            "Level 1 uses the 'baseline' deterministic engine."
        )
    else:
        from app.services.baseline_matcher import BaselineNLPProvider
        return BaselineNLPProvider()
