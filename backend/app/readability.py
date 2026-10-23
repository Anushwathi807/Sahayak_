"""A language-agnostic readability heuristic. Proper formulas like Flesch-Kincaid rely on
English syllable counting and don't transfer to Hindi/Marathi/Tamil, so instead we measure
average sentence length in CHARACTERS (not words). Word-count is a poor cross-language signal -
Hindi/Marathi write postpositions as separate words, which inflates word counts for equally
simple sentences compared to English. Character length avoids that skew and still correlates
with complexity in any of our 4 languages."""

import re

_SENTENCE_SPLIT = re.compile(r"[.!?।]+")  # includes the Devanagari danda (।)


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE_SPLIT.split(text) if s.strip()]


def avg_sentence_length_chars(text: str) -> float:
    sentences = _sentences(text)
    if not sentences:
        return 0.0
    return sum(len(s) for s in sentences) / len(sentences)


def avg_word_length_chars(text: str) -> float:
    words = text.split()
    if not words:
        return 0.0
    return sum(len(w) for w in words) / len(words)


# (max avg sentence length in characters, max avg word length in characters) - stricter for
# younger grades. Calibrated against real generated samples across all 4 languages.
_GRADE_THRESHOLDS = {
    1: (55, 7.0),
    2: (55, 7.0),
    3: (80, 7.5),
    4: (80, 7.5),
    5: (110, 8.0),
}
_DEFAULT_THRESHOLD = (110, 8.0)  # grade 6+ and general "simple explanation" content


def _thresholds_for_grade(grade: int | None) -> tuple[float, float]:
    if grade is None:
        return _DEFAULT_THRESHOLD
    return _GRADE_THRESHOLDS.get(grade, _DEFAULT_THRESHOLD)


def is_appropriate(text: str, grade: int | None = None) -> bool:
    """Checks whether text's sentence/word length fits the target grade (or a general
    'simple explanation' bar if no grade is given)."""
    max_sentence_chars, max_word_chars = _thresholds_for_grade(grade)
    if avg_sentence_length_chars(text) > max_sentence_chars:
        return False
    if avg_word_length_chars(text) > max_word_chars:
        return False
    return True
