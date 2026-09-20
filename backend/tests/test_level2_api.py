import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import init_db

class TestLevel2API(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)
        # Login demo user
        login_resp = cls.client.post("/api/auth/demo")
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {token}"}

    def test_extended_analysis_response(self):
        match_payload = {
            "resume_text": (
                "Jane Doe\njane@example.com | 555-1234\n"
                "Skills: Python, FastAPI, React, SQL, Git\n"
                "Experience: 3 years building web platforms and REST APIs."
            ),
            "job_title": "Full Stack Engineer",
            "company": "NextGen Software",
            "experience_level": "Mid-Level",
            "job_description": (
                "Looking for a Full Stack Engineer proficient in Python, FastAPI, React, "
                "TypeScript, Kubernetes, and AWS Cloud infrastructure."
            )
        }
        res = self.client.post("/api/analysis/match", json=match_payload, headers=self.headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()

        # Verify Level 2 fields
        self.assertIn("match_percentage", data)
        self.assertIn("matching_skills", data)
        self.assertIn("resume_improvements", data)
        self.assertIn("recommended_skills", data)
        self.assertIn("interview_focus_areas", data)
        self.assertIn("application_guidance", data)
        self.assertIn("job_recommendations", data)

        # Confirm data content
        self.assertGreater(data["match_percentage"], 0)
        self.assertIsInstance(data["resume_improvements"], list)
        self.assertIsInstance(data["interview_focus_areas"], list)
        self.assertIn("elevator_pitch", data["application_guidance"])

    def test_mock_interview_flow(self):
        # 1. Generate interview session
        gen_payload = {
            "job_role": "Backend Engineer",
            "experience_level": "Mid-Level (2-4 yrs)",
            "interview_type": "technical",
            "question_count": 3
        }
        gen_resp = self.client.post("/api/interview/generate", json=gen_payload, headers=self.headers)
        self.assertEqual(gen_resp.status_code, 201)
        session_data = gen_resp.json()
        self.assertIn("id", session_data)
        session_id = session_data["id"]
        questions = session_data["questions"]
        self.assertEqual(len(questions), 3)
        q1 = questions[0]
        self.assertIn("question_text", q1)

        # 2. Submit candidate answer
        eval_payload = {
            "session_id": session_id,
            "question_id": q1["id"],
            "user_answer": (
                "When scaling a backend service, I employ database connection pooling, "
                "Redis caching for hot entities, asynchronous background workers using Celery/RabbitMQ, "
                "and horizontal pod autoscaling behind an ingress load balancer."
            )
        }
        eval_resp = self.client.post("/api/interview/evaluate", json=eval_payload, headers=self.headers)
        self.assertEqual(eval_resp.status_code, 200)
        eval_data = eval_resp.json()
        self.assertIsNotNone(eval_data["score"])
        self.assertIsNotNone(eval_data["evaluation"])
        ev = eval_data["evaluation"]
        self.assertIn("relevance", ev)
        self.assertIn("technical_correctness", ev)
        self.assertIn("communication", ev)
        self.assertIn("completeness", ev)
        self.assertIn("improved_answer", ev)

        # 3. Retrieve session details
        detail_resp = self.client.get(f"/api/interview/sessions/{session_id}", headers=self.headers)
        self.assertEqual(detail_resp.status_code, 200)
        detail = detail_resp.json()
        self.assertIsNotNone(detail["overall_score"])

        # 4. Check interview history
        hist_resp = self.client.get("/api/interview/history", headers=self.headers)
        self.assertEqual(hist_resp.status_code, 200)
        history = hist_resp.json()
        self.assertGreaterEqual(len(history), 1)

    def test_learning_roadmap_flow(self):
        # 1. Generate roadmap
        roadmap_payload = {
            "target_role": "Cloud DevOps Architect",
            "skill_gaps": ["Terraform", "Kubernetes", "CI/CD Pipelines", "Observability"],
            "current_skills": ["Linux", "Python", "Docker"],
            "timeframe_weeks": 8
        }
        gen_resp = self.client.post("/api/roadmap/generate", json=roadmap_payload, headers=self.headers)
        self.assertEqual(gen_resp.status_code, 201)
        roadmap = gen_resp.json()
        self.assertIn("id", roadmap)
        roadmap_id = roadmap["id"]
        self.assertEqual(roadmap["target_role"], "Cloud DevOps Architect")
        self.assertIn("phases", roadmap["roadmap_data"])
        phases = roadmap["roadmap_data"]["phases"]
        self.assertGreaterEqual(len(phases), 3)

        # 2. Get roadmap by ID
        get_resp = self.client.get(f"/api/roadmap/{roadmap_id}", headers=self.headers)
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()["id"], roadmap_id)

        # 3. Get roadmap history
        hist_resp = self.client.get("/api/roadmap/history", headers=self.headers)
        self.assertEqual(hist_resp.status_code, 200)
        self.assertGreaterEqual(len(hist_resp.json()), 1)

if __name__ == "__main__":
    unittest.main()
