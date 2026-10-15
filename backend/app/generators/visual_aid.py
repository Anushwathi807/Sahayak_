from app.diagrams import render_cycle_diagram, render_sequence_diagram
from app.gemini_client import generate_structured
from app.schemas import DiagramLayout, Language, VisualAidDraft, VisualAidResult
from app.text_validation import is_text_valid

_MAX_ATTEMPTS = 3

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. A teacher has asked for a simple visual aid/diagram to explain a concept, which they
will redraw by hand on a blackboard.

Rules:
- Write ONLY in the requested language.
- Only handle processes that can be shown as an ordered sequence of 3-6 stages/steps (e.g. a
  cycle like the water cycle, or a one-way process like a plant growing, or steps of a method).
  If the teacher's request cannot reasonably be shown this way (e.g. they want a map, a labeled
  diagram of parts, or something non-sequential), still give your best attempt at breaking it into
  an ordered sequence of key stages - never leave labels empty.
- Choose 'cycle' layout if the process naturally repeats/loops back to the start, otherwise choose
  'sequence'.
- Keep each stage label short (under 15 characters) so it fits in the diagram, and pick the
  closest matching icon for each stage.
- The caption should be one simple sentence telling the teacher how to sketch this on a blackboard
  (e.g. 'Draw 4 circles in a loop, connected by arrows, one per stage.')."""


def generate_visual_aid(text: str, language: Language) -> VisualAidResult:
    prompt = f"Teacher's request: {text}\nLanguage: {language.value}"

    draft: VisualAidDraft | None = None
    for _ in range(_MAX_ATTEMPTS):
        candidate = generate_structured(
            contents=prompt,
            system_instruction=_SYSTEM_INSTRUCTION,
            schema=VisualAidDraft,
        )
        if (
            is_text_valid(candidate.caption, language)
            and 3 <= len(candidate.stages) <= 6
            and all(is_text_valid(s.label, language) for s in candidate.stages)
        ):
            draft = candidate
            break

    if draft is None:
        draft = candidate  # best effort after exhausting retries

    renderer = render_cycle_diagram if draft.layout == DiagramLayout.CYCLE else render_sequence_diagram
    stage_tuples = [(s.label, s.icon) for s in draft.stages]
    svg = renderer(stage_tuples, None)

    return VisualAidResult(
        layout=draft.layout,
        stages=draft.stages,
        svg=svg,
        caption=draft.caption,
        language=language,
    )
