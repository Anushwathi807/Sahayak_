from app.diagrams import render_cycle_diagram
from app.gemini_client import generate_structured
from app.readability import is_appropriate
from app.schemas import (
    GradeWorksheet,
    Language,
    QuestionDraftBatch,
    QuestionType,
    WorksheetQuestion,
    WorksheetQuestionDraft,
    WorksheetResult,
    WorksheetSpecItem,
)
from app.text_validation import is_text_valid

_MAX_BUCKET_ATTEMPTS = 3

_BASE_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. You are given the subject, key topics, and a summary of a textbook page. Generate
worksheet questions based ONLY on this content - do not invent unrelated material.

Rules:
- Write ONLY in the requested language.
- Match vocabulary and difficulty to the requested grade level.
- Generate EXACTLY the number of questions requested, all of the SAME type described below.
"""

_TYPE_INSTRUCTIONS = {
    QuestionType.MCQ: (
        "Each question is multiple choice. Provide exactly 4 options in `options`, with `answer` "
        "equal to the text of the correct option."
    ),
    QuestionType.TRUE_FALSE: (
        "Each question is a true/false statement. Set `answer` to 'True' or 'False'. Leave "
        "`options`, `match_pairs`, `diagram_description`, `diagram_stages`, `diagram_svg` null."
    ),
    QuestionType.FILL_BLANK: (
        "Each question is a sentence with a blank (use '______'). Set `answer` to the missing "
        "word/phrase. Leave `options`, `match_pairs`, `diagram_description`, `diagram_stages`, `diagram_svg` null."
    ),
    QuestionType.SHORT_ANSWER: (
        "Each question expects a 1-2 sentence answer. Leave `options`, `match_pairs`, "
        "`diagram_description`, `diagram_stages`, `diagram_svg` null."
    ),
    QuestionType.LONG_ANSWER: (
        "Each question expects a longer, explanatory answer (3-5 sentences). Leave `options`, "
        "`match_pairs`, `diagram_description`, `diagram_stages`, `diagram_svg` null."
    ),
    QuestionType.MATCH_THE_FOLLOWING: (
        "Each 'question' is a single match-the-following set: write the question text as "
        "'Match the following.', and fill `match_pairs` with 4-6 left/right pairs built from the "
        "topics. Set `answer` to a short text summary of the correct pairing. Leave `options`, "
        "`diagram_description`, `diagram_stages`, `diagram_svg` null."
    ),
    QuestionType.DIAGRAM_BASED: (
        "Each question is about a CYCLICAL process from the topics (e.g. a repeating sequence "
        "like the water cycle, a life cycle, a food chain loop, states of matter). Only choose "
        "this question type if the topics actually contain a cyclical process - if none fits, "
        "generate fewer questions than asked rather than forcing an unrelated one. "
        "Fill `diagram_stages` with 3-6 stages in correct cyclical order, each with a label and "
        "the closest matching icon. Fill `diagram_hidden_index` with the 0-based index of ONE "
        "stage the student must identify (pick a stage that is clearly inferable from the "
        "others). Set `diagram_description` to one sentence describing the cycle. Set `answer` "
        "to the name of the hidden stage. Leave `diagram_svg`, `options`, `match_pairs` null - "
        "we draw the diagram ourselves from your stages."
    ),
}


def _draft_is_valid(draft: WorksheetQuestionDraft, qtype: QuestionType, language: Language) -> bool:
    """Hard requirements: must pass regardless of grade. Never skipped, even as a fallback."""
    if not is_text_valid(draft.question, language):
        return False
    if not is_text_valid(draft.answer, language):
        return False

    if qtype == QuestionType.MCQ:
        if not draft.options or len(draft.options) != 4:
            return False
        if any(not is_text_valid(opt, language) for opt in draft.options):
            return False

    if qtype == QuestionType.MATCH_THE_FOLLOWING:
        if not draft.match_pairs or len(draft.match_pairs) < 3:
            return False
        for pair in draft.match_pairs:
            if not is_text_valid(pair.left, language) or not is_text_valid(pair.right, language):
                return False

    if qtype == QuestionType.DIAGRAM_BASED:
        if not is_text_valid(draft.diagram_description, language):
            return False
        if not draft.diagram_stages or not (3 <= len(draft.diagram_stages) <= 6):
            return False
        if any(not is_text_valid(s.label, language) for s in draft.diagram_stages):
            return False
        if draft.diagram_hidden_index is None or not (
            0 <= draft.diagram_hidden_index < len(draft.diagram_stages)
        ):
            return False

    return True


def _generate_bucket(
    subject: str,
    topics: list[str],
    summary: str,
    grade: int,
    language: Language,
    spec_item: WorksheetSpecItem,
) -> list[WorksheetQuestion]:
    system_instruction = _BASE_INSTRUCTION + _TYPE_INSTRUCTIONS[spec_item.type]

    # Readability is a soft preference: we always prefer simple-enough drafts, but if every
    # attempt comes back slightly too complex for the grade (e.g. long_answer at grade 1),
    # we fall back to the best structurally-valid drafts rather than returning nothing.
    readable: list[WorksheetQuestionDraft] = []
    fallback: list[WorksheetQuestionDraft] = []
    for _ in range(_MAX_BUCKET_ATTEMPTS):
        remaining = spec_item.count - len(readable)
        if remaining <= 0:
            break

        prompt = (
            f"Subject: {subject}\n"
            f"Topics: {', '.join(topics)}\n"
            f"Page summary: {summary}\n"
            f"Target grade: {grade}\n"
            f"Language: {language.value}\n"
            f"Number of questions to generate: {remaining}"
        )
        batch = generate_structured(
            contents=prompt,
            system_instruction=system_instruction,
            schema=QuestionDraftBatch,
        )
        for d in batch.questions:
            if not _draft_is_valid(d, spec_item.type, language):
                continue
            if is_appropriate(d.question, grade):
                readable.append(d)
            else:
                fallback.append(d)

    collected = (readable + fallback)[: spec_item.count]

    questions = []
    for draft in collected:
        data = draft.model_dump()
        if spec_item.type == QuestionType.DIAGRAM_BASED:
            stage_tuples = [(s.label, s.icon) for s in draft.diagram_stages]
            data["diagram_svg"] = render_cycle_diagram(stage_tuples, draft.diagram_hidden_index)
        questions.append(WorksheetQuestion(type=spec_item.type, marks=spec_item.marks, **data))
    return questions


def _generate_one_grade(
    subject: str,
    topics: list[str],
    summary: str,
    grade: int,
    language: Language,
    spec: list[WorksheetSpecItem],
) -> GradeWorksheet:
    questions: list[WorksheetQuestion] = []
    for spec_item in spec:
        questions.extend(_generate_bucket(subject, topics, summary, grade, language, spec_item))

    total_marks = sum(q.marks for q in questions)
    return GradeWorksheet(
        grade=grade,
        title=f"{subject} Worksheet",
        instructions="Answer all questions. Marks for each question are shown in brackets.",
        questions=questions,
        total_marks=total_marks,
        language=language,
    )


def generate_worksheets(
    subject: str,
    topics: list[str],
    summary: str,
    grades: list[int],
    language: Language,
    spec: list[WorksheetSpecItem],
) -> WorksheetResult:
    worksheets = [
        _generate_one_grade(subject, topics, summary, grade, language, spec) for grade in grades
    ]
    return WorksheetResult(worksheets=worksheets)
