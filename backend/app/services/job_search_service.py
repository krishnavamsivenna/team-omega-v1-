from typing import List, Optional, Dict, Any
import re

CURATED_JOB_LISTINGS: List[Dict[str, Any]] = [
    {
        "id": "job-101",
        "title": "Senior Full Stack Engineer",
        "company": "Stripe",
        "location": "San Francisco, CA / Remote",
        "workplace_type": "Remote",
        "salary_range": "$175,000 - $225,000",
        "experience_level": "Senior (5+ yrs)",
        "required_skills": ["TypeScript", "React", "Python", "FastAPI", "PostgreSQL", "Docker"],
        "description_snippet": "Build mission-critical developer platforms and financial infrastructure. Lead end-to-end full-stack architectures.",
        "full_description": (
            "We are looking for a Senior Full Stack Engineer to architect and build mission-critical payment workflows. "
            "You will work with React, TypeScript, Python, FastAPI, and PostgreSQL to deliver high-availability distributed systems. "
            "Responsibilities include designing scalable REST and GraphQL APIs, optimizing client-side performance, and mentoring junior engineers. "
            "Qualifications: 5+ years of software engineering experience, mastery of modern frontend frameworks and distributed backend architecture."
        ),
        "posted_date": "2 days ago",
        "apply_url": "https://stripe.com/jobs"
    },
    {
        "id": "job-102",
        "title": "Staff Platform & Distributed Systems Architect",
        "company": "Datadog",
        "location": "New York, NY / Remote",
        "workplace_type": "Remote",
        "salary_range": "$210,000 - $265,000",
        "experience_level": "Staff / Lead (7+ yrs)",
        "required_skills": ["Python", "Go", "Kubernetes", "Apache Kafka", "Redis", "Distributed Systems"],
        "description_snippet": "Design next-generation real-time observability pipelines processing millions of telemetry events per second.",
        "full_description": (
            "As a Staff Platform Architect, you will own the technical roadmap for our high-throughput stream processing infrastructure. "
            "Our systems process petabytes of real-time metrics and logs using Apache Kafka, Kubernetes, Redis, and high-performance Python and Go microservices. "
            "Key duties: eliminate single points of failure, establish latency SLAs under 20ms, and institute automated failover patterns. "
            "Requirements: 7+ years building enterprise distributed systems with deep expertise in concurrency and partition fault tolerance."
        ),
        "posted_date": "Just now",
        "apply_url": "https://datadoghq.com/careers"
    },
    {
        "id": "job-103",
        "title": "AI Application & LLM Engineer",
        "company": "Anthropic",
        "location": "San Francisco, CA / Hybrid",
        "workplace_type": "Hybrid",
        "salary_range": "$190,000 - $240,000",
        "experience_level": "Mid-Senior (3-6 yrs)",
        "required_skills": ["Python", "PyTorch", "FastAPI", "Vector Databases", "LangChain", "Docker"],
        "description_snippet": "Bridge the frontier between generative AI models and intuitive developer-facing production applications.",
        "full_description": (
            "Join our applied AI team to build high-leverage generative AI applications and agentic workflows. "
            "You will interface with frontier LLMs, design retrieval-augmented generation (RAG) pipelines using vector databases (Pinecone/Milvus), "
            "and build resilient FastAPI microservices. "
            "Requirements: strong foundational software engineering in Python, hands-on experience with LLM APIs, embedding spaces, and prompt evaluation frameworks."
        ),
        "posted_date": "1 day ago",
        "apply_url": "https://anthropic.com/careers"
    },
    {
        "id": "job-104",
        "title": "Senior Frontend Infrastructure Engineer",
        "company": "Vercel",
        "location": "Remote",
        "workplace_type": "Remote",
        "salary_range": "$160,000 - $210,000",
        "experience_level": "Senior (4+ yrs)",
        "required_skills": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Web Performance", "Jest"],
        "description_snippet": "Empower millions of developers by crafting bleeding-edge web infrastructure, tooling, and UI component systems.",
        "full_description": (
            "We are seeking a Frontend Engineer obsessed with web performance, Core Web Vitals, and world-class developer experiences. "
            "You will optimize client bundle sizes, build reusable design system components in React and TypeScript, and collaborate closely with product design. "
            "Requirements: 4+ years of specialized frontend engineering, deep understanding of the browser rendering pipeline, CSS architecture, and accessibility."
        ),
        "posted_date": "3 days ago",
        "apply_url": "https://vercel.com/careers"
    },
    {
        "id": "job-105",
        "title": "Cloud DevOps & Site Reliability Engineer",
        "company": "Cloudflare",
        "location": "Austin, TX / Remote",
        "workplace_type": "Remote",
        "salary_range": "$165,000 - $215,000",
        "experience_level": "Mid-Senior (3-5 yrs)",
        "required_skills": ["Kubernetes", "Terraform", "Docker", "CI/CD Pipelines", "Linux", "Prometheus"],
        "description_snippet": "Automate multi-region cloud infrastructure and maintain 99.99% edge availability across global points of presence.",
        "full_description": (
            "Looking for an experienced DevOps / SRE to champion infrastructure-as-code and automated delivery pipelines. "
            "You will manage Kubernetes clusters across cloud providers, write modular Terraform modules, and implement Prometheus/Grafana observability. "
            "Requirements: 3+ years managing production Linux environments, container orchestration at scale, and automated zero-downtime deployment pipelines."
        ),
        "posted_date": "4 days ago",
        "apply_url": "https://cloudflare.com/careers"
    },
    {
        "id": "job-106",
        "title": "Backend Python / Microservices Developer",
        "company": "Airbnb",
        "location": "Remote",
        "workplace_type": "Remote",
        "salary_range": "$170,000 - $220,000",
        "experience_level": "Mid-Level (2-4 yrs)",
        "required_skills": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "REST APIs"],
        "description_snippet": "Engineer core reservation and messaging microservices with high transaction integrity and speed.",
        "full_description": (
            "Join our Core Commerce team to develop scalable backend services in Python and FastAPI. "
            "You will model relational databases with SQLAlchemy and PostgreSQL, optimize query indexes, and configure Redis caching. "
            "Requirements: 2+ years backend engineering experience, strong grasp of database transactions, REST conventions, and automated testing."
        ),
        "posted_date": "5 days ago",
        "apply_url": "https://airbnb.com/careers"
    }
]

def search_jobs(
    query: Optional[str] = None,
    remote_only: bool = False,
    experience_level: Optional[str] = None,
    skill_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Filters curated job listings according to query, location, level, and skill match."""
    results = []
    q_clean = (query or "").lower().strip()
    exp_clean = (experience_level or "").lower().strip()
    skill_clean = (skill_filter or "").lower().strip()

    for job in CURATED_JOB_LISTINGS:
        # Remote check
        if remote_only and job["workplace_type"].lower() != "remote":
            continue

        # Experience level filter
        if exp_clean and exp_clean not in job["experience_level"].lower():
            continue

        # Skill filter
        if skill_clean:
            skills_lower = [s.lower() for s in job["required_skills"]]
            if not any(skill_clean in s for s in skills_lower):
                continue

        # Text query check
        if q_clean:
            searchable_text = f"{job['title']} {job['company']} {job['description_snippet']} {' '.join(job['required_skills'])}".lower()
            if not any(token in searchable_text for token in q_clean.split()):
                continue

        results.append(job)

    return results
