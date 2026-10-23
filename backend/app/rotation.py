"""Deterministic rotation scheduling - built in code, not left to the AI, so fairness is
guaranteed by construction rather than hoped for. Each (day, subject) slot has its own set of
grades (different subjects can apply to different grades); within that slot, exactly one grade
gets direct teacher time and the rest rotate through independent activity types. The slot's
position in the week (day_index) seeds the rotation so different subjects/days vary who gets
direct teaching, even though each subject typically only occupies one day."""

from app.schemas import ActivityType

WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

_INDEPENDENT_CYCLE = [
    ActivityType.INDEPENDENT_WORKSHEET,
    ActivityType.GROUP_ACTIVITY,
    ActivityType.PEER_READING,
]


def sort_by_weekday(days: list[str]) -> list[str]:
    order = {name: i for i, name in enumerate(WEEKDAY_ORDER)}
    return sorted(days, key=lambda d: order.get(d, len(WEEKDAY_ORDER)))


def assign_activities_for_slot(grades: list[int], day_index: int) -> dict[int, ActivityType]:
    """Returns {grade: activity_type} for one (day, subject) slot's own grade list. Exactly one
    grade gets direct teaching; the rest get a varied mix of independent activities."""
    direct_grade = grades[day_index % len(grades)]
    other_grades = [g for g in grades if g != direct_grade]

    assignment: dict[int, ActivityType] = {direct_grade: ActivityType.DIRECT_TEACHING}
    for i, grade in enumerate(other_grades):
        assignment[grade] = _INDEPENDENT_CYCLE[(day_index + i) % len(_INDEPENDENT_CYCLE)]
    return assignment
