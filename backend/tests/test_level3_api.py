import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import init_db

class TestLevel3API(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)
        # Login demo user (triggers demo seeder)
        login_resp = cls.client.post("/api/auth/demo")
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {token}"}

    def test_security_headers_present(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(resp.headers.get("x-frame-options"), "DENY")
        self.assertEqual(resp.headers.get("x-xss-protection"), "1; mode=block")

    def test_job_search(self):
        resp = self.client.get("/api/jobs/search?q=Full+Stack", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        jobs = resp.json()
        self.assertGreaterEqual(len(jobs), 1)
        j1 = jobs[0]
        self.assertIn("title", j1)
        self.assertIn("company", j1)
        self.assertIn("required_skills", j1)
        self.assertIn("salary_range", j1)

    def test_saved_jobs_crud(self):
        # 1. Save new job
        save_payload = {
            "title": "Lead Cloud Infrastructure Architect",
            "company": "Amazon Web Services",
            "location": "Seattle, WA / Remote",
            "workplace_type": "Remote",
            "salary_range": "$220,000 - $280,000",
            "status": "saved",
            "job_description": "Architect global cloud infrastructure and serverless solutions.",
            "url": "https://aws.amazon.com",
            "match_score": 88.0
        }
        res = self.client.post("/api/jobs/saved", json=save_payload, headers=self.headers)
        self.assertEqual(res.status_code, 201)
        saved_job = res.json()
        job_id = saved_job["id"]
        self.assertEqual(saved_job["status"], "saved")

        # 2. Update status to 'applied'
        patch_res = self.client.patch(
            f"/api/jobs/saved/{job_id}/status",
            json={"status": "applied"},
            headers=self.headers
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "applied")

        # 3. List saved jobs
        list_res = self.client.get("/api/jobs/saved", headers=self.headers)
        self.assertEqual(list_res.status_code, 200)
        all_jobs = list_res.json()
        self.assertTrue(any(j["id"] == job_id for j in all_jobs))

        # 4. Delete saved job
        del_res = self.client.delete(f"/api/jobs/saved/{job_id}", headers=self.headers)
        self.assertEqual(del_res.status_code, 204)

    def test_resume_version_management(self):
        # Fetch resumes
        resumes_resp = self.client.get("/api/resumes/", headers=self.headers)
        self.assertEqual(resumes_resp.status_code, 200)
        resumes = resumes_resp.json()
        self.assertGreaterEqual(len(resumes), 1)
        r = resumes[0]

        # Set as primary
        prim_resp = self.client.patch(f"/api/resumes/{r['id']}/primary", headers=self.headers)
        self.assertEqual(prim_resp.status_code, 200)
        self.assertEqual(prim_resp.json()["is_primary"], 1)

        # Update metadata
        meta_resp = self.client.patch(
            f"/api/resumes/{r['id']}/metadata",
            json={"version_tag": "v3.0 - Hackathon Final", "target_role": "Principal Engineer"},
            headers=self.headers
        )
        self.assertEqual(meta_resp.status_code, 200)
        self.assertEqual(meta_resp.json()["version_tag"], "v3.0 - Hackathon Final")
        self.assertEqual(meta_resp.json()["target_role"], "Principal Engineer")

if __name__ == "__main__":
    unittest.main()
