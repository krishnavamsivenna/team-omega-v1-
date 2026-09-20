import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIProviderInterface(ABC):
    """
    Abstract Service Interface for AI Intelligence Layer (OMEGA Level 2).
    Implemented by BaselineNLPProvider, CloudLLMProvider, and OllamaProvider.
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
        Matches resume against job description, scores compatibility,
        identifies skill gaps, and returns improvements and guidance.
        """
        pass

    @abstractmethod
    def generate_interview_questions(
        self,
        job_role: str,
        experience_level: str,
        interview_type: str,
        resume_context: Optional[str] = None,
        count: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Generates contextual interview questions (Technical, Behavioral, HR, or Mixed).
        """
        pass

    @abstractmethod
    def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        job_role: str,
        experience_level: str,
        interview_type: str
    ) -> Dict[str, Any]:
        """
        Evaluates a candidate's answer across relevance, technical correctness,
        communication, and completeness.
        """
        pass

    @abstractmethod
    def generate_learning_roadmap(
        self,
        skill_gaps: List[str],
        target_role: str,
        current_skills: Optional[List[str]] = None,
        timeframe_weeks: int = 8
    ) -> Dict[str, Any]:
        """
        Generates a step-by-step personalized learning roadmap to bridge skill gaps.
        """
        pass


class AIService(AIProviderInterface):
    """
    Unified AI Service Facade.
    Resolves the active provider (Gemini, OpenAI, Ollama, or Baseline) based on configuration.
    Provides automatic, graceful fallback to BaselineNLPProvider if an external LLM call
    fails, times out, or encounters missing credentials.
    """

    def __init__(self, provider_override: Optional[str] = None):
        self.provider_key = (provider_override or settings.AI_PROVIDER).lower()
        self._baseline_fallback = None
        self._active_provider = self._resolve_provider(self.provider_key)

    @property
    def baseline(self):
        if self._baseline_fallback is None:
            from app.services.baseline_matcher import BaselineNLPProvider
            self._baseline_fallback = BaselineNLPProvider()
        return self._baseline_fallback

    def _resolve_provider(self, key: str) -> AIProviderInterface:
        if key == "gemini":
            from app.services.cloud_llm_provider import CloudLLMProvider
            return CloudLLMProvider(engine="gemini")
        elif key == "openai":
            from app.services.cloud_llm_provider import CloudLLMProvider
            return CloudLLMProvider(engine="openai")
        elif key == "ollama":
            from app.services.ollama_provider import OllamaProvider
            return OllamaProvider()
        else:
            return self.baseline

    def get_provider_name(self) -> str:
        return self._active_provider.get_provider_name()

    def analyze_job_fit(
        self,
        resume_text: str,
        job_text: str,
        parsed_resume: Optional[Dict[str, Any]] = None,
        job_title: str = "",
        company: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            return self._active_provider.analyze_job_fit(
                resume_text=resume_text,
                job_text=job_text,
                parsed_resume=parsed_resume,
                job_title=job_title,
                company=company
            )
        except Exception as e:
            logger.warning(
                f"AI Provider '{self.get_provider_name()}' failed during analyze_job_fit: {e}. "
                "Executing graceful fallback to BaselineNLPProvider."
            )
            res = self.baseline.analyze_job_fit(
                resume_text=resume_text,
                job_text=job_text,
                parsed_resume=parsed_resume,
                job_title=job_title,
                company=company
            )
            res["provider_name"] = f"{self.baseline.get_provider_name()} (Auto-Fallback from {self.provider_key})"
            res["fallback_triggered"] = True
            return res

    def generate_interview_questions(
        self,
        job_role: str,
        experience_level: str,
        interview_type: str,
        resume_context: Optional[str] = None,
        count: int = 4
    ) -> List[Dict[str, Any]]:
        try:
            return self._active_provider.generate_interview_questions(
                job_role=job_role,
                experience_level=experience_level,
                interview_type=interview_type,
                resume_context=resume_context,
                count=count
            )
        except Exception as e:
            logger.warning(
                f"AI Provider '{self.get_provider_name()}' failed during generate_interview_questions: {e}. "
                "Executing graceful fallback to BaselineNLPProvider."
            )
            return self.baseline.generate_interview_questions(
                job_role=job_role,
                experience_level=experience_level,
                interview_type=interview_type,
                resume_context=resume_context,
                count=count
            )

    def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        job_role: str,
        experience_level: str,
        interview_type: str
    ) -> Dict[str, Any]:
        try:
            return self._active_provider.evaluate_interview_answer(
                question=question,
                answer=answer,
                job_role=job_role,
                experience_level=experience_level,
                interview_type=interview_type
            )
        except Exception as e:
            logger.warning(
                f"AI Provider '{self.get_provider_name()}' failed during evaluate_interview_answer: {e}. "
                "Executing graceful fallback to BaselineNLPProvider."
            )
            res = self.baseline.evaluate_interview_answer(
                question=question,
                answer=answer,
                job_role=job_role,
                experience_level=experience_level,
                interview_type=interview_type
            )
            res["fallback_triggered"] = True
            return res

    def generate_learning_roadmap(
        self,
        skill_gaps: List[str],
        target_role: str,
        current_skills: Optional[List[str]] = None,
        timeframe_weeks: int = 8
    ) -> Dict[str, Any]:
        try:
            return self._active_provider.generate_learning_roadmap(
                skill_gaps=skill_gaps,
                target_role=target_role,
                current_skills=current_skills,
                timeframe_weeks=timeframe_weeks
            )
        except Exception as e:
            logger.warning(
                f"AI Provider '{self.get_provider_name()}' failed during generate_learning_roadmap: {e}. "
                "Executing graceful fallback to BaselineNLPProvider."
            )
            res = self.baseline.generate_learning_roadmap(
                skill_gaps=skill_gaps,
                target_role=target_role,
                current_skills=current_skills,
                timeframe_weeks=timeframe_weeks
            )
            res["fallback_triggered"] = True
            return res


def get_ai_provider() -> AIProviderInterface:
    """Returns the unified AI service facade with active provider and fallback."""
    return AIService()
