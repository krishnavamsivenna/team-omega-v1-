import unittest
from app.services.resume_parser import ResumeParser
from app.services.skill_taxonomy import extract_skills_from_text

SAMPLE_RESUME_TEXT = """
Jane Doe
jane.doe@example.com | (555) 123-4567 | github.com/janedoe | linkedin.com/in/janedoe

SUMMARY
Experienced Full Stack Software Engineer with 5+ years of experience building scalable distributed systems and web applications.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, Go, SQL, HTML, CSS
Frameworks: React, FastAPI, Node.js, Next.js, Django, Tailwind CSS
Databases: PostgreSQL, Redis, MongoDB
DevOps & Cloud: AWS (EC2, S3), Docker, Kubernetes, CI/CD, Git

WORK EXPERIENCE
Senior Software Engineer - Tech Solutions Inc (2021 - Present)
- Architected and deployed microservices backend using FastAPI and PostgreSQL, serving 500,000+ monthly active users.
- Led frontend refactoring to React and TypeScript, improving Core Web Vitals and reducing latency by 45%.
- Implemented automated CI/CD pipelines using GitHub Actions and Docker, accelerating release cycle by 3x.

Software Engineer - Innovatech (2019 - 2021)
- Developed RESTful APIs with Python and Django.
- Collaborated in Agile/Scrum team of 8 engineers.

EDUCATION
Bachelor of Science in Computer Science - University of California (2015 - 2019)
"""

class TestResumeParser(unittest.TestCase):
    def test_contact_parsing(self):
        contact = ResumeParser.parse_contact_info(SAMPLE_RESUME_TEXT)
        self.assertEqual(contact["email"], "jane.doe@example.com")
        self.assertIn("555", contact["phone"])
        self.assertTrue(any("github.com/janedoe" in link for link in contact["links"]))

    def test_section_detection(self):
        sections = ResumeParser.detect_sections(SAMPLE_RESUME_TEXT)
        self.assertIn("summary", sections)
        self.assertIn("skills", sections)
        self.assertIn("experience", sections)
        self.assertIn("education", sections)

    def test_skill_extraction(self):
        skills, categorized = extract_skills_from_text(SAMPLE_RESUME_TEXT)
        self.assertIn("python", skills)
        self.assertIn("react", skills)
        self.assertIn("fastapi", skills)
        self.assertIn("postgresql", skills)
        self.assertIn("docker", skills)
        self.assertIn("kubernetes", skills)
        self.assertIn("Languages", categorized)
        self.assertIn("Frameworks & Libraries", categorized)

    def test_full_parse_resume(self):
        parsed = ResumeParser.parse_resume(SAMPLE_RESUME_TEXT)
        self.assertGreater(parsed["word_count"], 50)
        self.assertIn("python", parsed["skills"])
        self.assertEqual(parsed["contact"]["email"], "jane.doe@example.com")

if __name__ == "__main__":
    unittest.main()
