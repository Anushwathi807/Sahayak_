from app.gemini_client import generate_structured
from app.schemas import Language, SimplifiedText

_TRANSLATE_INSTRUCTION = """You are translating classroom content for a teacher. Translate the
given text into the target language, preserving the original meaning, tone, and any story/factual
details exactly. Do not summarize, shorten, or add content - a faithful translation only."""

_EDIT_INSTRUCTION = """You are helping a teacher make a small edit to AI-generated classroom
content. Apply ONLY the specific change the teacher asked for - keep everything else in the
text exactly as it was. Stay in the same language as the original text."""


def translate_text(text: str, target_language: Language) -> str:
    prompt = f"Translate this text into {target_language.value}:\n\n{text}"
    result = generate_structured(
        contents=prompt,
        system_instruction=_TRANSLATE_INSTRUCTION,
        schema=SimplifiedText,
    )
    return result.text


def apply_edit(text: str, instruction: str, language: Language) -> str:
    prompt = (
        f"Original text (in {language.value}):\n{text}\n\n"
        f"Teacher's requested change: {instruction}"
    )
    result = generate_structured(
        contents=prompt,
        system_instruction=_EDIT_INSTRUCTION,
        schema=SimplifiedText,
    )
    return result.text
