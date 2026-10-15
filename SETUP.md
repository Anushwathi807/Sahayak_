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

## 3. System packages (needed before `pip install`)

PDF export (WeasyPrint) and SVG-to-PNG (CairoSVG) are Python wrappers around C
libraries. `pip install` does **not** install those libraries, so on a fresh machine
PDF download will fail with a confusing error unless you install them first.

Ubuntu / Debian:
```
sudo apt install libpango-1.0-0 libpangoft2-1.0-0 libglib2.0-0 \
                 libharfbuzz0b libfontconfig1 libcairo2 libgdk-pixbuf-2.0-0
```

(Verified against Ubuntu 22.04. On Fedora the equivalents are `pango`, `cairo`,
`gdk-pixbuf2`, `harfbuzz`, `fontconfig`, `glib2`.)

## Rebuilding the project from a fresh clone

```
git clone https://github.com/Anushwathi807/Sahayak_.git
cd Sahayak_

# backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt       # versions are pinned, so this is reproducible
cd ..

# frontend
cd frontend
npm ci                                # uses package-lock.json for an exact match
cd ..
```

Then create `backend/.env` and `frontend/.env` from the two `.env.example` files
(steps 1 and 2 above). These are deliberately **not** in the repository because they
contain secret keys.

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
