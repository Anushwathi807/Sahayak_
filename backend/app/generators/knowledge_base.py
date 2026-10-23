from app.curriculum import search_curriculum
from app.gemini_client import generate_structured
from app.schemas import KnowledgeBaseResult, Language
from app.simplify import simplify_if_needed

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. A teacher has relayed a student's question. Answer it simply and accurately.

Rules:
- Write ONLY in the requested language. Do not mix in English unless the requested language is English.
- Keep the explanation scientifically/factually accurate, but use simple words a school-age child
  would understand. No jargon.
- Give ONE relatable analogy using everyday rural Indian life (farming, cooking, village objects,
  nature the child would have seen) that makes the concept click.
- Keep both the explanation and the analogy short - a few sentences each, suitable to say out loud
  in class.
- If textbook excerpts are provided below, GROUND your answer in them - prefer their wording,
  terms, and framing over general knowledge, as long as they are accurate and relevant. If they
  don't actually relate to the question, ignore them and answer from general knowledge instead."""


def generate_knowledge_base_answer(text: str, language: Language) -> KnowledgeBaseResult:
    excerpts = search_curriculum(text)
    grounding = (
        "\n\nRelevant textbook excerpts:\n" + "\n---\n".join(excerpts) if excerpts else ""
    )
    prompt = f"Student's question: {text}\nAnswer in: {language.value}{grounding}"
    result = generate_structured(
        contents=prompt,
        system_instruction=_SYSTEM_INSTRUCTION,
        schema=KnowledgeBaseResult,
    )
    result.explanation = simplify_if_needed(result.explanation, language)
    result.analogy = simplify_if_needed(result.analogy, language)
    return result
