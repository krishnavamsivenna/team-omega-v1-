# OMEGA • System Setup & Operations Guide

A comprehensive, step-by-step manual for setting up OMEGA on a new machine, starting the services, running tests, and managing daily server operations.

---

## 📋 Table of Contents
1. [System Prerequisites](#1-system-prerequisites)
2. [New System Installation (Step-by-Step)](#2-new-system-installation-step-by-step)
   - [Step 1: Clone the Codebase](#step-1-clone-the-codebase)
   - [Step 2: Backend Environment Setup](#step-2-backend-environment-setup)
   - [Step 3: Environment Configuration (.env)](#step-3-environment-configuration-env)
   - [Step 4: Frontend Dependencies Setup](#step-4-frontend-dependencies-setup)
   - [Step 5: Run Verification Tests](#step-5-run-verification-tests)
3. [Starting the Servers](#3-starting-the-servers)
   - [Method A: Local Development (Two Terminals)](#method-a-local-development-two-terminals)
   - [Method B: Containerized Docker Mode](#method-b-containerized-docker-mode)
4. [Stopping the Servers](#4-stopping-the-servers)
   - [Standard Shutdown](#standard-shutdown)
   - [Freeing Locked Ports (Port 8000 & 5173)](#freeing-locked-ports-port-8000--5173)
   - [Stopping Docker](#stopping-docker)
5. [Access URLs & Test Credentials](#5-access-urls--test-credentials)
6. [Troubleshooting & FAQ](#6-troubleshooting--faq)

---

## 1. System Prerequisites

Install the following on the new computer before proceeding:

| Dependency | Minimum Version | Recommended | Notes |
|---|---|---|---|
| **Python** | 3.10+ | 3.11 or 3.12 | Check *"Add Python to PATH"* during Windows install. |
| **Node.js & npm** | 18.0+ | 20.x LTS | Includes `npm` package manager. |
| **Git** | Any modern version | Latest | Required for version control. |
| **Docker** *(Optional)* | 24.0+ | Docker Desktop | Optional, for single-command containerized launch. |

---

## 2. New System Installation (Step-by-Step)

### Step 1: Clone the Codebase
Open your terminal and clone the repository:

```bash
git clone <repository-url> omega
cd omega
```

---

### Step 2: Backend Environment Setup

Create an isolated Python virtual environment (`.venv`) and install all required libraries.

#### On Windows (PowerShell):
```powershell
# 1. Create virtual environment
python -m venv .venv

# 2. Allow script execution in current PowerShell session (if restricted)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

#### On Windows (Command Prompt `cmd`):
```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

#### On macOS / Linux:
```bash
# 1. Create virtual environment
python3 -m venv .venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt
```

---

### Step 3: Environment Configuration (.env)

Create the backend environment file from the template:

* **Windows PowerShell:**
  ```powershell
  Copy-Item backend\.env.example backend\.env
  ```
* **macOS / Linux:**
  ```bash
  cp backend/.env.example backend/.env
  ```

> [!NOTE]
> **Zero-Config Database Fallback:**
> The backend connects to PostgreSQL if available. If PostgreSQL is not installed or running, it **automatically and safely falls back to local SQLite (`sqlite:///./omega.db`)** without crashing. Tables and the demo seed account are created automatically upon initial launch.

---

### Step 4: Frontend Dependencies Setup

Navigate to the `frontend/` directory and install the Node packages:

```bash
cd frontend
npm install
cd ..
```

---

### Step 5: Run Verification Tests

Ensure the setup is 100% sound by verifying the test suite and frontend build.

#### 1. Backend Test Suite (20 Tests):
* **Windows Command Prompt (`cmd`):**
  ```cmd
  cd backend
  set PYTHONPATH=.
  ..\.venv\Scripts\python.exe -m pytest tests/ -v
  cd ..
  ```
* **Windows PowerShell:**
  ```powershell
  cd backend
  $env:PYTHONPATH="."
  ..\.venv\Scripts\python.exe -m pytest tests/ -v
  cd ..
  ```
* **macOS / Linux:**
  ```bash
  cd backend
  export PYTHONPATH="."
  ../.venv/bin/python -m pytest tests/ -v
  cd ..
  ```
*(All 20 tests must pass across auth, resume parsing, match scoring, roadmaps, and interview evaluation)*

#### 2. Frontend Production Build Check:
```bash
cd frontend
npm run build
cd ..
```
*(Should display `✓ built in ~370ms with 0 errors`)*

---

## 3. Starting the Servers

### Method A: Local Development (Two Terminals)

Open **two separate terminal windows** inside the root `omega/` directory:

#### Terminal 1: FastAPI Backend (Port 8000)
* **Windows Command Prompt (`cmd`):**
  ```cmd
  cd backend
  set PYTHONPATH=.
  ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
* **Windows PowerShell:**
  ```powershell
  cd backend
  $env:PYTHONPATH="."
  ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
* **macOS / Linux:**
  ```bash
  cd backend
  export PYTHONPATH="."
  ../.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```

#### Terminal 2: React + Vite Frontend (Port 5173)
* **Windows / macOS / Linux:**
  ```bash
  cd frontend
  npm run dev -- --host 127.0.0.1 --port 5173
  ```

---

### Method B: Containerized Docker Mode

If Docker Desktop is installed, start the full stack (FastAPI, Nginx React frontend, and PostgreSQL 16) with one command:

```bash
docker-compose up --build -d
```

---

## 4. Stopping the Servers

### Standard Shutdown
If servers are running in active terminal windows:
* Press **`Ctrl + C`** in Terminal 1 (Backend).
* Press **`Ctrl + C`** in Terminal 2 (Frontend).

---

### Freeing Locked Ports (Port 8000 & 5173)
If a server was closed improperly or is running in the background:

#### Windows (PowerShell):
```powershell
# Stop Backend on Port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Stop Frontend on Port 5173
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### macOS / Linux:
```bash
# Using npx kill-port
npx kill-port 8000 5173

# Or using lsof
kill -9 $(lsof -ti:8000,5173) 2>/dev/null
```

---

### Stopping Docker
```bash
# Stop containers
docker-compose down

# Stop containers AND clear database storage volume
docker-compose down -v
```

---

## 5. Access URLs & Test Credentials

Once the servers are running, open your web browser:

| Service | URL | Description |
|---|---|---|
| **Web Application** | `http://localhost:5173` | OMEGA user interface (Dark charcoal & mint teal) |
| **API Documentation** | `http://127.0.0.1:8000/docs` | Interactive Swagger UI for all REST endpoints |
| **API Health Check** | `http://127.0.0.1:8000/api/health` | Backend and database status JSON |

### Pre-Seeded Demo Account
On the login page (`http://localhost:5173/login`), click **"Try Demo Account"** or enter manually:
* **Email**: `demo@omega.ai`
* **Password**: `password123`

*(The demo account comes pre-loaded with resumes, compatibility analyses, interview feedback, and a live jobs pipeline).*

---

## 6. Troubleshooting & FAQ

### 1. `Activate.ps1 cannot be loaded because running scripts is disabled` (Windows)
Run this command in an elevated or current-user PowerShell window:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. `Address already in use: 127.0.0.1:8000` or `:5173`
Follow the commands in [Freeing Locked Ports](#freeing-locked-ports-port-8000--5173) to terminate orphaned processes.

### 3. Missing `google.genai` or LLM API Key Errors
* By default, `backend/.env` has `AI_PROVIDER="baseline"`. This uses OMEGA's deterministic NLP engine, which requires **no external API keys** and operates with 100% offline privacy.
* To enable Google Gemini, add your key to `backend/.env`:
  ```ini
  AI_PROVIDER="gemini"
  GEMINI_API_KEY="your_actual_gemini_api_key"
  GEMINI_MODEL="gemini-3.8-flash"
  ```
