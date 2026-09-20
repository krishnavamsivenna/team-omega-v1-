import logging
import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.resume import Resume, JobDescription
from app.models.analysis import AnalysisResult
from app.models.interview import InterviewSession, InterviewQuestionAnswer
from app.models.roadmap import LearningRoadmap
from app.models.job_opportunity import JobOpportunity
from app.services.ai_provider import get_ai_provider

logger = logging.getLogger(__name__)

def seed_demo_data(user: User, db: Session) -> None:
    """
    Seeds comprehensive, realistic demo data for the demo user if their account
    has no resumes or analyses. Ensures hackathon judges immediately encounter
    an active, vibrant workspace with realistic history and metrics.
    """
    existing_resumes = db.query(Resume).filter(Resume.user_id == user.id).count()
    if existing_resumes > 0:
        return  # Already seeded or user has active data

    logger.info("Seeding realistic hackathon demo data for demo user...")

    # 1. Seed Two Resumes
    resume1_text = (
        "Alex Demo\n"
        "alex.demo@omega.ai | (415) 555-0199 | github.com/alexdemo | linkedin.com/in/alexdemo\n\n"
        "SUMMARY\n"
        "Senior Full Stack & Systems Engineer with 6 years of experience architecting high-availability web applications, "
        "REST APIs, and distributed event pipelines. Proven track record reducing endpoint latency by 40% and deploying "
        "scalable containerized services.\n\n"
        "TECHNICAL SKILLS\n"
        "Languages: Python, TypeScript, JavaScript, SQL, Go\n"
        "Frameworks: FastAPI, React, Node.js, Express, Next.js, Flask\n"
        "Databases: PostgreSQL, Redis, MongoDB\n"
        "DevOps & Cloud: Docker, Kubernetes, AWS (S3, EC2), CI/CD GitHub Actions, Linux\n"
        "Architecture: Microservices, RESTful APIs, Asynchronous Messaging, System Design\n\n"
        "PROFESSIONAL EXPERIENCE\n"
        "Senior Full Stack Engineer | CloudTech Solutions (2022 - Present)\n"
        "- Engineered real-time customer analytics portal using React 19, TypeScript, and FastAPI, handling 15M daily requests.\n"
        "- Architected Redis caching layer that decreased p99 database query response latency by 45%.\n"
        "- Instituted automated CI/CD pipeline using GitHub Actions, cutting production deployment rollback rates to under 1%.\n"
        "- Mentored 4 junior engineers in code review practices, unit testing with Pytest, and REST design patterns.\n\n"
        "Full Stack Developer | Nexa Innovations (2019 - 2022)\n"
        "- Developed modular microservices using Python, Flask, PostgreSQL, and Docker container clusters.\n"
        "- Built responsive, accessible UI dashboards in React and Tailwind CSS for 40,000 active business clients.\n"
        "- Migrated legacy monolithic backend into decoupled RESTful services with zero scheduled downtime.\n\n"
        "EDUCATION\n"
        "B.S. in Computer Science | University of California, Berkeley (2015 - 2019)"
    )

    from app.services.resume_parser import ResumeParser
    parsed1 = ResumeParser.parse_resume(resume1_text)

    r1 = Resume(
        user_id=user.id,
        filename="Alex_Demo_Senior_FullStack_2026.pdf",
        file_path="demo://Alex_Demo_Senior_FullStack_2026.pdf",
        file_type="pdf",
        file_size=184320,
        raw_text=resume1_text,
        parsed_data=parsed1,
        is_primary=1,
        target_role="Senior Full Stack Engineer",
        version_tag="v2.1 - Cloud & FastAPI Emphasis"
    )

    resume2_text = (
        "Alex Demo\n"
        "alex.demo@omega.ai | (415) 555-0199\n\n"
        "BACKEND & DISTRIBUTED SYSTEMS PROFILE\n"
        "Core competencies: Python, Go, Microservices, PostgreSQL, Distributed Caching, Docker, Kubernetes.\n"
        "Specialized in backend transaction consistency, asynchronous background workers, and low-latency API architecture."
    )
    parsed2 = ResumeParser.parse_resume(resume2_text)

    r2 = Resume(
        user_id=user.id,
        filename="Alex_Demo_Backend_Architect.docx",
        file_path="demo://Alex_Demo_Backend_Architect.docx",
        file_type="docx",
        file_size=92160,
        raw_text=resume2_text,
        parsed_data=parsed2,
        is_primary=0,
        target_role="Staff Platform Architect",
        version_tag="v1.4 - Distributed Systems"
    )

    db.add(r1)
    db.add(r2)
    db.flush()

    # 2. Seed Job Descriptions & Match Analyses
    ai = get_ai_provider()

    # Match 1: Stripe - Senior Full Stack Engineer (High Match ~85%)
    jd1_text = (
        "Stripe is hiring a Senior Full Stack Engineer to architect high-reliability payment systems. "
        "Requirements: 5+ years of experience with Python, FastAPI, React, TypeScript, PostgreSQL, and Docker. "
        "Must have strong understanding of API design, distributed architecture, and stateful web applications."
    )
    jd1 = JobDescription(
        user_id=user.id,
        title="Senior Full Stack Engineer",
        company="Stripe",
        experience_level="Senior (5+ yrs)",
        raw_text=jd1_text,
        parsed_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker"]
    )
    db.add(jd1)
    db.flush()

    analysis1_data = ai.analyze_job_fit(
        resume_text=resume1_text,
        job_text=jd1_text,
        parsed_resume=parsed1,
        job_title="Senior Full Stack Engineer",
        company="Stripe"
    )
    analysis1 = AnalysisResult(
        user_id=user.id,
        resume_id=r1.id,
        job_id=jd1.id,
        job_title="Senior Full Stack Engineer",
        company="Stripe",
        overall_score=85.2,
        scores_breakdown={
            "hard_skills": 88.0,
            "keyword_relevance": 84.0,
            "ats_readability": 90.0,
            "experience_alignment": 82.0
        },
        matched_skills=analysis1_data["matched_skills"],
        missing_skills=analysis1_data["missing_skills"],
        bonus_skills=analysis1_data.get("bonus_skills", []),
        keyword_analysis=analysis1_data.get("keyword_analysis", {}),
        recommendations=analysis1_data["recommendations"],
        resume_improvements=analysis1_data.get("resume_improvements", []),
        recommended_skills=analysis1_data.get("recommended_skills", []),
        interview_focus_areas=analysis1_data.get("interview_focus_areas", []),
        application_guidance=analysis1_data.get("application_guidance", {}),
        job_recommendations=analysis1_data.get("job_recommendations", []),
        provider_name="OMEGA Multi-Provider AI (Demo Seeded)"
    )
    db.add(analysis1)

    # Match 2: Datadog - Staff Platform Architect (~72%)
    jd2_text = (
        "Datadog is seeking a Staff Platform Architect to lead telemetry stream processing. "
        "Must have deep expertise in Kubernetes, Apache Kafka, Redis, Distributed Systems, and High-Throughput Python or Go."
    )
    jd2 = JobDescription(
        user_id=user.id,
        title="Staff Platform & Distributed Systems Architect",
        company="Datadog",
        experience_level="Staff (7+ yrs)",
        raw_text=jd2_text,
        parsed_skills=["Kubernetes", "Apache Kafka", "Redis", "Distributed Systems", "Python", "Go"]
    )
    db.add(jd2)
    db.flush()

    analysis2_data = ai.analyze_job_fit(
        resume_text=resume1_text,
        job_text=jd2_text,
        parsed_resume=parsed1,
        job_title="Staff Platform & Distributed Systems Architect",
        company="Datadog"
    )
    analysis2 = AnalysisResult(
        user_id=user.id,
        resume_id=r1.id,
        job_id=jd2.id,
        job_title="Staff Platform & Distributed Systems Architect",
        company="Datadog",
        overall_score=71.8,
        scores_breakdown={
            "hard_skills": 68.0,
            "keyword_relevance": 72.0,
            "ats_readability": 88.0,
            "experience_alignment": 65.0
        },
        matched_skills=analysis2_data["matched_skills"],
        missing_skills=analysis2_data["missing_skills"],
        bonus_skills=analysis2_data.get("bonus_skills", []),
        keyword_analysis=analysis2_data.get("keyword_analysis", {}),
        recommendations=analysis2_data["recommendations"],
        resume_improvements=analysis2_data.get("resume_improvements", []),
        recommended_skills=analysis2_data.get("recommended_skills", []),
        interview_focus_areas=analysis2_data.get("interview_focus_areas", []),
        application_guidance=analysis2_data.get("application_guidance", {}),
        job_recommendations=analysis2_data.get("job_recommendations", []),
        provider_name="OMEGA Multi-Provider AI (Demo Seeded)"
    )
    db.add(analysis2)

    # 3. Seed Mock Interview Sessions
    sess1 = InterviewSession(
        user_id=user.id,
        job_role="Senior Full Stack Engineer",
        experience_level="Senior (5+ yrs)",
        interview_type="technical",
        overall_score=87.5
    )
    db.add(sess1)
    db.flush()

    qa1 = InterviewQuestionAnswer(
        session_id=sess1.id,
        question_text="How would you design a fault-tolerant payment ingestion service handling unpredictable spikes in checkout traffic?",
        question_type="technical",
        category="System Architecture & Scalability",
        expected_criteria=["Asynchronous message buffer / queue", "Idempotency tokens", "Circuit breakers", "Database write buffering"],
        user_answer=(
            "I would architect the ingestion API to immediately validate the request schema and assign a client-supplied idempotency key. "
            "Instead of writing synchronously to the primary database, the request is published to an Apache Kafka or RabbitMQ event queue. "
            "Downstream worker pools ingest and process payment transactions at a controlled rate, utilizing Redis for fast duplicate checking. "
            "For downstream payment gateway calls, I institute circuit breakers and exponential backoff retry policies."
        ),
        evaluation={
            "relevance": {"score": 92.0, "feedback": "Directly tackled high-throughput checkout spikes and reliability."},
            "technical_correctness": {"score": 90.0, "feedback": "Excellent architectural patterns utilizing idempotency, message brokers, and circuit breakers."},
            "communication": {"score": 85.0, "feedback": "Well-structured progression from edge ingestion to worker processing."},
            "completeness": {"score": 83.0, "feedback": "Covered ingestion, storage, and third-party gateway resilience."},
            "overall_score": 87.5,
            "strengths": [
                "Accurate invocation of idempotency keys to prevent duplicate billing.",
                "Separation of edge ingestion from background processing via message queuing."
            ],
            "weaknesses": [
                "Could briefly detail database replica failover or dead-letter queue auditing."
            ],
            "suggestions": [
                "Mention concrete metrics from your past projects, such as handling 5,000 req/sec or maintaining 99.99% uptime."
            ],
            "improved_answer": (
                "In my previous work at CloudTech, I architected our ingestion gateway with a strict three-tier resilience pattern: "
                "1. Fast Edge Validation: The REST endpoint validates payloads, verifies an X-Idempotency-Key header against an in-memory Redis cluster, and responds with HTTP 202 Accepted within 15ms. "
                "2. Decoupled Buffer: The payload is published to partitioned Kafka topics, protecting our PostgreSQL transactional database from saturation during 10x traffic surges. "
                "3. Resilient Processing: Dedicated Celery consumer pools process transactions with circuit breakers and dead-letter queues. This architecture sustained 12,000 events/sec with zero dropped transactions."
            )
        },
        score=87.5
    )
    db.add(qa1)

    # 4. Seed Learning Roadmap
    roadmap_data = {
        "target_role": "Staff Platform & Distributed Systems Architect",
        "summary": "An 8-week mastery curriculum designed to close critical gaps in Apache Kafka event streaming, Kubernetes cluster management, and distributed systems consensus.",
        "estimated_weeks": 8,
        "phases": [
            {
                "phase_number": 1,
                "title": "Distributed Messaging & Stream Fundamentals",
                "duration": "Weeks 1-3",
                "goal": "Master Apache Kafka event architecture, partitioning strategies, and consumer group offset management.",
                "skills_covered": ["Apache Kafka", "Event-Driven Architecture", "Zookeeper / KRaft"],
                "topics": [
                    "Topic partitioning, replication factors, and consumer group rebalancing",
                    "Idempotent producers, transactional messaging, and exactly-once semantics",
                    "Building asynchronous consumers in Python with aiokafka"
                ],
                "projects_to_build": [
                    "High-throughput financial ledger event stream with dead-letter queue recovery"
                ],
                "resources": [
                    {"title": "Kafka: The Definitive Guide (O'Reilly)", "type": "documentation", "url_or_query": "https://www.confluent.io/resources/kafka-the-definitive-guide/"},
                    {"title": "Distributed Systems Primer by Donne Martin", "type": "interactive", "url_or_query": "https://github.com/donnemartin/system-design-primer"}
                ],
                "action_checklist": [
                    "Spin up a 3-broker local Kafka cluster using Docker Compose",
                    "Benchmark producer throughput exceeding 10,000 records/second",
                    "Implement transactional consumer with automatic dead-letter routing"
                ]
            },
            {
                "phase_number": 2,
                "title": "Cloud Native Orchestration & Zero-Downtime Deployments",
                "duration": "Weeks 4-6",
                "goal": "Gain production proficiency in Kubernetes ingress controllers, HPA, and Helm packaging.",
                "skills_covered": ["Kubernetes", "Helm", "Horizontal Pod Autoscaling"],
                "topics": [
                    "Pod lifecycle, readiness vs liveness probes, and resource requests/limits",
                    "Configuring custom metric autoscalers based on queue depth",
                    "Zero-downtime rolling updates and blue/green traffic splitting"
                ],
                "projects_to_build": [
                    "Containerized multi-service platform with automatic autoscaling under load"
                ],
                "resources": [
                    {"title": "Official Kubernetes Documentation", "type": "documentation", "url_or_query": "https://kubernetes.io/docs/home/"}
                ],
                "action_checklist": [
                    "Deploy FastAPI microservices to local Minikube or Kind cluster",
                    "Write Helm chart with parameterized environment values",
                    "Simulate pod crash and verify self-healing recovery"
                ]
            },
            {
                "phase_number": 3,
                "title": "Production Observability & Architecture Defense Capstone",
                "duration": "Weeks 7-8",
                "goal": "Build an end-to-end portfolio capstone and defend architectural trade-offs in interviews.",
                "skills_covered": ["Distributed Tracing", "OpenTelemetry", "System Design"],
                "topics": [
                    "Distributed tracing with OpenTelemetry and Jaeger",
                    "SLAs, SLOs, and error budgets for mission-critical services",
                    "Whiteboard system design articulation for staff engineer interviews"
                ],
                "projects_to_build": [
                    "Staff Capstone: Real-Time Event Pipeline with Jaeger Distributed Tracing and Grafana Dashboards"
                ],
                "resources": [
                    {"title": "Designing Data-Intensive Applications by Martin Kleppmann", "type": "documentation", "url_or_query": "https://dataintensive.net/"}
                ],
                "action_checklist": [
                    "Publish capstone project repository with architecture diagrams to GitHub",
                    "Simulate 2 staff-level technical mock interview rounds on OMEGA"
                ]
            }
        ]
    }

    roadmap = LearningRoadmap(
        user_id=user.id,
        analysis_id=analysis2.id,
        target_role="Staff Platform & Distributed Systems Architect",
        skill_gaps=["Kubernetes", "Apache Kafka", "Redis Distributed Caching"],
        roadmap_data=roadmap_data
    )
    db.add(roadmap)

    # 5. Seed Saved Job Opportunities
    jobs_to_seed = [
        JobOpportunity(
            user_id=user.id,
            title="Senior Full Stack Engineer",
            company="Stripe",
            location="San Francisco, CA / Remote",
            workplace_type="Remote",
            salary_range="$175,000 - $225,000",
            status="interviewing",
            job_description=jd1_text,
            url="https://stripe.com/jobs",
            match_score=85.2
        ),
        JobOpportunity(
            user_id=user.id,
            title="Staff Platform & Distributed Systems Architect",
            company="Datadog",
            location="New York, NY / Remote",
            workplace_type="Remote",
            salary_range="$210,000 - $265,000",
            status="applied",
            job_description=jd2_text,
            url="https://datadoghq.com/careers",
            match_score=71.8
        ),
        JobOpportunity(
            user_id=user.id,
            title="AI Application & LLM Engineer",
            company="Anthropic",
            location="San Francisco, CA / Hybrid",
            workplace_type="Hybrid",
            salary_range="$190,000 - $240,000",
            status="saved",
            job_description="Join applied AI team building LLM pipelines, RAG systems, and FastAPI microservices.",
            url="https://anthropic.com/careers",
            match_score=63.8
        )
    ]
    for j in jobs_to_seed:
        db.add(j)

    db.commit()
    logger.info("Demo user data seeded successfully with realistic resumes, analyses, interviews, and jobs.")
