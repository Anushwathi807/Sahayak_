from app.gemini_client import generate_structured
from app.schemas import HyperlocalContentResult, Language
from app.simplify import simplify_if_needed

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. A teacher has asked you to create hyper-local content (a story, example, or
explanation) to teach a concept.

Rules:
- Write ONLY in the requested language. Do not mix in English unless the requested language is English.
- Use simple words and short sentences suitable for school-age children.
- Use local, culturally relevant context: Indian village life, farmers, festivals, local foods,
  everyday rural situations. Avoid generic or Western references.
- Keep the content focused on teaching the concept the teacher asked about.
- Keep it short enough to read aloud in class in a few minutes."""


def generate_hyperlocal_content(text: str, language: Language) -> HyperlocalContentResult:
    prompt = f"Teacher's request: {text}\nGenerate the content in: {language.value}"
    result = generate_structured(
        contents=prompt,
        system_instruction=_SYSTEM_INSTRUCTION,
        schema=HyperlocalContentResult,
    )
    result.content = simplify_if_needed(result.content, language)
    return result
