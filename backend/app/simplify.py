from app.gemini_client import generate_structured
from app.readability import is_appropriate
from app.schemas import Language, SimplifiedText

_SYSTEM_INSTRUCTION = """You are simplifying text for a school-age child in a rural Indian
classroom. Rewrite the given text using shorter sentences and simpler, more common words.
Keep the same meaning, facts, and language - only reduce complexity. Do not add new information
or remove important facts."""


def simplify_if_needed(text: str, language: Language, *, grade: int | None = None) -> str:
    """Returns text unchanged if it already reads simply enough, otherwise asks Gemini to
    simplify it once and returns the simplified version."""
    if is_appropriate(text, grade):
        return text
    return force_simplify(text, language)


def force_simplify(text: str, language: Language) -> str:
    """Always simplifies, regardless of current readability - for when the teacher explicitly
    asks for a simpler version, even if the text already passes our automatic check."""
    prompt = f"Text to simplify (in {language.value}):\n\n{text}"
    result = generate_structured(
        contents=prompt,
        system_instruction=_SYSTEM_INSTRUCTION,
        schema=SimplifiedText,
    )
    return result.text
