# Setup — things only you can do

These steps need your own accounts/browser login. I cannot do these for you.

## 1. Get a Gemini API key (free, AI Studio)
1. Go to Google AI Studio and sign in with your Google account.
2. Create an API key (no card required for the free tier).
3. Copy `.env.example` in the project root to `backend/.env`.
4. Paste your key into `backend/.env` as `GEMINI_API_KEY=...`.
5. Free tier note: only Flash models are free (Pro requires billing as of mid-2026). Free-tier daily request limits vary a lot by model — check "View your active rate limits" in AI Studio before picking one. We use `gemini-3.5-flash-lite` (500 requests/day, vs 20/day on the newest Flash model).

## 2. Create a Firebase project (Spark plan — free, no card)
1. Go to the Firebase console and create a new project. Skip Google Analytics.
2. Confirm the plan shown is **Spark (free)**.
3. Enable **Authentication → Sign-in method → Google**.
4. Enable **Firestore Database** — Standard edition, region close to India (e.g. `asia-south1`), start in production mode.
5. In Firestore's **Rules** tab, paste the contents of `firestore.rules` (project root) and publish. This allows a signed-in teacher to read/write only their own `teachers/{uid}` document.
6. Register a **Web app** (Project settings → Your apps → `</>`). Copy the `firebaseConfig` values.
7. Copy `frontend/.env.example` to `frontend/.env` and fill in the 6 `VITE_FIREBASE_...` values from that config (skip `measurementId`, we don't use Analytics).
8. Also add `FIREBASE_PROJECT_ID=<your-project-id>` to `backend/.env` — the backend needs it to verify login tokens.

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
