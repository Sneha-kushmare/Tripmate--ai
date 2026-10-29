# Personalized Travel Itinerary Planner

A full-stack starter project with a React + Vite frontend and FastAPI backend. It generates personalized day-by-day travel plans using a local rule-based generator by default, so the app runs without paid API keys. Optional Gemini and Supabase integration points are documented.

## Features
- Responsive React interface
- Trip preferences: destination, dates, budget, interests, travel style, group size
- Day-by-day itinerary generation
- Save trips in browser local storage
- FastAPI REST API with validation and health endpoint
- Optional Google Gemini integration
- Optional Supabase configuration template
- Basic error handling and loading states

## Requirements
- Node.js 20+ and npm
- Python 3.10+
- VS Code

## Run locally (Windows PowerShell)

### 1. Backend
Open a terminal in this project folder:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate again.

Backend docs: http://https://tripmate-ai-backend-5ipr.onrender.com/docs

### 2. Frontend
Open a **second** terminal at the project root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## Optional AI integration
The project works without an AI key using the built-in generator. To use Gemini:
1. Get an API key from Google AI Studio.
2. Put it in `backend/.env` as `GEMINI_API_KEY=...`.
3. Install the optional dependency with `pip install google-genai`.
4. Restart the backend.

Do not commit `.env` files or publish API keys.

## Optional Supabase
The current version saves trips in browser local storage to keep setup easy. `backend/.env.example` includes Supabase placeholders for the next integration step. Never place a Supabase service-role key in frontend code. For public deployments, configure authentication and Row Level Security before storing real user data.

## GitHub
Create an empty repository on GitHub, then from the project root:

```powershell
git init
git add .
git commit -m "Initial travel itinerary planner"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Personalized-Travel-Itinerary-Planner.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Demo deployment
- Frontend: deploy `frontend` on Vercel or Netlify.
- Backend: deploy `backend` on Render or another Python ASGI host.
- Set the frontend `VITE_API_BASE_URL` to your deployed backend URL.
- Set CORS origins in backend environment to your deployed frontend URL.
- Keep API keys in the hosting provider's environment variables.

## Important
This is a student project starter, not a live booking system. Restaurant, hotel, transport, prices and opening-hours data are illustrative suggestions and should be verified before travel.
