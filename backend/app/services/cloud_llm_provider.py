import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.services.ai_provider import AIProviderInterface
from app.services.llm_utils import SYSTEM_PROMPT_INJECTION_GUARD, fence_input, extract_json

logger = logging.getLogger(__name__)

class CloudLLMProvider(AIProviderInterface):
    """
    Cloud LLM Provider supporting:
    1. Google Gemini via the official google-genai SDK (gemini-3.8-flash or configured model).
    2. OpenAI or OpenAI-compatible endpoints (Groq, OpenRouter, vLLM) via httpx.
    """

    def __init__(self, engine: str = "gemini"):
        self.engine = engine.lower()
        self.timeout = settings.AI_TIMEOUT_SECONDS

    def get_provider_name(self) -> str:
        if self.engine == "openai":
            return f"Cloud OpenAI / Compatible ({settings.OPENAI_MODEL})"
        return f"Google Gemini ({settings.GEMINI_MODEL})"

    def _call_gemini(self, system_instruction: str, user_prompt: str) -> str:
        """Executes a completion using google-genai SDK with JSON response format."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured in environment")

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        full_prompt = f"{system_instruction}\n\n{user_prompt}"

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=full_prompt,
            config=config,
        )
        return response.text or ""

    def _call_openai_compatible(self, system_instruction: str, user_prompt: str) -> str:
        """Executes a completion using OpenAI-compatible REST API via httpx."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in environment")

        url = f"{settings.OPENAI_BASE_URL.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    def _call_llm(self, system_instruction: str, user_prompt: str) -> Any:
        """Dispatches to the configured cloud provider and extracts structured JSON."""
        full_system = f"{system_instruction}\n\n{SYSTEM_PROMPT_INJECTION_GUARD}"
        if self.engine == "openai":
            raw_text = self._call_openai_compatible(full_system, user_prompt)
        else:
            raw_text = self._call_gemini(full_system, user_prompt)
        return extract_json(raw_text)

    def analyze_job_fit(
        self,
        resume_text: str,
        job_text: str,
        parsed_resume: Optional[Dict[str, Any]] = None,
        job_title: str = "",
        company: Optional[str] = None
    ) -> Dict[str, Any]:
        system_instruction = (
            "You are an expert ATS and Senior Technical Recruiter analyzing a candidate's resume "
            "against a job description. Provide a thorough, objective analysis in valid JSON format. "
            "Score realistically based on demonstrable experience. "
            "You must return a JSON object with this exact schema:\n"
            "{\n"
            '  "overall_score": float (0-100),\n'
            '  "match_percentage": float (0-100),\n'
            '  "scores_breakdown": {\n'
            '    "hard_skills": float (0-100),\n'
            '    "keyword_relevance": float (0-100),\n'
            '    "ats_readability": float (0-100),\n'
            '    "experience_alignment": float (0-100)\n'
            '  },\n'
            '  "matching_skills": [{"name": string, "category": string, "importance": "high"|"medium"|"low", "frequency_in_jd": int, "found_in_resume": true}],\n'
            '  "missing_skills": [{"name": string, "category": string, "importance": "high"|"medium"|"low", "frequency_in_jd": int, "found_in_resume": false}],\n'
            '  "bonus_skills": [{"name": string, "category": string, "importance": "low", "frequency_in_jd": 0, "found_in_resume": true}],\n'
            '  "recommendations": [{"id": string, "type": string, "title": string, "description": string, "impact": "High Impact"|"Medium Impact"|"Low Impact"}],\n'
            '  "resume_improvements": [{"section": string, "issue": string, "suggestion": string, "example_rewrite": string}],\n'
            '  "recommended_skills": [{"skill": string, "category": string, "priority": "high"|"medium"|"low", "reason": string}],\n'
            '  "interview_focus_areas": [string],\n'
            '  "application_guidance": {\n'
            '    "elevator_pitch": string,\n'
            '    "cover_letter_hook": string,\n'
            '    "strengths_to_highlight": [string],\n'
            '    "talking_points_for_gaps": string\n'
            '  },\n'
            '  "job_recommendations": [string]\n'
            "}"
        )

        user_prompt = (
            f"Target Role: {job_title or 'Target Position'}\n"
            f"Target Company: {company or 'Target Organization'}\n\n"
            f"Candidate Resume:\n{fence_input('RESUME_CONTENT', resume_text)}\n\n"
            f"Job Description:\n{fence_input('JOB_DESCRIPTION', job_text)}"
        )

        data = self._call_llm(system_instruction, user_prompt)
        
        # Guarantee provider metadata and fallback keys
        data["provider_name"] = self.get_provider_name()
        data["job_title"] = job_title or data.get("job_title", "Target Role")
        data["company"] = company or data.get("company", "Target Organization")
        if "overall_score" in data and "match_percentage" not in data:
            data["match_percentage"] = data["overall_score"]
        elif "match_percentage" in data and "overall_score" not in data:
            data["overall_score"] = data["match_percentage"]
        if "matched_skills" not in data and "matching_skills" in data:
            data["matched_skills"] = data["matching_skills"]
        return data

    def generate_interview_questions(
        self,
        job_role: str,
        experience_level: str,
        interview_type: str,
        resume_context: Optional[str] = None,
        count: int = 4
    ) -> List[Dict[str, Any]]:
        system_instruction = (
            f"You are a Principal Engineering Interviewer and HR Hiring Leader conducting a {interview_type} "
            f"interview for a {experience_level} {job_role}. Generate {count} probing, high-signal questions. "
            "Return a valid JSON array of objects with this schema:\n"
            "[\n"
            "  {\n"
            '    "id": integer,\n'
            '    "question_text": string,\n'
            '    "question_type": "technical" | "behavioral" | "hr",\n'
            '    "category": string,\n'
            '    "expected_criteria": [string, string, string]\n'
            "  }\n"
            "]"
        )

        user_prompt = (
            f"Target Role: {job_role}\n"
            f"Experience Level: {experience_level}\n"
            f"Interview Category: {interview_type}\n"
            f"Number of Questions: {count}\n"
        )
        if resume_context:
            user_prompt += f"\nCandidate Background Context:\n{fence_input('RESUME_CONTENT', resume_context)}"

        data = self._call_llm(system_instruction, user_prompt)
        if isinstance(data, dict) and "questions" in data:
            data = data["questions"]
        if not isinstance(data, list):
            raise ValueError("Expected list of interview questions from LLM")
        return data

    def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        job_role: str,
        experience_level: str,
        interview_type: str
    ) -> Dict[str, Any]:
        system_instruction = (
            f"You are an expert technical interviewer evaluating a {experience_level} {job_role} candidate's "
            f"answer in a {interview_type} interview round. Assess rigorously across 4 dimensions: "
            "1. relevance: Directness and alignment to the question asked.\n"
            "2. technical_correctness: Factual accuracy, architectural soundness, depth, and handling trade-offs.\n"
            "3. communication: Clarity, structure (e.g., STAR framework), and articulateness.\n"
            "4. completeness: Thoroughness, concrete examples, and quantifiable impact.\n\n"
            "Return a valid JSON object matching this schema:\n"
            "{\n"
            '  "relevance": {"score": float (0-100), "feedback": string},\n'
            '  "technical_correctness": {"score": float (0-100), "feedback": string},\n'
            '  "communication": {"score": float (0-100), "feedback": string},\n'
            '  "completeness": {"score": float (0-100), "feedback": string},\n'
            '  "overall_score": float (0-100),\n'
            '  "strengths": [string, string],\n'
            '  "weaknesses": [string, string],\n'
            '  "suggestions": [string, string],\n'
            '  "improved_answer": string\n'
            "}"
        )

        user_prompt = (
            f"Role: {job_role} ({experience_level})\n"
            f"Question: {question}\n\n"
            f"Candidate Answer:\n{fence_input('USER_ANSWER', answer)}"
        )

        return self._call_llm(system_instruction, user_prompt)

    def generate_learning_roadmap(
        self,
        skill_gaps: List[str],
        target_role: str,
        current_skills: Optional[List[str]] = None,
        timeframe_weeks: int = 8
    ) -> Dict[str, Any]:
        system_instruction = (
            f"You are a Senior Staff Engineer and Career Mentor. Create a structured, practical {timeframe_weeks}-week "
            f"learning roadmap for an engineer aiming to become a {target_role}, addressing their specific skill gaps. "
            "Ensure practical hands-on projects and tangible milestones in every phase. "
            "Return a valid JSON object matching this schema:\n"
            "{\n"
            '  "target_role": string,\n'
            '  "summary": string,\n'
            '  "estimated_weeks": integer,\n'
            '  "phases": [\n'
            "    {\n"
            '      "phase_number": integer,\n'
            '      "title": string,\n'
            '      "duration": string,\n'
            '      "goal": string,\n'
            '      "skills_covered": [string],\n'
            '      "topics": [string],\n'
            '      "projects_to_build": [string],\n'
            '      "resources": [{"title": string, "type": string, "url_or_query": string}],\n'
            '      "action_checklist": [string]\n'
            "    }\n"
            "  ]\n"
            "}"
        )

        gaps_formatted = ", ".join(skill_gaps) if skill_gaps else "Modern Cloud Architecture, Distributed Systems"
        skills_formatted = ", ".join(current_skills) if current_skills else "Not specified"

        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Skill Gaps to Address: {gaps_formatted}\n"
            f"Current Skills: {skills_formatted}\n"
            f"Timeframe: {timeframe_weeks} weeks\n"
        )

        return self._call_llm(system_instruction, user_prompt)
