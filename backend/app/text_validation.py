import re
import unicodedata

from app.schemas import Language

# Unicode script ranges for each supported language's script.
_SCRIPT_RANGES = {
    Language.ENGLISH: [(0x0000, 0x007F)],
    Language.HINDI: [(0x0000, 0x007F), (0x0900, 0x097F)],
    Language.MARATHI: [(0x0000, 0x007F), (0x0900, 0x097F)],
    Language.TAMIL: [(0x0000, 0x007F), (0x0B80, 0x0BFF)],
}

# A tell-tale sign of mangled unicode escapes leaking into visible text, e.g. "u0b85".
_ESCAPE_LEAK_PATTERN = re.compile(r"u0[0-9a-fA-F]{3}")


def _in_script(ch: str, language: Language) -> bool:
    code = ord(ch)
    return any(lo <= code <= hi for lo, hi in _SCRIPT_RANGES[language])


def is_text_valid(text: str, language: Language, *, required: bool = True) -> bool:
    """Catches empty output and the garbled-unicode-escape failure mode seen in testing."""
    if text is None:
        return not required
    stripped = text.strip()
    if not stripped:
        return not required

    if _ESCAPE_LEAK_PATTERN.search(stripped):
        return False

    # Catches invalid/unassigned/private-use codepoints that render as a "tofu" box -
    # these can fall numerically inside a script's block without being real characters.
    for c in stripped:
        if c == "�" or unicodedata.category(c) in ("Cn", "Co", "Cs"):
            return False

    letters = [c for c in stripped if c.isalpha()]
    if not letters:
        return True  # pure numbers/symbols, nothing to script-check

    bad = sum(1 for c in letters if not _in_script(c, language))
    return (bad / len(letters)) < 0.15
