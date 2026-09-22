from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import verify_firebase_token

app = FastAPI(title="Sahayak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me")
def me(claims: dict = Depends(verify_firebase_token)):
    return {"uid": claims["user_id"], "email": claims.get("email")}
