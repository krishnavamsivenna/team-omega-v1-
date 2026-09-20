import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.services.ai_provider import AIProviderInterface
from app.services.llm_utils import SYSTEM_PROMPT_INJECTION_GUARD, fence_input, extract_json

logger = logging.getLogger(__name__)

class OllamaProvider(AIProviderInterface):
    """
    Local LLM Provider utilizing Ollama via its HTTP REST API (/api/chat) with format="json".
    """

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.AI_TIMEOUT_SECONDS

    def get_provider_name(self) -> str:
        return f"Local Ollama ({self.model})"

    def _call_ollama(self, system_instruction: str, user_prompt: str) -> Any:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": f"{system_instruction}\n\n{SYSTEM_PROMPT_INJECTION_GUARD}"},
                {"role": "user", "content": user_prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }

        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("message", {}).get("content", "")
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
            "You are an expert ATS and Technical Recruiter. Analyze the candidate's resume "
            "against the target job description. Provide your evaluation in valid JSON format. "
            "Return this exact schema:\n"
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

        data = self._call_ollama(system_instruction, user_prompt)
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
            f"You are a Senior Engineering Hiring Manager conducting a {interview_type} interview "
            f"for a {experience_level} {job_role}. Generate {count} realistic, high-signal questions. "
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

        data = self._call_ollama(system_instruction, user_prompt)
        if isinstance(data, dict) and "questions" in data:
            data = data["questions"]
        if not isinstance(data, list):
            raise ValueError("Expected list of interview questions from Ollama")
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
            f"You are a technical interviewer evaluating a {experience_level} {job_role} candidate's "
            f"answer in a {interview_type} interview. Evaluate across 4 dimensions (0-100): "
            "1. relevance, 2. technical_correctness, 3. communication, 4. completeness. "
            "Return a valid JSON object matching this schema:\n"
            "{\n"
            '  "relevance": {"score": float, "feedback": string},\n'
            '  "technical_correctness": {"score": float, "feedback": string},\n'
            '  "communication": {"score": float, "feedback": string},\n'
            '  "completeness": {"score": float, "feedback": string},\n'
            '  "overall_score": float,\n'
            '  "strengths": [string],\n'
            '  "weaknesses": [string],\n'
            '  "suggestions": [string],\n'
            '  "improved_answer": string\n'
            "}"
        )

        user_prompt = (
            f"Role: {job_role} ({experience_level})\n"
            f"Question: {question}\n\n"
            f"Candidate Answer:\n{fence_input('USER_ANSWER', answer)}"
        )

        return self._call_ollama(system_instruction, user_prompt)

    def generate_learning_roadmap(
        self,
        skill_gaps: List[str],
        target_role: str,
        current_skills: Optional[List[str]] = None,
        timeframe_weeks: int = 8
    ) -> Dict[str, Any]:
        system_instruction = (
            f"Create a practical {timeframe_weeks}-week learning roadmap for an engineer aiming to become "
            f"a {target_role}, bridging these specific skill gaps: {', '.join(skill_gaps) if skill_gaps else 'System Design'}. "
            "Return a valid JSON object with this schema:\n"
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

        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Skill Gaps: {', '.join(skill_gaps) if skill_gaps else 'Distributed Systems'}\n"
            f"Current Skills: {', '.join(current_skills) if current_skills else 'General programming'}\n"
            f"Timeframe: {timeframe_weeks} weeks\n"
        )

        return self._call_ollama(system_instruction, user_prompt)
