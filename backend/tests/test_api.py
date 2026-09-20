import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import init_db

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("database", data)
        self.assertEqual(data["database"]["status"], "connected")
        self.assertIn("ai_provider", data)

    def test_auth_demo_flow(self):
        # Demo login
        response = self.client.post("/api/auth/demo")
        self.assertEqual(response.status_code, 200)
        token_data = response.json()
        self.assertIn("access_token", token_data)
        token = token_data["access_token"]

        # Authenticated /me
        headers = {"Authorization": f"Bearer {token}"}
        me_resp = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["email"], "demo@omega.ai")

    def test_resume_and_match_flow(self):
        # 1. Login demo user
        login_resp = self.client.post("/api/auth/demo")
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Submit inline resume text
        resume_payload = {
            "title": "Software Engineer Resume",
            "text": "Alex Dev\nalex@example.com | 555-0199\nSkills: Python, React, FastAPI, SQL, Docker\nExperience: 4 years building web apps. Designed fast APIs."
        }
        res_resp = self.client.post("/api/resumes/parse-text", json=resume_payload, headers=headers)
        self.assertEqual(res_resp.status_code, 201)
        resume_id = res_resp.json()["id"]

        # 3. Match resume against JD
        match_payload = {
            "resume_id": resume_id,
            "job_title": "Full Stack Python/React Developer",
            "company": "Omega Tech",
            "experience_level": "Mid-Level",
            "job_description": "We are seeking a Full Stack Developer with experience in Python, FastAPI, React, TypeScript, Docker, and AWS. Must be comfortable designing clean REST APIs and stateful frontend applications."
        }
        match_resp = self.client.post("/api/analysis/match", json=match_payload, headers=headers)
        self.assertEqual(match_resp.status_code, 201)
        data = match_resp.json()
        self.assertIn("overall_score", data)
        self.assertIn("matched_skills", data)
        self.assertIn("missing_skills", data)
        self.assertIn("recommendations", data)
        self.assertGreater(data["overall_score"], 0)

        # 4. Check history
        history_resp = self.client.get("/api/analysis/history", headers=headers)
        self.assertEqual(history_resp.status_code, 200)
        self.assertGreaterEqual(len(history_resp.json()), 1)

if __name__ == "__main__":
    unittest.main()
