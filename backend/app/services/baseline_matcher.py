import re
import math
from collections import Counter
from typing import Dict, Any, List, Set, Optional
from app.services.ai_provider import AIProviderInterface
from app.services.skill_taxonomy import extract_skills_from_text, SKILL_TAXONOMY

COMMON_STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
    "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves", "will", "shall", "work", "experience", "role",
    "job", "candidate", "responsibilities", "requirements", "looking", "team",
    "company", "years", "working", "skills", "ability", "strong"
}

ACTION_VERBS: Set[str] = {
    "accelerated", "achieved", "administered", "advised", "allocated", "analyzed",
    "architected", "automated", "built", "centralized", "championed", "collaborated",
    "configured", "consolidated", "constructed", "coordinated", "created", "decreased",
    "delivered", "deployed", "designed", "developed", "devised", "directed", "documented",
    "drove", "engineered", "enhanced", "established", "evaluated", "executed", "expanded",
    "expedited", "formulated", "founded", "generated", "guided", "implemented", "improved",
    "increased", "initiated", "innovated", "installed", "instituted", "integrated",
    "introduced", "launched", "led", "managed", "maximized", "mentored", "migrated",
    "minimized", "modernized", "monitored", "negotiated", "operated", "optimized",
    "orchestrated", "organized", "overhauled", "oversaw", "partnered", "pioneered",
    "planned", "prepared", "produced", "programmed", "promoted", "re-engineered",
    "rearchitected", "reduced", "refactored", "resolved", "restructured", "revamped",
    "scaled", "scheduled", "secured", "simplified", "solved", "spearheaded", "standardized",
    "streamlined", "strengthened", "structured", "supervised", "tested", "tracked",
    "trained", "transformed", "upgraded", "validated"
}

class BaselineNLPProvider(AIProviderInterface):
    """
    Level 1 Deterministic NLP & Skill Gap Engine.
    Provides transparent, reproducible, and explainable resume matching
    without pretending to be a generative AI LLM.
    """

    def get_provider_name(self) -> str:
        return "OMEGA Baseline NLP Engine (Level 1 Foundation)"

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z][a-zA-Z0-9\+\#\.\-]{1,24}\b", text.lower())
        return [w for w in words if w not in COMMON_STOPWORDS and len(w) > 1]

    def _compute_cosine_similarity(self, words1: List[str], words2: List[str]) -> float:
        if not words1 or not words2:
            return 0.0
        c1 = Counter(words1)
        c2 = Counter(words2)
        all_words = set(c1.keys()).union(set(c2.keys()))
        
        dot_product = sum(c1.get(w, 0) * c2.get(w, 0) for w in all_words)
        norm1 = math.sqrt(sum(v ** 2 for v in c1.values()))
        norm2 = math.sqrt(sum(v ** 2 for v in c2.values()))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return min(1.0, dot_product / (norm1 * norm2))

    def _calculate_ats_score(self, resume_text: str, parsed_resume: Optional[Dict[str, Any]] = None) -> float:
        score = 0.0
        
        # 1. Standard Section Headers (up to 35 pts)
        detected_sections = (parsed_resume or {}).get("detected_sections", [])
        if not detected_sections:
            from app.services.resume_parser import ResumeParser
            detected_sections = ResumeParser.detect_sections(resume_text)
        
        essential_sections = {"experience", "education", "skills"}
        found_essential = [s for s in essential_sections if s in detected_sections]
        score += (len(found_essential) / len(essential_sections)) * 25.0
        if "projects" in detected_sections or "certifications" in detected_sections:
            score += 10.0

        # 2. Contact Information Completeness (up to 25 pts)
        contact = (parsed_resume or {}).get("contact", {})
        if not contact:
            from app.services.resume_parser import ResumeParser
            contact = ResumeParser.parse_contact_info(resume_text)
        
        if contact.get("email"):
            score += 10.0
        if contact.get("phone"):
            score += 8.0
        if contact.get("links"):
            score += 7.0

        # 3. Action Verbs Usage (up to 20 pts)
        words = set(self._tokenize(resume_text))
        action_verbs_found = words.intersection(ACTION_VERBS)
        if len(action_verbs_found) >= 10:
            score += 20.0
        elif len(action_verbs_found) >= 5:
            score += 14.0
        elif len(action_verbs_found) >= 1:
            score += 8.0

        # 4. Quantifiable Metrics (up to 20 pts)
        # Look for numbers with %, $, k, or metric indicators
        metric_matches = re.findall(r"\b(?:\d+[%kKxX]|\$\d+|\d+\+?\s*(?:users|clients|customers|revenue|latency|percent|reduction|increase|growth))\b", resume_text, re.IGNORECASE)
        if len(metric_matches) >= 5:
            score += 20.0
        elif len(metric_matches) >= 2:
            score += 12.0
        elif len(metric_matches) >= 1:
            score += 6.0

        return min(100.0, max(10.0, score))

    def _calculate_experience_alignment(self, resume_text: str, job_text: str) -> float:
        """Heuristic alignment between years of experience mentioned."""
        # Find years in JD e.g., "5+ years", "3-5 years"
        jd_years_match = re.findall(r"(\d+)\+?\s*years?(?:\s*of)?\s*experience", job_text, re.IGNORECASE)
        req_years = int(jd_years_match[0]) if jd_years_match else 3
        
        resume_years_match = re.findall(r"(\d+)\+?\s*years?(?:\s*of)?\s*experience", resume_text, re.IGNORECASE)
        found_years = int(resume_years_match[0]) if resume_years_match else 2

        # Ratio scoring
        if found_years >= req_years:
            return 95.0
        ratio = found_years / max(1, req_years)
        return min(95.0, max(40.0, ratio * 90.0))

    def analyze_job_fit(
        self,
        resume_text: str,
        job_text: str,
        parsed_resume: Optional[Dict[str, Any]] = None,
        job_title: str = "",
        company: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Skill Extraction
        resume_skills, resume_cat = extract_skills_from_text(resume_text)
        jd_skills, jd_cat = extract_skills_from_text(job_text)
        
        resume_skill_set = set(s.lower() for s in resume_skills)
        jd_skill_set = set(s.lower() for s in jd_skills)

        # Helper to find category
        def get_category(skill_name: str) -> str:
            for cat, s_dict in SKILL_TAXONOMY.items():
                if skill_name in s_dict:
                    return cat
            return "General Technical"

        # Count occurrences in JD to assess importance
        jd_lower = job_text.lower()
        matched_items: List[Dict[str, Any]] = []
        missing_items: List[Dict[str, Any]] = []
        bonus_items: List[Dict[str, Any]] = []

        for skill in jd_skills:
            freq = len(re.findall(r"\b" + re.escape(skill) + r"\b", jd_lower))
            importance = "high" if freq >= 2 or "require" in jd_lower or "must" in jd_lower else "medium"
            item = {
                "name": skill.title(),
                "category": get_category(skill),
                "importance": importance,
                "frequency_in_jd": max(1, freq),
                "found_in_resume": skill.lower() in resume_skill_set
            }
            if skill.lower() in resume_skill_set:
                matched_items.append(item)
            else:
                missing_items.append(item)

        for skill in resume_skills:
            if skill.lower() not in jd_skill_set:
                bonus_items.append({
                    "name": skill.title(),
                    "category": get_category(skill),
                    "importance": "low",
                    "frequency_in_jd": 0,
                    "found_in_resume": True
                })

        # 2. Hard Skills Score
        if jd_skills:
            skills_score = (len(matched_items) / len(jd_skills)) * 100.0
        else:
            skills_score = 70.0  # neutral if JD has generic requirements

        # 3. Keyword / TF-IDF Vector Cosine Similarity
        resume_tokens = self._tokenize(resume_text)
        jd_tokens = self._tokenize(job_text)
        cosine_sim = self._compute_cosine_similarity(resume_tokens, jd_tokens)
        # Cosine similarity for resume-to-JD naturally ranges between 0.15 and 0.70; map to a 0-100 scale
        keyword_score = min(100.0, max(15.0, (cosine_sim * 140.0)))

        # 4. ATS Readability Score
        ats_score = self._calculate_ats_score(resume_text, parsed_resume)

        # 5. Experience Alignment Score
        exp_score = self._calculate_experience_alignment(resume_text, job_text)

        # 6. Overall Weighted Score
        overall = (
            (skills_score * 0.45) +
            (keyword_score * 0.30) +
            (ats_score * 0.15) +
            (exp_score * 0.10)
        )
        overall_score = round(min(99.0, max(20.0, overall)), 1)

        # 7. Keyword Analysis (Top JD tokens vs Resume frequency)
        jd_token_counts = Counter(jd_tokens)
        resume_token_counts = Counter(resume_tokens)
        top_keywords = []
        for kw, count in jd_token_counts.most_common(12):
            res_count = resume_token_counts.get(kw, 0)
            status = "matched" if res_count > 0 else "missing"
            top_keywords.append({
                "keyword": kw,
                "jd_count": count,
                "resume_count": res_count,
                "match_status": status
            })

        # 8. Actionable Recommendations
        recommendations: List[Dict[str, Any]] = []
        rec_id = 1

        # Skill gap recommendations
        high_priority_missing = [m for m in missing_items if m["importance"] == "high"]
        if high_priority_missing:
            top_3 = ", ".join([m["name"] for m in high_priority_missing[:3]])
            recommendations.append({
                "id": f"rec-{rec_id}",
                "type": "skill_gap",
                "title": f"Address Critical Skill Gaps: {top_3}",
                "description": f"The job description explicitly emphasizes {top_3}. If you have hands-on experience or coursework in these areas, make sure they are prominently listed in your skills and project descriptions.",
                "impact": "High Impact"
            })
            rec_id += 1
        elif missing_items:
            names = ", ".join([m["name"] for m in missing_items[:3]])
            recommendations.append({
                "id": f"rec-{rec_id}",
                "type": "skill_gap",
                "title": f"Consider Highlighting: {names}",
                "description": f"Target competencies mentioned in the role include {names}. Highlighting related workflows or familiarity will boost your initial screen ranking.",
                "impact": "Medium Impact"
            })
            rec_id += 1

        # Keyword alignment recommendations
        missing_kw = [k["keyword"] for k in top_keywords if k["match_status"] == "missing"]
        if missing_kw:
            recommendations.append({
                "id": f"rec-{rec_id}",
                "type": "action_verb",
                "title": f"Incorporate Key Industry Terms: {', '.join(missing_kw[:4])}",
                "description": "Applicant Tracking Systems (ATS) scan for exact contextual terms. Integrate these naturally into your work summary or bullet points.",
                "impact": "High Impact"
            })
            rec_id += 1

        # ATS formatting recommendations
        if ats_score < 75:
            recommendations.append({
                "id": f"rec-{rec_id}",
                "type": "ats_format",
                "title": "Enhance ATS Structural Clarity & Quantifiable Metrics",
                "description": "Strengthen bullet points by utilizing strong action verbs (e.g., 'Engineered', 'Orchestrated') and quantifiable business outcomes (percentages, efficiency gains, team sizes).",
                "impact": "Medium Impact"
            })
            rec_id += 1

        if len(recommendations) < 3:
            recommendations.append({
                "id": f"rec-{rec_id}",
                "type": "experience_bullet",
                "title": "Leverage Your Unique Bonus Skills",
                "description": f"You possess additional strengths ({', '.join([b['name'] for b in bonus_items[:3]]) or 'diverse technical breadth'}) not strictly required by the JD. Mention in your interview prep how these give you an unfair advantage.",
                "impact": "Low Impact"
            })

        return {
            "job_title": job_title or "Target Role",
            "company": company or "Target Organization",
            "overall_score": overall_score,
            "scores_breakdown": {
                "hard_skills": round(skills_score, 1),
                "keyword_relevance": round(keyword_score, 1),
                "ats_readability": round(ats_score, 1),
                "experience_alignment": round(exp_score, 1)
            },
            "matched_skills": matched_items,
            "missing_skills": missing_items,
            "bonus_skills": bonus_items[:10],
            "keyword_analysis": {
                "top_keywords": top_keywords,
                "jd_total_keywords": len(jd_tokens),
                "resume_total_keywords": len(resume_tokens)
            },
            "recommendations": recommendations,
            "provider_name": self.get_provider_name()
        }
