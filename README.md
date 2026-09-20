# OMEGA • AI Job Application & Interview Coach (Level 1 MVP)

> **Level 1 Goal**: Clean, functional MVP foundation for an AI-powered job application and interview coaching platform.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend**: Python 3.14, FastAPI, Pydantic v2, PyPDF, Python-Docx, PyJWT, Bcrypt
- **Database**: PostgreSQL with SQLAlchemy 2.0 (with automated SQLite fallback for immediate local testing)
- **Matching Engine**: Deterministic NLP, TF-IDF vector cosine similarity, curated skills ontology, and ATS heuristic analysis
- **Architecture**: Modular service interface (`AIProviderInterface`) prepared for Level 2 LLM integration

---

## Project Structure

```
omega/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Endpoints: Auth, Resumes, Analysis, Health
│   │   ├── core/            # Config (Pydantic Settings), Security (Bcrypt, JWT)
│   │   ├── db/              # SQLAlchemy session & DeclarativeBase
│   │   ├── models/          # User, Resume, JobDescription, AnalysisResult
│   │   ├── schemas/         # Typed Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai_provider.py      # Abstract AIProviderInterface for Level 2
│   │   │   ├── baseline_matcher.py # Level 1 Deterministic NLP & Skill Gap Engine
│   │   │   ├── resume_parser.py    # PDF, DOCX, TXT parser & section detector
│   │   │   └── skill_taxonomy.py   # Curated skills dictionary & extractor
│   │   └── main.py          # FastAPI application entrypoint with CORS & lifespan
│   ├── tests/               # Pytest suite for parser, matcher, and API routes
│   ├── uploads/             # Local storage for uploaded documents
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Button, Input, Card, Badge, Modal, Spinner, Toast
│   │   │   ├── layout/      # Navbar, Footer, AppLayout
│   │   │   ├── auth/        # ProtectedRoute wrapper
│   │   │   ├── resume/      # ResumeDropzone, ResumeCard
│   │   │   ├── job/         # JobDescriptionForm, SampleJobSelector
│   │   │   └── analysis/    # ScoreGauge, ScoreCard, SkillMatrix, KeywordAnalysis
│   │   ├── context/         # AuthContext (with Demo mode), ToastContext
│   │   ├── pages/           # LandingPage, LoginPage, RegisterPage, DashboardPage, AnalyzePage, ResultsPage
│   │   ├── services/        # Axios API client with JWT interceptors
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Routes configuration
│   │   ├── main.tsx
│   │   └── index.css        # Tailwind CSS styling & animations
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts       # Tailwind v4 plugin and API proxy
├── README.md
└── .gitignore
```

---

## Getting Started

### 1. Backend Setup

1. Open a terminal and navigate to the project directory:
   ```bash
   cd c:\Users\vamsi\Projects\hcet\omega
   ```

2. Activate virtual environment (or create one):
   ```powershell
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Configure environment (optional, defaults provided):
   ```bash
   cp backend/.env.example backend/.env
   ```
   *By default, if a local PostgreSQL daemon is not running on port 5432, the session manager automatically falls back to local SQLite (`sqlite:///./omega.db`), ensuring zero startup errors.*

5. Run backend tests:
   ```powershell
   $env:PYTHONPATH="backend"
   python -m pytest backend/tests -v
   ```

6. Start the FastAPI backend server:
   ```powershell
   $env:PYTHONPATH="backend"
   python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
   ```
   - API Docs: `http://127.0.0.1:8000/docs`
   - Health Check: `http://127.0.0.1:8000/api/health`

---

### 2. Frontend Setup

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd c:\Users\vamsi\Projects\hcet\omega\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build production assets:
   ```bash
   npm run build
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   - App URL: `http://localhost:5173`

---

## Features Implemented in Level 1

1. **Modern Landing Page**: High-conversion hero, value propositions, feature overview, and workflow steps.
2. **Authentication Flow**: User registration, login, JWT token management, persistent state, and a one-click **"Try Demo Account"** button for effortless evaluation.
3. **User Dashboard**: Summary KPI metrics, recent match reports, and resume document management.
4. **Resume Upload Interface**: Drag-and-drop file upload with format validation (PDF, DOCX, TXT up to 10MB) or direct text pasting.
5. **Job Description Input**: Input form with seniority selectors and **Quick Test Sample Roles** (Full Stack, Backend Lead, AI/ML Engineer).
6. **Resume Parsing Foundation**: Extracts raw text, contact information (email, phone, portfolio links), standard section headers, and recognized skills.
7. **Resume vs. Job Description Matching**: Multi-dimensional scoring combining hard skills overlap (45%), TF-IDF vector cosine similarity (30%), ATS readability (15%), and experience alignment (10%).
8. **Skill-Gap Identification**: Separation into **Matched Skills**, **Missing Must-Haves**, and **Bonus Strengths** with category filtering.
9. **Results Dashboard**: Radial score gauge, sub-score breakdown, ATS keyword comparison table, actionable checklist, and print/export support.
10. **Extensible AI Provider Interface**: Abstract `AIProviderInterface` decoupling the matching engine from LLM implementations for clean Level 2 pluggability.
