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

        # Level 2 Extended Intelligence Fields
        # 9. Resume Improvements (Bullet point critiques & suggested rewrites)
        resume_improvements = []
        if high_priority_missing:
            resume_improvements.append({
                "section": "Technical Skills & Summary",
                "issue": f"Missing prominent mention of {', '.join([m['name'] for m in high_priority_missing[:2]])}",
                "suggestion": f"If you have academic or project experience with {high_priority_missing[0]['name']}, add a dedicated competency entry: 'Core Tech: {high_priority_missing[0]['name']}, ...'.",
                "example_rewrite": f"Engineered scalable services using {high_priority_missing[0]['name']} and modern best practices."
            })
        if ats_score < 80:
            resume_improvements.append({
                "section": "Professional Experience Bullets",
                "issue": "Experience statements lack quantifiable metrics or strong action verbs",
                "suggestion": "Quantify outcomes with the XYZ formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.",
                "example_rewrite": "Optimized database queries and API response latency by 35% through Redis caching and index restructuring."
            })
        if not any("github" in l.lower() or "portfolio" in l.lower() for l in (parsed_resume or {}).get("contact", {}).get("links", [])):
            resume_improvements.append({
                "section": "Contact & Profile Header",
                "issue": "No live portfolio or GitHub repository links detected",
                "suggestion": "Add direct hyperlinks to your active GitHub profile or personal tech blog to substantiate claims.",
                "example_rewrite": "GitHub: github.com/username | Portfolio: yourname.dev"
            })

        # 10. Recommended Skills
        recommended_skills = []
        for m in missing_items[:6]:
            recommended_skills.append({
                "skill": m["name"],
                "category": m["category"],
                "priority": m["importance"],
                "reason": f"Frequently required for {job_title or 'this role'}; closes key gap against competitive candidates."
            })

        # 11. Interview Focus Areas
        interview_focus_areas = []
        if matched_items:
            interview_focus_areas.append(f"Deep-dive technical questions on {', '.join([m['name'] for m in matched_items[:3]])}")
        if missing_items:
            interview_focus_areas.append(f"Conceptual trade-offs and readiness in {', '.join([m['name'] for m in missing_items[:2]])}")
        interview_focus_areas.append("System architecture, scalability, and handling high-concurrency workloads")
        interview_focus_areas.append("Cross-functional collaboration and agile sprint problem-solving")

        # 12. Personalized Application Guidance
        application_guidance = {
            "elevator_pitch": f"Full stack engineer emphasizing {', '.join([m['name'] for m in matched_items[:3]]) or 'modern software systems'} with proven aptitude for rapidly delivering robust features.",
            "cover_letter_hook": f"With hands-on experience building scalable applications with {', '.join([m['name'] for m in matched_items[:2]]) or 'modern web technologies'}, I am excited to contribute to {company or 'your team'}.",
            "strengths_to_highlight": [m["name"] for m in matched_items[:4]],
            "talking_points_for_gaps": f"When asked about {missing_items[0]['name'] if missing_items else 'new tools'}, highlight your fast learning curve and parallel experience with {matched_items[0]['name'] if matched_items else 'core frameworks'}."
        }

        # 13. Alternative Job Recommendations
        job_recommendations = []
        title_lower = (job_title or "").lower()
        if "frontend" in title_lower or "react" in title_lower:
            job_recommendations = ["Senior Frontend Engineer", "React Application Architect", "UI/UX Platform Engineer"]
        elif "backend" in title_lower or "python" in title_lower:
            job_recommendations = ["Senior Backend Developer", "API Platform Engineer", "Cloud Systems Developer"]
        elif "ai" in title_lower or "ml" in title_lower or "data" in title_lower:
            job_recommendations = ["Machine Learning Engineer", "AI Applications Developer", "Data Systems Engineer"]
        else:
            job_recommendations = [
                f"Senior {job_title or 'Software Engineer'}",
                "Full Stack Solutions Architect",
                "Product Software Engineer"
            ]

        return {
            "job_title": job_title or "Target Role",
            "company": company or "Target Organization",
            "overall_score": overall_score,
            "match_percentage": overall_score,
            "scores_breakdown": {
                "hard_skills": round(skills_score, 1),
                "keyword_relevance": round(keyword_score, 1),
                "ats_readability": round(ats_score, 1),
                "experience_alignment": round(exp_score, 1)
            },
            "matched_skills": matched_items,
            "matching_skills": matched_items,
            "missing_skills": missing_items,
            "bonus_skills": bonus_items[:10],
            "keyword_analysis": {
                "top_keywords": top_keywords,
                "jd_total_keywords": len(jd_tokens),
                "resume_total_keywords": len(resume_tokens)
            },
            "recommendations": recommendations,
            "resume_improvements": resume_improvements,
            "recommended_skills": recommended_skills,
            "interview_focus_areas": interview_focus_areas,
            "application_guidance": application_guidance,
            "job_recommendations": job_recommendations,
            "provider_name": self.get_provider_name()
        }

    def generate_interview_questions(
        self,
        job_role: str,
        experience_level: str,
        interview_type: str,
        resume_context: Optional[str] = None,
        count: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Level 1 deterministic question generator used for baseline fallback.
        Tailors questions to role, level, and interview type.
        """
        questions = []
        q_type = interview_type.lower()
        role = job_role.strip() or "Software Engineer"
        level = experience_level.strip() or "Mid-Level"

        tech_bank = [
            (
                f"Can you walk through how you would architect a high-throughput, low-latency service for a {role} position?",
                "System Architecture & Scalability",
                ["Database selection & indexing strategy", "Caching layer (Redis/Memcached)", "Horizontal scaling and load balancing", "Asynchronous task handling"]
            ),
            (
                f"In your recent projects as a {role}, how did you ensure data consistency, error resilience, and graceful degradation during network partitions?",
                "Distributed Systems & Reliability",
                ["Idempotency keys", "Database transactions / ACID guarantees", "Circuit breaker patterns", "Retry with exponential backoff"]
            ),
            (
                f"How do you approach API design, schema evolution, and backward compatibility when exposing RESTful or GraphQL endpoints?",
                "API Engineering & Contracts",
                ["API versioning approaches", "Pagination and payload optimization", "Validation and strict typing", "Security: authentication & rate limiting"]
            ),
            (
                f"Describe an instance where you identified and resolved a severe performance bottleneck or memory leak in production.",
                "Debugging & Performance Profiling",
                ["Profiling tools used", "Root cause hypothesis & testing", "Metrics measured before and after", "Preventative regression tests"]
            )
        ]

        behavioral_bank = [
            (
                "Tell me about a time you had a significant technical disagreement with a teammate or lead. How did you handle it and what was the outcome?",
                "Conflict Resolution & Collaboration",
                ["Focus on objective technical criteria", "Data/prototype driven decision making", "Respectful communication", "Commitment to team consensus"]
            ),
            (
                f"Give an example of a high-priority project with tight deadlines. How did you prioritize tasks and manage stakeholder expectations at the {level} level?",
                "Prioritization & Delivery",
                ["Breaking down deliverables into milestones", "Transparent scope negotiation", "Proactive status communication", "Successful delivery outcomes"]
            ),
            (
                "Describe a project or feature that did not go according to plan or failed in production. What did you learn and how did you adapt?",
                "Resilience & Continuous Learning",
                ["Honest ownership of the failure", "Blameless post-mortem analysis", "Actionable remediation steps instituted", "Long-term learning"]
            ),
            (
                "How do you mentor more junior engineers or advocate for engineering best practices within your team?",
                "Leadership & Mentorship",
                ["Code review best practices", "Documentation and knowledge sharing", "Fostering inclusive growth", "Pair programming experiences"]
            )
        ]

        hr_bank = [
            (
                f"Why are you specifically interested in this {role} role, and what makes our company's mission align with your career goals?",
                "Motivation & Role Alignment",
                ["Clear enthusiasm for domain problems", "Knowledge of company values", "Alignment with career aspirations", "Unique strengths brought to team"]
            ),
            (
                "How do you maintain work-life boundaries and prevent burnout in fast-paced engineering environments?",
                "Work Style & Sustainability",
                ["Time blocking and deep work habits", "Clear communication with management", "Sustainable pace in sprints", "Health and balance routines"]
            ),
            (
                f"What are your key expectations from your engineering manager and leadership as a {level} candidate?",
                "Management & Growth Fit",
                ["Desire for regular 1-on-1 feedback", "Autonomy balanced with clear goals", "Opportunities for technical impact", "Support for career progression"]
            )
        ]

        selected_pools = []
        if "tech" in q_type:
            selected_pools = [(q, cat, rub, "technical") for q, cat, rub in tech_bank]
        elif "behav" in q_type:
            selected_pools = [(q, cat, rub, "behavioral") for q, cat, rub in behavioral_bank]
        elif "hr" in q_type:
            selected_pools = [(q, cat, rub, "hr") for q, cat, rub in hr_bank]
        else:
            # Mixed
            selected_pools = [
                (tech_bank[0][0], tech_bank[0][1], tech_bank[0][2], "technical"),
                (tech_bank[1][0], tech_bank[1][1], tech_bank[1][2], "technical"),
                (behavioral_bank[0][0], behavioral_bank[0][1], behavioral_bank[0][2], "behavioral"),
                (hr_bank[0][0], hr_bank[0][1], hr_bank[0][2], "hr"),
            ]

        for idx, (question_text, category, criteria, item_type) in enumerate(selected_pools[:count]):
            questions.append({
                "id": idx + 1,
                "question_text": question_text,
                "question_type": item_type,
                "category": category,
                "expected_criteria": criteria
            })

        return questions

    def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        job_role: str,
        experience_level: str,
        interview_type: str
    ) -> Dict[str, Any]:
        """
        Level 1 deterministic heuristic evaluation for interview answers.
        """
        text = (answer or "").strip()
        words = text.split()
        word_count = len(words)

        # Baseline metrics calculation
        # 1. Relevance: checking overlap with question keywords
        q_tokens = set(re.findall(r"\b[a-zA-Z]{4,}\b", question.lower()))
        ans_tokens = set(re.findall(r"\b[a-zA-Z]{4,}\b", text.lower()))
        overlap = len(q_tokens.intersection(ans_tokens))
        rel_score = min(96.0, max(35.0, 50.0 + (overlap * 9.0)))

        # 2. Completeness: word count heuristic (optimal 100-350 words)
        if word_count < 30:
            comp_score = 40.0
            comp_feedback = "Answer is very brief; elaborate with concrete details, context, and outcomes."
        elif word_count < 80:
            comp_score = 68.0
            comp_feedback = "Adequate start, but expanding on specific technical implementation details would strengthen your case."
        elif word_count <= 400:
            comp_score = 92.0
            comp_feedback = "Strong, comprehensive depth covering context, execution, and outcomes."
        else:
            comp_score = 80.0
            comp_feedback = "Thorough response, though practicing slightly more concise framing will prevent interviewer fatigue."

        # 3. Technical Correctness: check technical keywords and clarity
        tech_hits = len([w for w in ans_tokens if w in {
            "database", "api", "cache", "service", "scale", "performance", "test",
            "docker", "kubernetes", "sql", "architecture", "latency", "async", "schema"
        }])
        tech_score = min(95.0, max(45.0, 55.0 + (tech_hits * 8.0)))
        tech_feedback = (
            "Demonstrated sound technical understanding of core principles."
            if tech_score >= 75 else
            "Consider mentioning specific architectural trade-offs, technologies, and metrics."
        )

        # 4. Communication: check structure and action verbs
        star_indicators = sum(1 for term in ["situation", "task", "action", "result", "because", "therefore", "led", "built", "implemented"] if term in text.lower())
        comm_score = min(95.0, max(50.0, 60.0 + (star_indicators * 5.0)))
        comm_feedback = (
            "Well-structured answer with good narrative flow."
            if comm_score >= 75 else
            "Use the STAR method (Situation, Task, Action, Result) to give your response clearer structure."
        )

        overall = round((rel_score * 0.30) + (tech_score * 0.30) + (comm_score * 0.20) + (comp_score * 0.20), 1)

        strengths = []
        if word_count >= 60:
            strengths.append("Provided substantive context rather than a one-line answer.")
        if tech_hits >= 2:
            strengths.append("Referenced concrete engineering concepts and domain terminology.")
        if star_indicators >= 2:
            strengths.append("Logical progression from problem statement to solution.")
        if not strengths:
            strengths.append("Addressed the primary intent of the question.")

        weaknesses = []
        if word_count < 75:
            weaknesses.append("Lacked quantitative metrics or measurable business outcomes.")
        if tech_hits < 2:
            weaknesses.append("Did not explicitly discuss architectural trade-offs or alternative options.")
        if not weaknesses:
            weaknesses.append("Could further highlight what you specifically learned from the experience.")

        suggestions = [
            "Structure your answer using the STAR format: briefly state the context, describe your exact role, outline technical steps taken, and quantify results.",
            "Cite measurable metrics (e.g., 'reduced latency by 30%', 'handled 5k req/sec', 'saved 4 engineering hours weekly').",
            "Acknowledge trade-offs: explain why you chose your specific approach over alternative solutions."
        ]

        improved_answer = (
            f"In my previous role as a {job_role}, I faced a similar challenge when architecting a mission-critical service. "
            f"First, I analyzed the requirements and constraints, prioritizing low latency and high availability. "
            f"I implemented an asynchronous service using clear API contracts, structured database indexing, and an in-memory Redis cache for read-heavy operations. "
            f"To handle failure cases, I instituted retries with exponential backoff and circuit breakers. "
            f"As a result, we reduced endpoint response times by 40%, maintained 99.9% uptime during traffic surges, and simplified ongoing maintenance for the engineering team."
        )

        return {
            "relevance": {"score": round(rel_score, 1), "feedback": "Answer directly addressed the core prompt."},
            "technical_correctness": {"score": round(tech_score, 1), "feedback": tech_feedback},
            "communication": {"score": round(comm_score, 1), "feedback": comm_feedback},
            "completeness": {"score": round(comp_score, 1), "feedback": comp_feedback},
            "overall_score": overall,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "improved_answer": improved_answer
        }

    def generate_learning_roadmap(
        self,
        skill_gaps: List[str],
        target_role: str,
        current_skills: Optional[List[str]] = None,
        timeframe_weeks: int = 8
    ) -> Dict[str, Any]:
        """
        Level 1 deterministic roadmap generator for baseline fallback.
        """
        gaps = [g.title() for g in skill_gaps] if skill_gaps else ["Distributed Systems", "Cloud DevOps", "System Design"]
        weeks_per_phase = max(2, timeframe_weeks // 3)

        phases = [
            {
                "phase_number": 1,
                "title": "Foundations & Core Tooling",
                "duration": f"Weeks 1-{weeks_per_phase}",
                "goal": f"Establish working proficiency in {gaps[0] if gaps else 'Core Technologies'}.",
                "skills_covered": gaps[:2],
                "topics": [
                    f"Core syntax, lifecycle, and operational fundamentals of {gaps[0] if gaps else 'Target Stack'}",
                    "Local development environment, debugging, and unit testing setup",
                    "Basic architectural patterns and official design conventions"
                ],
                "projects_to_build": [
                    f"Build a standalone CLI or REST microservice demonstrating {gaps[0] if gaps else 'Core Concepts'}",
                    "Implement end-to-end automated test suites with 80%+ coverage"
                ],
                "resources": [
                    {"title": f"Official {gaps[0] if gaps else 'Technology'} Documentation", "type": "documentation", "url_or_query": f"https://devdocs.io or official docs for {gaps[0] if gaps else 'tech'}"},
                    {"title": "FreeCodeCamp & GitHub Awesome Curations", "type": "course", "url_or_query": f"github.com/topics/{gaps[0].lower() if gaps else 'programming'}"}
                ],
                "action_checklist": [
                    f"Complete official {gaps[0] if gaps else 'technology'} getting-started tutorial",
                    "Create a public GitHub repository with comprehensive README",
                    "Configure automated CI/CD pipeline on repository commits"
                ]
            },
            {
                "phase_number": 2,
                "title": "Advanced Application & Systems Integration",
                "duration": f"Weeks {weeks_per_phase + 1}-{weeks_per_phase * 2}",
                "goal": f"Master integration of {gaps[1] if len(gaps) > 1 else 'Scalable Infrastructure'} with real-world workloads.",
                "skills_covered": gaps[1:3] if len(gaps) > 1 else gaps[:1],
                "topics": [
                    "Asynchronous communication, message queuing, and state management",
                    "Containerization, orchestration, and environment parity",
                    "Performance benchmarking and load testing under stress"
                ],
                "projects_to_build": [
                    f"Full-stack prototype integrating {gaps[1] if len(gaps) > 1 else gaps[0]} with a persistent database",
                    "Dockerized multi-container setup with automated health checks"
                ],
                "resources": [
                    {"title": "System Design Primer by Donne Martin", "type": "interactive", "url_or_query": "github.com/donnemartin/system-design-primer"},
                    {"title": "Designing Data-Intensive Applications (Book Summary)", "type": "documentation", "url_or_query": "Martin Kleppmann DDIA architectural notes"}
                ],
                "action_checklist": [
                    "Benchmark throughput and identify system bottlenecks",
                    "Publish a technical blog post or LinkedIn walkthrough of your implementation"
                ]
            },
            {
                "phase_number": 3,
                "title": "Production Readiness & Interview Capstone",
                "duration": f"Weeks {weeks_per_phase * 2 + 1}-{timeframe_weeks}",
                "goal": f"Showcase production-ready portfolio project tailored for {target_role}.",
                "skills_covered": gaps,
                "topics": [
                    "Production observability: structured logging, metrics, and alerting",
                    "Security best practices, secret management, and rate limiting",
                    "Technical interview articulation and architecture defense"
                ],
                "projects_to_build": [
                    f"Capstone Production Service for {target_role}: deployed to cloud with custom domain, monitoring dashboard, and architecture diagram"
                ],
                "resources": [
                    {"title": "Google Cloud Architecture Framework / AWS Well-Architected", "type": "documentation", "url_or_query": "cloud.google.com/architecture/framework"},
                    {"title": "Tech Interview Handbook", "type": "interactive", "url_or_query": "techinterviewhandbook.org"}
                ],
                "action_checklist": [
                    "Deploy live demonstration accessible to recruiters",
                    "Update resume bullet points with new skills and measurable project achievements",
                    "Simulate 3 technical mock interview rounds with OMEGA"
                ]
            }
        ]

        return {
            "target_role": target_role,
            "summary": f"A targeted {timeframe_weeks}-week curriculum designed to close your primary competency gaps ({', '.join(gaps[:3])}) and qualify you for {target_role} roles.",
            "estimated_weeks": timeframe_weeks,
            "phases": phases
        }

