from fastapi import Header, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.config import FIREBASE_PROJECT_ID

_request_adapter = google_requests.Request()


def verify_firebase_token(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ")
    try:
        claims = google_id_token.verify_firebase_token(
            token, _request_adapter, audience=FIREBASE_PROJECT_ID
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    if claims is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    return claims
