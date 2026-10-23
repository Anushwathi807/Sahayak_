import logging

from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector

from app.embeddings import chunk_text, embed_text
from app.firestore_client import db
from app.schemas import Language

_COLLECTION = "curriculum"
_logger = logging.getLogger(__name__)


def ingest_curriculum_text(
    text: str, *, subject: str, language: Language, teacher_uid: str
) -> int:
    """Chunks text, embeds each chunk, and stores it in Firestore for later retrieval.
    Returns the number of chunks stored."""
    chunks = chunk_text(text)
    for chunk in chunks:
        vector = embed_text(chunk, for_query=False)
        db.collection(_COLLECTION).add(
            {
                "text": chunk,
                "subject": subject,
                "language": language.value,
                "teacher_uid": teacher_uid,
                "embedding": Vector(vector),
            }
        )
    return len(chunks)


def search_curriculum(query: str, *, subject: str | None = None, limit: int = 3) -> list[str]:
    """Returns the most relevant curriculum chunks for a query, or an empty list if nothing is
    stored yet or the search fails for any reason (e.g. vector index not yet created in the
    Firebase console) - grounding is best-effort, callers should fall back to general knowledge."""
    try:
        query_vector = embed_text(query, for_query=True)

        collection_ref = db.collection(_COLLECTION)
        query_ref = collection_ref.where("subject", "==", subject) if subject else collection_ref

        results = query_ref.find_nearest(
            vector_field="embedding",
            query_vector=Vector(query_vector),
            limit=limit,
            distance_measure=DistanceMeasure.COSINE,
        ).get()

        return [doc.get("text") for doc in results]
    except Exception:
        _logger.warning("Curriculum search failed, falling back to no grounding", exc_info=True)
        return []
