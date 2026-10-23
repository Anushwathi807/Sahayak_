from datetime import date

from app.firestore_client import db
from app.gemini_client import generate_structured
from app.readability import is_appropriate
from app.schemas import DailyNuggetDraft, DailyNuggetResult, Language
from app.text_validation import is_text_valid

_COLLECTION = "daily_nuggets"
_MAX_ATTEMPTS = 3

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. Generate ONE short, interesting "did you know?" fact suitable to share with a class
at the start of the school day.

Rules:
- Write ONLY in the requested language.
- Match vocabulary and difficulty to the grade level.
- Pick a fact that is genuinely interesting and age-appropriate - about nature, science, animals,
  space, history, or everyday life. Keep it accurate.
- Keep it to 1-3 short sentences, suitable to read aloud in under 20 seconds."""


def _generate_fact(grade: int, language: Language) -> str:
    prompt = f"Grade: {grade}\nLanguage: {language.value}"
    for _ in range(_MAX_ATTEMPTS):
        draft = generate_structured(
            contents=prompt,
            system_instruction=_SYSTEM_INSTRUCTION,
            schema=DailyNuggetDraft,
        )
        if is_text_valid(draft.fact, language) and is_appropriate(draft.fact, grade):
            return draft.fact
    return draft.fact  # best effort after exhausting retries


def get_daily_nugget(grade: int, language: Language) -> DailyNuggetResult:
    today = date.today().isoformat()
    doc_id = f"{today}_{grade}_{language.value}"
    doc_ref = db.collection(_COLLECTION).document(doc_id)

    doc = doc_ref.get()
    if doc.exists:
        return DailyNuggetResult(fact=doc.get("fact"), grade=grade, language=language, date=today)

    fact = _generate_fact(grade, language)
    doc_ref.set({"fact": fact, "grade": grade, "language": language.value, "date": today})
    return DailyNuggetResult(fact=fact, grade=grade, language=language, date=today)
