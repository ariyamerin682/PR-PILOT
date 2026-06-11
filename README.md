# PR Pilot 🚀

An autonomous GitLab merge-request copilot built with **Google Gemini** and **GitLab API**.

## What it does
Paste a GitLab issue URL and PR Pilot will:
1. Read the issue and scan the repository
2. Propose a step-by-step fix plan
3. Wait for your **Human Approval**
4. Generate a code patch, create a branch, commit the fix, and open a Merge Request

## Tech Stack
- **Backend**: FastAPI (Python), Google Gemini API, python-gitlab
- **Frontend**: React + Vite + TailwindCSS

## Setup

### 1. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Create a `backend/.env` file:
```
GEMINI_API_KEY=your_gemini_api_key_here
GITLAB_TOKEN=your_gitlab_personal_access_token_here
```

Start the server:
```bash
python -m uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Usage
1. Get a [Gemini API Key](https://aistudio.google.com/)
2. Create a GitLab Personal Access Token with `api` scope
3. Start both servers and open the frontend
4. Paste a GitLab issue URL and let the agent work!
