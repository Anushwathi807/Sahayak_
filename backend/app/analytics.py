from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from app.firestore_client import db

_COLLECTION = "activity_log"


def log_action(*, teacher_uid: str, action: str, content_type: str) -> None:
    """Records a teacher action (edit/simplify/translate/regenerate) for later analytics
    (Phase 16). Best-effort - a logging failure should never break the actual feature."""
    try:
        db.collection(_COLLECTION).add(
            {
                "teacher_uid": teacher_uid,
                "action": action,
                "content_type": content_type,
                "timestamp": SERVER_TIMESTAMP,
            }
        )
    except Exception:
        pass
