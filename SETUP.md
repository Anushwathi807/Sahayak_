# Setup — things only you can do

These steps need your own accounts/browser login. I cannot do these for you.

## 1. Get a Gemini API key (free, AI Studio)
1. Go to Google AI Studio and sign in with your Google account.
2. Create an API key (no card required for the free tier).
3. Copy `.env.example` in the project root to `backend/.env`.
4. Paste your key into `backend/.env` as `GEMINI_API_KEY=...`.
5. Free tier note: only Flash models are free (Pro requires billing as of mid-2026). Keep `GEMINI_MODEL=gemini-3-flash` unless we decide otherwise together.

## 2. Create a Firebase project (Spark plan — free, no card)
1. Go to the Firebase console and create a new project.
2. Make sure the plan shown is **Spark (free)** — do not upgrade to Blaze.
3. Enable **Authentication → Sign-in method → Google**.
4. Enable **Firestore Database** (start in production mode, pick a region close to India).
5. We'll wire the Firebase config into the frontend in a later phase — nothing to paste yet, just create the project so it exists.

## Local run commands (once .env is filled in)

Backend:
```
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Frontend:
```
cd frontend
npm run dev
```

Visit http://localhost:8000/health to confirm the backend is alive.
Visit http://localhost:5173 to see the frontend.
