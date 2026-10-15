import time
from typing import TypeVar

from google import genai
from google.genai import errors, types
from pydantic import BaseModel

from app.config import GEMINI_API_KEY, GEMINI_MODEL

_client = genai.Client(api_key=GEMINI_API_KEY)

_MAX_RETRIES = 2
_RETRY_DELAYS_SECONDS = [2, 5]

T = TypeVar("T", bound=BaseModel)


class GeminiUnavailableError(Exception):
    """Gemini kept failing with a server-side error after all retries."""


def image_part(data: bytes, mime_type: str) -> types.Part:
    return types.Part.from_bytes(data=data, mime_type=mime_type)


def generate_structured(
    *,
    contents: str | list,
    system_instruction: str,
    schema: type[T],
) -> T:
    last_error: errors.ServerError | None = None

    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = _client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
            return schema.model_validate_json(response.text)
        except errors.ServerError as exc:
            # Transient issue on Google's side (e.g. 503 "high demand") - worth retrying.
            last_error = exc
            if attempt < _MAX_RETRIES:
                time.sleep(_RETRY_DELAYS_SECONDS[attempt])

    raise GeminiUnavailableError(
        "Gemini is temporarily unavailable, please try again in a moment."
    ) from last_error
