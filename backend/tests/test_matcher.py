import unittest
from app.services.baseline_matcher import BaselineNLPProvider
from app.services.resume_parser import ResumeParser

SAMPLE_RESUME = """
Jane Doe
jane.doe@example.com | (555) 123-4567 | github.com/janedoe

Skills: Python, TypeScript, React, FastAPI, PostgreSQL, Docker, AWS, Git
Experience: 5+ years of experience building web applications.
Architected backend microservices in Python and FastAPI. Built responsive frontend in React.
Reduced page load times by 40% and handled 10,000 requests per second.
Education: B.S. Computer Science
"""

SAMPLE_JOB_DESC = """
Job Title: Senior Backend Engineer
Requirements:
- 4+ years of professional software development experience.
- Strong proficiency in Python, FastAPI, and PostgreSQL.
- Experience with Docker, Kubernetes, and AWS cloud infrastructure.
- Familiarity with Terraform and Kafka for distributed messaging.
- Solid background in REST APIs and unit testing.
"""

class TestBaselineMatcher(unittest.TestCase):
    def setUp(self):
        self.matcher = BaselineNLPProvider()
        self.parsed_resume = ResumeParser.parse_resume(SAMPLE_RESUME)

    def test_matching_logic(self):
        result = self.matcher.analyze_job_fit(
            resume_text=SAMPLE_RESUME,
            job_text=SAMPLE_JOB_DESC,
            parsed_resume=self.parsed_resume,
            job_title="Senior Backend Engineer",
            company="Tech Corp"
        )

        # Check overall score bounds
        self.assertGreater(result["overall_score"], 40.0)
        self.assertLessEqual(result["overall_score"], 100.0)

        # Check matched skills contain Python, FastAPI, PostgreSQL, Docker, AWS
        matched_names = [s["name"].lower() for s in result["matched_skills"]]
        self.assertIn("python", matched_names)
        self.assertIn("fastapi", matched_names)
        self.assertIn("postgresql", matched_names)
        self.assertIn("docker", matched_names)
        self.assertIn("aws", matched_names)

        # Check missing skills contain Kubernetes, Terraform, Kafka
        missing_names = [s["name"].lower() for s in result["missing_skills"]]
        self.assertIn("kubernetes", missing_names)
        self.assertIn("terraform", missing_names)
        self.assertIn("kafka", missing_names)

        # Check recommendations are generated
        self.assertGreaterEqual(len(result["recommendations"]), 1)

        # Check score breakdowns exist
        self.assertIn("hard_skills", result["scores_breakdown"])
        self.assertIn("keyword_relevance", result["scores_breakdown"])
        self.assertIn("ats_readability", result["scores_breakdown"])

if __name__ == "__main__":
    unittest.main()
