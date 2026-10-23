from app.diagrams import render_block_diagram, render_cycle_diagram, render_sequence_diagram
import base64

from app.gemini_client import GeminiUnavailableError, generate_structured, image_part
from app.image_gen import ImageUnavailableError, generate_illustration
from app.schemas import (
    DiagramLayout,
    LabelPlacement,
    LabelPlacements,
    Language,
    VisualAidDraft,
    VisualAidResult,
    VisualAidStage,
)
from app.text_validation import is_text_valid

_MAX_ATTEMPTS = 3

_RENDERERS = {
    DiagramLayout.CYCLE: render_cycle_diagram,
    DiagramLayout.SEQUENCE: render_sequence_diagram,
    DiagramLayout.BLOCK: render_block_diagram,
}

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. A teacher has asked for a visual aid to explain a concept. They will show the picture
and redraw the diagram by hand on a blackboard.

Rules:
- Write the title, stage labels, explanations and caption ONLY in the requested language.
- Break the topic into an ordered sequence of 3-6 stages/steps (e.g. a cycle like the water cycle,
  a one-way process like a plant growing, or the steps of a method). If the request is not
  naturally sequential (e.g. parts of a flower), still give the key stages in a sensible teaching
  order - never leave labels empty.
- Choose 'block' if the teacher asks for a block diagram, flowchart or workflow. Otherwise choose
  'cycle' if the process naturally repeats/loops back to the start, and 'sequence' if it does not.
- Keep each stage label short (under 15 characters) so it fits in the diagram, and pick the
  closest matching icon for each stage.
- Each stage's explanation is 3-4 short sentences a child in grades 1-5 can follow: what happens
  at this stage and how, why it matters for the next stage, and one everyday village example (a
  pond, a field, cooking, the well). Name the science word for the stage once, explained simply.
- The caption is one simple sentence telling the teacher how to sketch the diagram on a blackboard:
  circles in a loop for 'cycle', circles in a row from left to right for 'sequence', and boxes
  from top to bottom joined by downward arrows for 'block'.
- The scene is ALWAYS in English, whatever the requested language, and at most 70 words. It
  describes ONE continuous picture, like a single page of a picture book, that shows every stage
  happening in the same place at once: the real objects, where each sits (left, top right,
  centre...), and show each stage through what is visibly happening (e.g. 'wavy steam lines rising
  from the sea', 'rain falling from the dark cloud onto the hill'). No arrows: the image model
  points them the wrong way, and the diagram beside the picture already carries the direction.
  Never ask for panels, frames, borders, boxes, grids, charts or diagram shapes, even for a block
  diagram: for a workflow, draw the real places and objects along a path from left to right. No
  title, captions, signs or words in the picture."""


_PLACEMENT_INSTRUCTION = """You place labels on a children's textbook illustration. For each
numbered stage, give the point where its label should sit: on the object or area in the picture
that shows that stage (e.g. the sun for 'sunlight', the roots or the soil for 'water from the
soil'). If a stage is not drawn, choose the empty area nearest to where it happens. Keep labels at
least 150 apart from each other so they do not overlap, and at least 60 from the picture's edges.
Coordinates run from 0 to 1000: x from the left edge, y from the top edge.
Also report whether any letters, words, numbers or scribbled text appear anywhere in the picture,
including small marks in the corners."""


def _place_labels(image: str, stages: list[VisualAidStage]) -> LabelPlacements | None:
    """Asks Gemini to look at the illustration and find where each stage is drawn. Labels are
    then laid over the picture by the browser, which can render every script the image model can't."""
    jpeg = base64.b64decode(image.split(",", 1)[1])
    listing = "\n".join(f"{i}. {s.label}: {s.explanation}" for i, s in enumerate(stages, start=1))
    try:
        result = generate_structured(
            contents=[image_part(jpeg, "image/jpeg"), f"Stages:\n{listing}"],
            system_instruction=_PLACEMENT_INSTRUCTION,
            schema=LabelPlacements,
        )
    except GeminiUnavailableError:
        return None

    by_stage = {p.stage: p for p in result.placements if 1 <= p.stage <= len(stages)}
    placements = [
        LabelPlacement(stage=n, x=min(max(by_stage[n].x, 0), 1000), y=min(max(by_stage[n].y, 0), 1000))
        for n in sorted(by_stage)
    ]
    # A partly labelled picture is more confusing than an unlabelled one.
    return LabelPlacements(placements=placements if len(placements) == len(stages) else [], has_writing=result.has_writing)


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
            is_text_valid(candidate.title, language)
            and is_text_valid(candidate.caption, language)
            and 3 <= len(candidate.stages) <= 6
            and all(
                is_text_valid(s.label, language) and is_text_valid(s.explanation, language)
                for s in candidate.stages
            )
        ):
            draft = candidate
            break

    if draft is None:
        draft = candidate  # best effort after exhausting retries

    stage_tuples = [(s.label, s.icon) for s in draft.stages]
    svg = _RENDERERS[draft.layout](stage_tuples, None)

    image, image_note, label_positions = None, None, None
    try:
        image = generate_illustration(draft.scene)
    except ImageUnavailableError as exc:
        image_note = str(exc)
    if image:
        placed = _place_labels(image, draft.stages)
        if placed and placed.has_writing:
            # The image model scribbled text despite the prompt; one redraw usually clears it.
            try:
                redrawn = generate_illustration(draft.scene)
                image, placed = redrawn, _place_labels(redrawn, draft.stages)
            except ImageUnavailableError:
                pass  # keep the first picture and its labels
        if placed and placed.placements:
            label_positions = placed.placements

    return VisualAidResult(
        title=draft.title,
        layout=draft.layout,
        stages=draft.stages,
        svg=svg,
        caption=draft.caption,
        language=language,
        image=image,
        image_note=image_note,
        label_positions=label_positions,
    )
