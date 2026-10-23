from google import genai
from google.genai import types

from app.config import EMBEDDING_MODEL, GEMINI_API_KEY

_client = genai.Client(api_key=GEMINI_API_KEY)

# Firestore vector fields support at most 2048 dimensions - 1536 stays safely under that
# while keeping good retrieval quality (Gemini's embedding models are trained to support
# truncated output via Matryoshka representation learning).
EMBEDDING_DIMENSIONS = 1536

_CHUNK_SIZE_CHARS = 800
_CHUNK_OVERLAP_CHARS = 100


def chunk_text(text: str) -> list[str]:
    """Splits text into overlapping chunks small enough for focused retrieval."""
    text = text.strip()
    if len(text) <= _CHUNK_SIZE_CHARS:
        return [text] if text else []

    chunks = []
    start = 0
    while start < len(text):
        end = start + _CHUNK_SIZE_CHARS
        chunks.append(text[start:end].strip())
        start = end - _CHUNK_OVERLAP_CHARS
    return [c for c in chunks if c]


def embed_text(text: str, *, for_query: bool = False) -> list[float]:
    task_type = "RETRIEVAL_QUERY" if for_query else "RETRIEVAL_DOCUMENT"
    result = _client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
            task_type=task_type,
        ),
    )
    return result.embeddings[0].values
