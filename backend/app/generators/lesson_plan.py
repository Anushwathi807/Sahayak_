from app.gemini_client import generate_structured
from app.readability import is_appropriate
from app.rotation import assign_activities_for_slot, sort_by_weekday
from app.schemas import DayPlan, DayPlanEntry, DayPlanInput, Language, LessonPlanResult, WeekContentDraftBatch
from app.text_validation import is_text_valid

_MAX_ATTEMPTS = 3

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant for multi-grade classrooms in
rural India. You are planning ONE grade's activities for a set of (day, subject) slots chosen by
the teacher - a day may include more than one subject, and different subjects may apply to
different grades. Each slot already has a fixed activity type, subject, and topic(s) (decided
separately) - you only describe what the grade will actually do for that subject that day.

Rules:
- Write ONLY in the requested language.
- Match vocabulary and difficulty to the grade level and the subject.
- If a slot lists multiple topics, briefly cover all of them - the teacher deliberately chose to
  cover several topics that day, so do not drop any.
- For 'direct_teaching' slots: the teacher is actively teaching this grade - describe a short
  direct-instruction activity (e.g. explain a concept, demonstrate, guided practice).
- For 'independent_worksheet' slots: describe the grade working alone on practice questions.
- For 'group_activity' slots: describe a small-group task (e.g. pair work, hands-on activity)
  that needs little teacher supervision, since the teacher is busy with another grade.
- For 'peer_reading' slots: describe an activity where students read/discuss with each other
  with minimal supervision needed.
- Keep each description to 1-2 short sentences, longer only if multiple topics must be covered."""


def _draft_is_valid(draft, language: Language, grade: int) -> bool:
    return is_text_valid(draft.description, language) and is_appropriate(draft.description, grade)


def _generate_grade_plan(grade: int, language: Language, slots: list[dict]) -> list:
    """slots: ordered list of {day, subject, topics, activity_type} - one Gemini call covering
    every (day, subject) slot for this grade, in order."""
    slot_lines = "\n".join(
        f"- {s['day']} / {s['subject']}: activity={s['activity_type'].value}, "
        f"topics={', '.join(s['topics'])}"
        for s in slots
    )
    prompt = f"Grade: {grade}\nLanguage: {language.value}\nSlots to plan (in order):\n{slot_lines}"

    for _ in range(_MAX_ATTEMPTS):
        batch = generate_structured(
            contents=prompt,
            system_instruction=_SYSTEM_INSTRUCTION,
            schema=WeekContentDraftBatch,
        )
        if len(batch.days) == len(slots) and all(
            _draft_is_valid(d, language, grade) for d in batch.days
        ):
            return batch.days

    # Best effort: pad/truncate whatever came back last rather than fail the whole plan.
    days = list(batch.days)
    while len(days) < len(slots):
        days.append(days[-1] if days else None)
    return days[: len(slots)]


def generate_lesson_plan(day_plan: list[DayPlanInput], language: Language) -> LessonPlanResult:
    by_day = {dp.day: dp.subjects for dp in day_plan if dp.subjects}
    active_days = sort_by_weekday(list(by_day.keys()))

    # Build one flat, ordered list of every (day, subject, grade) slot, each with its own
    # rotation-assigned activity type computed from just that subject's own grade list.
    flat_slots: list[dict] = []
    for day_index, day in enumerate(active_days):
        for subject_topics in by_day[day]:
            activities = assign_activities_for_slot(subject_topics.grades, day_index)
            for grade in subject_topics.grades:
                flat_slots.append(
                    {
                        "day": day,
                        "subject": subject_topics.subject,
                        "topics": subject_topics.topics,
                        "grade": grade,
                        "activity_type": activities[grade],
                    }
                )

    slots_by_grade: dict[int, list[dict]] = {}
    for slot in flat_slots:
        slots_by_grade.setdefault(slot["grade"], []).append(slot)

    content_by_grade = {
        grade: _generate_grade_plan(grade, language, slots) for grade, slots in slots_by_grade.items()
    }

    # Track how many slots we've already consumed per grade, to pull the matching draft as we
    # walk the flat slot list again in the same order used to build slots_by_grade.
    consumed_per_grade: dict[int, int] = {grade: 0 for grade in slots_by_grade}
    entries_by_day: dict[str, list[DayPlanEntry]] = {day: [] for day in active_days}
    for slot in flat_slots:
        grade = slot["grade"]
        draft_index = consumed_per_grade[grade]
        draft = content_by_grade[grade][draft_index]
        consumed_per_grade[grade] += 1

        entries_by_day[slot["day"]].append(
            DayPlanEntry(
                grade=grade,
                subject=slot["subject"],
                activity_type=slot["activity_type"],
                topics=slot["topics"],
                description=draft.description,
            )
        )

    days = [DayPlan(day=day, entries=entries_by_day[day]) for day in active_days]
    return LessonPlanResult(days=days, language=language)
