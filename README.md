# OMEGA • AI Job Application & Interview Coach
### Level 3: Hackathon Finalization Edition

> **OMEGA** is an enterprise-grade, full-stack AI career coaching command center. It bridges the critical gap between candidate resumes and modern job requirements through deterministic NLP skill analysis, multi-provider LLM reasoning, interactive visual analytics, speech-enabled mock interviews, and automated learning roadmaps.

---

## 🚀 What's New in Level 3 (Hackathon Highlights)

| Feature Area | Level 3 Enhancement |
|---|---|
| **Executive Command Center** | Career Readiness composite gauge, active primary resume switching, and real-time metric counters. |
| **Interactive SVG Visualizations** | Pure-SVG **Candidate Competence Radar Chart**, **Match Score Trajectory Sparkline**, and **Categorized Skill Gap Bar Chart**. |
| **Jobs Board & Pipeline Tracker** | `/jobs` board with real-time tech job search, filtering (remote, experience, skills), and 5-stage status pipeline (`saved`, `applied`, `interviewing`, `offer`, `rejected`). |
| **Resume Versioning** | Support for multiple target role profiles, version tags (e.g. `v2.1 - Cloud & FastAPI`), and 1-click primary version toggling. |
| **Theme System** | Instant Dark/Light mode toggle with `localStorage` persistence and zero-flicker CSS transitions. |
| **Activity Feed & Notifications** | In-app notification center bell with unread badge counter, direct navigation links, and mark-all-read capability. |
| **Voice Dictation** | Microphone speech-to-text dictation in AI Mock Interviews using the Web Speech API. |
| **One-Click Demo Account** | Instant judge evaluation with pre-seeded resumes, realistic analyses, mock interview transcripts, and active job opportunities. |
| **Containerization** | Production-ready `Dockerfile` for backend & frontend, plus `docker-compose.yml` with PostgreSQL 16. |
| **Security & Resilience** | HTTP security headers (`nosniff`, `DENY`, `mode=block`, `strict-origin-when-cross-origin`), React `ErrorBoundary`, and skeleton loaders. |

---

## 🏗️ Architecture Overview

```
OMEGA Architecture (Level 3)
├── Frontend (React 19 + TypeScript + Vite + Tailwind CSS v4)
│   ├── Navigation & Notification Center (Theme Switcher + Unread Feed)
│   ├── Executive Dashboard (/dashboard)
│   │   ├── Career Readiness Metric Gauge (Composite 0-100%)
│   │   ├── Multidimensional Competence RadarChart (Pure SVG)
│   │   ├── Match Trajectory Sparkline Area Chart (Pure SVG)
│   │   └── Resume Version & Target Profile Manager
│   ├── Jobs Board & Pipeline (/jobs)
│   │   ├── Search & Filter Engine (Remote, Seniority, Tech Stack)
│   │   └── Drag-and-drop / Status Pipeline (Saved → Applied → Interviewing → Offer)
│   ├── Match Analysis & Visual Reports (/analyze & /results/:id)
│   │   ├── Radial Compatibility Score Gauge
│   │   ├── Role Alignment Radar (Candidate vs Target Benchmark)
│   │   ├── Categorized Skill Gap Distribution Bar Chart
│   │   └── 1-Click "Save to Jobs Board" Action
│   ├── AI Mock Interview Studio (/interview)
│   │   ├── Dynamic Question Synthesis (Tech, Behavioral, HR, Mixed)
│   │   ├── Voice Speech-to-Text Dictation (Web Speech API)
│   │   └── 4-Axis Answer Evaluation with Embedded Radar Vector
│   └── Personalized Learning Roadmaps (/roadmap)
│       └── Phased Milestones, Capstone Projects & Interactive Checklist
│
└── Backend (FastAPI + SQLAlchemy + Pydantic v2 + Multi-Provider AI)
    ├── REST API Routers (/auth, /resumes, /analysis, /interview, /roadmap, /jobs, /health)
    ├── Security Headers Middleware (OWASP Secure Headers)
    ├── Auto-Migrating Schema (SQLite local dev & PostgreSQL production)
    ├── Realistic Job Search Engine (/jobs/search)
    ├── Demo Seeder (Instant realistic candidate footprint)
    └── AIService Facade (Automatic fallback to deterministic NLP on LLM timeout)
        ├── Cloud LLM: Google Gemini (official google-genai SDK, gemini-3.8-flash)
        ├── Cloud LLM: OpenAI / Groq / OpenRouter / vLLM (OpenAI-compatible)
        ├── Local LLM: Ollama (JSON Mode via HTTP)
        └── Deterministic Baseline NLP: TF-IDF Cosine & Weighted Taxonomy
```

---

## 🎬 Hackathon Demo Journey (Step-by-Step)

Follow this seamless walkthrough to evaluate all features in under 3 minutes:

1. **One-Click Sign In**:
   - Go to `http://localhost:5173/login`.
   - Click **"Try Demo Account"** (logs in as `Alex Demo - demo@omega.ai`).
2. **Executive Dashboard**:
   - Notice the **Career Readiness Gauge** (85% Market Ready).
   - Explore the **Candidate Competence Vector** radar chart and **Role Fit Trajectory** chart.
   - Inspect the **Resume Versions & Target Profiles** cards; click **"Set Primary"** to switch active application version.
3. **Jobs Board & Pipeline**:
   - Click **"Jobs Board"** in the top navbar.
   - Switch between **"Explore Tech Opportunities"** and **"Saved Pipeline (3)"**.
   - Filter by keyword, toggle **"Remote Only"**, and advance a role from *Interviewing* to *Offer Received*.
4. **AI Match Analysis & Visual Gap Matrix**:
   - Open **"Match Analysis"** or click **"Use in Match"** from a resume.
   - Select a target role (e.g. Stripe Senior Full Stack Engineer) and run analysis.
   - Inspect the **Overall Fit Gauge**, the **Role Alignment Radar**, and the **Skill Domain Distribution**.
   - Click **"Save to Board"** to immediately add the evaluated opportunity to your pipeline.
5. **AI Mock Interview Studio with Dictation**:
   - Click **"Launch Mock Interview"**.
   - View synthesized Technical or Behavioral questions.
   - Click **"Dictate Answer"** to speak your response via microphone or type your answer.
   - Submit answer to see instant **4-Axis Evaluation** (*Relevance*, *Technical Correctness*, *Communication*, *Completeness*) plus the **Radar Answer Vector**.
6. **Bridge Skill Gaps with Roadmap**:
   - Click **"Generate Roadmap"** from the match report to generate a multi-week structured curriculum with topics, capstone projects, and an interactive checklist.
7. **Theme Toggle**:
   - Click the **Sun/Moon** icon in the navbar to switch between Dark and Light mode.

---

## ⚙️ Environment Configuration

Configuration is managed via `.env` in `backend/.env`:

```ini
# Core Configuration
PROJECT_NAME="OMEGA - AI Job Application & Interview Coach"
ENVIRONMENT=production
DATABASE_URL=sqlite:///./omega.db # Or postgresql://omega:omega_secure_password@localhost:5432/omega_db
JWT_SECRET=omega_hackathon_super_secret_jwt_key_2026

# AI Provider ("baseline", "gemini", "openai", "ollama")
AI_PROVIDER=baseline

# Google Gemini (Optional Cloud LLM)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# OpenAI / OpenAI-Compatible (Optional Cloud LLM)
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o

# Local Ollama (Optional Local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# AI Engine Safeguards
AI_TIMEOUT_SECONDS=45
```

---

## 🧪 Verification & Automated Tests

### 1. Backend Automated Tests (20/20 Passing)
```powershell
# In Windows PowerShell:
$env:PYTHONPATH="backend"
.\.venv\Scripts\python.exe -m pytest backend/tests/ -v
```

All 20 tests verify:
- Security headers middleware
- Resume versioning & primary flag enforcement
- Job search engine & saved opportunity CRUD
- Deterministic NLP parser & TF-IDF matcher
- Multi-provider AI fallback mechanism
- Mock interview question generation & 4-axis scoring
- Structured roadmap curriculum synthesis

### 2. Frontend Production Build (0 TypeScript Errors)
```powershell
cd frontend
npm run build
```

---

## 🐳 Docker Deployment

To launch the entire platform with PostgreSQL, FastAPI, and Nginx with a single command:

```bash
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: Port `5432`

---

## 💻 Local Development Setup

### 1. Start Backend (Port 8000)
```powershell
cd backend
$env:PYTHONPATH="."
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start Frontend (Port 5173)
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Access the application in your browser at `http://localhost:5173`.

---

> 📖 **Need a complete setup guide for a brand-new computer?**  
> Check out the step-by-step [SETUP_GUIDE.md](SETUP_GUIDE.md) covering installation, virtual environments, Docker launch, test verification, and port management.
