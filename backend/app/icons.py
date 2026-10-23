"""A small library of simple, colored line icons for common classroom science/nature concepts.
Each function draws one icon centered at (cx, cy), roughly fitting a 32x32 box. Gemini picks
which icon (by key) matches each diagram stage - it never draws anything itself, so the actual
shapes are always clean and consistent."""

import math
from collections.abc import Callable

_STROKE = 'stroke="#2b2b2b" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"'


def _sun(cx: float, cy: float) -> str:
    rays = "".join(
        f'<line x1="{cx + 10 * math.cos(a):.1f}" y1="{cy + 10 * math.sin(a):.1f}" '
        f'x2="{cx + 16 * math.cos(a):.1f}" y2="{cy + 16 * math.sin(a):.1f}" '
        f'stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>'
        for a in [i * math.pi / 4 for i in range(8)]
    )
    return rays + f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="9" fill="#FFCB4C" {_STROKE}/>'


def _cloud(cx: float, cy: float) -> str:
    return (
        f'<circle cx="{cx - 7:.1f}" cy="{cy:.1f}" r="7" fill="#EAF2FA" {_STROKE}/>'
        f'<circle cx="{cx + 5:.1f}" cy="{cy - 3:.1f}" r="9" fill="#EAF2FA" {_STROKE}/>'
        f'<circle cx="{cx + 13:.1f}" cy="{cy + 2:.1f}" r="6" fill="#EAF2FA" {_STROKE}/>'
        f'<rect x="{cx - 12:.1f}" y="{cy + 2:.1f}" width="30" height="8" rx="4" fill="#EAF2FA" {_STROKE}/>'
    )


def _rain(cx: float, cy: float) -> str:
    cloud = _cloud(cx, cy - 8)
    drops = "".join(
        f'<line x1="{cx - 8 + i * 8:.1f}" y1="{cy + 6:.1f}" x2="{cx - 11 + i * 8:.1f}" y2="{cy + 15:.1f}" '
        f'stroke="#4FA8E0" stroke-width="2" stroke-linecap="round"/>'
        for i in range(3)
    )
    return cloud + drops


def _water(cx: float, cy: float) -> str:
    waves = "".join(
        f'<path d="M{cx - 15:.1f},{cy - 6 + i * 7:.1f} q4,-5 8,0 q4,5 8,0 q4,-5 8,0 q4,5 8,0" '
        f'fill="none" stroke="#3B82C4" stroke-width="2" stroke-linecap="round"/>'
        for i in range(3)
    )
    return waves


def _tree(cx: float, cy: float) -> str:
    return (
        f'<rect x="{cx - 2:.1f}" y="{cy + 4:.1f}" width="4" height="11" fill="#8B5A2B"/>'
        f'<circle cx="{cx:.1f}" cy="{cy - 4:.1f}" r="12" fill="#66BB6A" {_STROKE}/>'
    )


def _seed(cx: float, cy: float) -> str:
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="5" ry="8" fill="#8B5A2B" {_STROKE}/>'


def _sprout(cx: float, cy: float) -> str:
    return (
        f'<line x1="{cx:.1f}" y1="{cy + 12:.1f}" x2="{cx:.1f}" y2="{cy - 2:.1f}" '
        f'stroke="#5B8C3A" stroke-width="2" stroke-linecap="round"/>'
        f'<path d="M{cx:.1f},{cy - 2:.1f} q-8,-4 -10,-12" fill="#66BB6A" {_STROKE}/>'
        f'<path d="M{cx:.1f},{cy - 2:.1f} q8,-4 10,-12" fill="#66BB6A" {_STROKE}/>'
    )


def _leaf(cx: float, cy: float) -> str:
    return (
        f'<path d="M{cx:.1f},{cy - 12:.1f} C{cx + 14:.1f},{cy - 6:.1f} {cx + 14:.1f},{cy + 6:.1f} '
        f'{cx:.1f},{cy + 12:.1f} C{cx - 14:.1f},{cy + 6:.1f} {cx - 14:.1f},{cy - 6:.1f} {cx:.1f},{cy - 12:.1f} Z" '
        f'fill="#7CC576" {_STROKE}/>'
        f'<line x1="{cx:.1f}" y1="{cy - 10:.1f}" x2="{cx:.1f}" y2="{cy + 10:.1f}" '
        f'stroke="#4C8A42" stroke-width="1.2"/>'
    )


def _moon(cx: float, cy: float) -> str:
    return f'<path d="M{cx + 6:.1f},{cy - 12:.1f} a12,12 0 1 0 0,24 a9,9 0 1 1 0,-24" fill="#FDE68A" {_STROKE}/>'


def _star(cx: float, cy: float) -> str:
    points = []
    for i in range(10):
        r = 11 if i % 2 == 0 else 5
        a = -math.pi / 2 + i * math.pi / 5
        points.append(f"{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(points)}" fill="#FFD54F" {_STROKE}/>'


def _fire(cx: float, cy: float) -> str:
    outer = (
        f'<path d="M{cx:.1f},{cy - 13:.1f} C{cx + 10:.1f},{cy - 4:.1f} {cx + 8:.1f},{cy + 4:.1f} '
        f'{cx:.1f},{cy + 12:.1f} C{cx - 8:.1f},{cy + 4:.1f} {cx - 10:.1f},{cy - 4:.1f} {cx:.1f},{cy - 13:.1f} Z" '
        f'fill="#FF8A3D" {_STROKE}/>'
    )
    inner = (
        f'<path d="M{cx:.1f},{cy - 5:.1f} C{cx + 5:.1f},{cy:.1f} {cx + 4:.1f},{cy + 5:.1f} '
        f'{cx:.1f},{cy + 9:.1f} C{cx - 4:.1f},{cy + 5:.1f} {cx - 5:.1f},{cy:.1f} {cx:.1f},{cy - 5:.1f} Z" fill="#FFD54F"/>'
    )
    return outer + inner


def _snowflake(cx: float, cy: float) -> str:
    lines = "".join(
        f'<line x1="{cx - 13 * math.cos(a):.1f}" y1="{cy - 13 * math.sin(a):.1f}" '
        f'x2="{cx + 13 * math.cos(a):.1f}" y2="{cy + 13 * math.sin(a):.1f}" '
        f'stroke="#90CAF9" stroke-width="2" stroke-linecap="round"/>'
        for a in [i * math.pi / 3 for i in range(3)]
    )
    return lines


def _mountain(cx: float, cy: float) -> str:
    body = (
        f'<path d="M{cx - 15:.1f},{cy + 10:.1f} L{cx - 4:.1f},{cy - 10:.1f} '
        f'L{cx + 3:.1f},{cy - 2:.1f} L{cx + 15:.1f},{cy + 10:.1f} Z" fill="#9FB3C8" {_STROKE}/>'
    )
    snowcap = f'<path d="M{cx - 4:.1f},{cy - 10:.1f} L{cx - 1:.1f},{cy - 4:.1f} L{cx - 7:.1f},{cy - 3:.1f} Z" fill="white"/>'
    return body + snowcap


def _egg(cx: float, cy: float) -> str:
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="9" ry="12" fill="#FFF8E1" {_STROKE}/>'


def _flower(cx: float, cy: float) -> str:
    petals = "".join(
        f'<circle cx="{cx + 8 * math.cos(a):.1f}" cy="{cy + 8 * math.sin(a):.1f}" r="6" '
        f'fill="#F48FB1" {_STROKE}/>'
        for a in [i * math.pi / 2.5 for i in range(5)]
    )
    return petals + f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="4" fill="#FFD54F"/>'


def _book(cx: float, cy: float) -> str:
    return (
        f'<rect x="{cx - 12:.1f}" y="{cy - 9:.1f}" width="24" height="18" rx="2" fill="#F2B880" {_STROKE}/>'
        f'<line x1="{cx:.1f}" y1="{cy - 9:.1f}" x2="{cx:.1f}" y2="{cy + 9:.1f}" stroke="#8B5A2B" stroke-width="1.2"/>'
    )


def _caterpillar(cx: float, cy: float) -> str:
    segs = "".join(
        f'<circle cx="{cx - 12 + i * 6:.1f}" cy="{cy:.1f}" r="4" fill="#8BC34A" {_STROKE}/>' for i in range(5)
    )
    return segs


def _butterfly(cx: float, cy: float) -> str:
    return (
        f'<ellipse cx="{cx - 7:.1f}" cy="{cy - 4:.1f}" rx="7" ry="5" fill="#64B5F6" {_STROKE}/>'
        f'<ellipse cx="{cx - 7:.1f}" cy="{cy + 5:.1f}" rx="5" ry="4" fill="#4FC3F7" {_STROKE}/>'
        f'<ellipse cx="{cx + 7:.1f}" cy="{cy - 4:.1f}" rx="7" ry="5" fill="#FFB74D" {_STROKE}/>'
        f'<ellipse cx="{cx + 7:.1f}" cy="{cy + 5:.1f}" rx="5" ry="4" fill="#FFA726" {_STROKE}/>'
        f'<line x1="{cx:.1f}" y1="{cy - 10:.1f}" x2="{cx:.1f}" y2="{cy + 10:.1f}" stroke="#2b2b2b" stroke-width="1.6"/>'
    )


def _frog(cx: float, cy: float) -> str:
    return (
        f'<path d="M{cx - 13:.1f},{cy + 9:.1f} Q{cx - 16:.1f},{cy + 2:.1f} {cx - 9:.1f},{cy + 2:.1f}" fill="none" {_STROKE}/>'
        f'<path d="M{cx + 13:.1f},{cy + 9:.1f} Q{cx + 16:.1f},{cy + 2:.1f} {cx + 9:.1f},{cy + 2:.1f}" fill="none" {_STROKE}/>'
        f'<ellipse cx="{cx:.1f}" cy="{cy + 3:.1f}" rx="11" ry="8" fill="#81C784" {_STROKE}/>'
        f'<circle cx="{cx - 6:.1f}" cy="{cy - 6:.1f}" r="4" fill="#81C784" {_STROKE}/>'
        f'<circle cx="{cx + 6:.1f}" cy="{cy - 6:.1f}" r="4" fill="#81C784" {_STROKE}/>'
        f'<circle cx="{cx - 6:.1f}" cy="{cy - 6:.1f}" r="1.6" fill="#2b2b2b"/>'
        f'<circle cx="{cx + 6:.1f}" cy="{cy - 6:.1f}" r="1.6" fill="#2b2b2b"/>'
        f'<path d="M{cx - 4:.1f},{cy + 3:.1f} Q{cx:.1f},{cy + 6:.1f} {cx + 4:.1f},{cy + 3:.1f}" fill="none" {_STROKE}/>'
    )


def _tadpole(cx: float, cy: float) -> str:
    return (
        f'<path d="M{cx + 1:.1f},{cy:.1f} Q{cx + 6:.1f},{cy - 6:.1f} {cx + 10:.1f},{cy:.1f} '
        f'T{cx + 16:.1f},{cy:.1f}" fill="none" stroke="#5D4037" stroke-width="2.2" stroke-linecap="round"/>'
        f'<ellipse cx="{cx - 5:.1f}" cy="{cy:.1f}" rx="8" ry="6.5" fill="#6D4C41" {_STROKE}/>'
        f'<circle cx="{cx - 8:.1f}" cy="{cy - 2:.1f}" r="1.5" fill="white"/>'
    )


def _fish(cx: float, cy: float) -> str:
    return (
        f'<path d="M{cx + 8:.1f},{cy:.1f} L{cx + 15:.1f},{cy - 7:.1f} L{cx + 15:.1f},{cy + 7:.1f} Z" fill="#FFB74D" {_STROKE}/>'
        f'<ellipse cx="{cx - 2:.1f}" cy="{cy:.1f}" rx="11" ry="7" fill="#FFB74D" {_STROKE}/>'
        f'<circle cx="{cx - 8:.1f}" cy="{cy - 2:.1f}" r="1.5" fill="#2b2b2b"/>'
    )


def _bird(cx: float, cy: float) -> str:
    return (
        f'<ellipse cx="{cx + 1:.1f}" cy="{cy + 3:.1f}" rx="10" ry="7" fill="#4FC3F7" {_STROKE}/>'
        f'<circle cx="{cx - 8:.1f}" cy="{cy - 5:.1f}" r="5" fill="#4FC3F7" {_STROKE}/>'
        f'<path d="M{cx - 13:.1f},{cy - 6:.1f} L{cx - 17:.1f},{cy - 4:.1f} L{cx - 13:.1f},{cy - 3:.1f} Z" fill="#FFA726" {_STROKE}/>'
        f'<circle cx="{cx - 9:.1f}" cy="{cy - 6:.1f}" r="1.2" fill="#2b2b2b"/>'
        f'<path d="M{cx - 2:.1f},{cy + 1:.1f} Q{cx + 5:.1f},{cy - 6:.1f} {cx + 10:.1f},{cy + 1:.1f}" fill="#0288D1" {_STROKE}/>'
        f'<line x1="{cx - 1:.1f}" y1="{cy + 10:.1f}" x2="{cx - 2:.1f}" y2="{cy + 14:.1f}" {_STROKE}/>'
        f'<line x1="{cx + 4:.1f}" y1="{cy + 10:.1f}" x2="{cx + 5:.1f}" y2="{cy + 14:.1f}" {_STROKE}/>'
    )


def _cocoon(cx: float, cy: float) -> str:
    bands = "".join(
        f'<path d="M{cx - 5:.1f},{cy - 3 + i * 5:.1f} Q{cx:.1f},{cy - 1 + i * 5:.1f} {cx + 5:.1f},{cy - 3 + i * 5:.1f}" '
        f'fill="none" stroke="#6D4C41" stroke-width="1"/>'
        for i in range(3)
    )
    return (
        f'<line x1="{cx - 12:.1f}" y1="{cy - 13:.1f}" x2="{cx + 12:.1f}" y2="{cy - 13:.1f}" stroke="#795548" stroke-width="2.4" stroke-linecap="round"/>'
        f'<line x1="{cx:.1f}" y1="{cy - 13:.1f}" x2="{cx:.1f}" y2="{cy - 9:.1f}" {_STROKE}/>'
        f'<ellipse cx="{cx:.1f}" cy="{cy + 2:.1f}" rx="6.5" ry="11" fill="#BCAAA4" {_STROKE}/>'
    ) + bands


def _house(cx: float, cy: float) -> str:
    return (
        f'<rect x="{cx - 10:.1f}" y="{cy - 2:.1f}" width="20" height="14" fill="#FFE0B2" {_STROKE}/>'
        f'<path d="M{cx - 14:.1f},{cy - 1:.1f} L{cx:.1f},{cy - 13:.1f} L{cx + 14:.1f},{cy - 1:.1f} Z" fill="#E57373" {_STROKE}/>'
        f'<rect x="{cx - 3:.1f}" y="{cy + 4:.1f}" width="6" height="8" fill="#8D6E63" {_STROKE}/>'
    )


def _person(cx: float, cy: float) -> str:
    return (
        f'<circle cx="{cx:.1f}" cy="{cy - 8:.1f}" r="5" fill="#FFCC80" {_STROKE}/>'
        f'<path d="M{cx - 8:.1f},{cy + 13:.1f} L{cx - 7:.1f},{cy + 1:.1f} Q{cx:.1f},{cy - 3:.1f} {cx + 7:.1f},{cy + 1:.1f} '
        f'L{cx + 8:.1f},{cy + 13:.1f} Z" fill="#7986CB" {_STROKE}/>'
    )


def _crop(cx: float, cy: float) -> str:
    grains = "".join(
        f'<ellipse cx="{cx + side * 3.5:.1f}" cy="{cy - 10 + i * 5:.1f}" rx="2.4" ry="3.6" '
        f'transform="rotate({side * 25} {cx + side * 3.5:.1f} {cy - 10 + i * 5:.1f})" fill="#FBC02D" {_STROKE}/>'
        for i in range(4)
        for side in (-1, 1)
    )
    return (
        f'<line x1="{cx:.1f}" y1="{cy - 14:.1f}" x2="{cx:.1f}" y2="{cy + 14:.1f}" stroke="#7CB342" stroke-width="2" stroke-linecap="round"/>'
        f'<path d="M{cx:.1f},{cy + 10:.1f} Q{cx - 9:.1f},{cy + 6:.1f} {cx - 11:.1f},{cy - 1:.1f}" fill="none" stroke="#7CB342" stroke-width="1.8" stroke-linecap="round"/>'
    ) + grains


ICONS: dict[str, Callable[[float, float], str]] = {
    "sun": _sun,
    "cloud": _cloud,
    "rain": _rain,
    "water": _water,
    "tree": _tree,
    "seed": _seed,
    "sprout": _sprout,
    "leaf": _leaf,
    "moon": _moon,
    "star": _star,
    "fire": _fire,
    "snowflake": _snowflake,
    "mountain": _mountain,
    "egg": _egg,
    "flower": _flower,
    "book": _book,
    "caterpillar": _caterpillar,
    "butterfly": _butterfly,
    "frog": _frog,
    "tadpole": _tadpole,
    "fish": _fish,
    "bird": _bird,
    "cocoon": _cocoon,
    "house": _house,
    "person": _person,
    "crop": _crop,
}

ICON_KEYS = list(ICONS.keys()) + ["none"]


def render_icon(key: str | None, cx: float, cy: float) -> str:
    if not key or key not in ICONS:
        return ""
    return ICONS[key](cx, cy)
