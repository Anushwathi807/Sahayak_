import math
from html import escape

from app.icons import render_icon

_WIDTH = 320
_HEIGHT = 340
_CENTER_X = _WIDTH / 2
_CENTER_Y = _HEIGHT / 2 - 10
_RADIUS = 105
_NODE_RADIUS = 26
_LABEL_OFFSET = _NODE_RADIUS + 14


def _node_position(index: int, count: int) -> tuple[float, float]:
    angle = (2 * math.pi * index / count) - (math.pi / 2)  # start at top, go clockwise
    x = _CENTER_X + _RADIUS * math.cos(angle)
    y = _CENTER_Y + _RADIUS * math.sin(angle)
    return x, y


def _wrap_label(label: str, max_chars: int = 12) -> list[str]:
    words = label.split()
    lines: list[str] = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 > max_chars and current:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()
    if current:
        lines.append(current)
    return lines[:2]


def _node_svg(x: float, y: float, label: str, icon: str | None, is_hidden: bool) -> str:
    parts = [
        f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{_NODE_RADIUS + 3}" fill="white" opacity="0.9"/>',
        f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{_NODE_RADIUS}" '
        f'fill="{"#FFF3C4" if is_hidden else "#FFFFFF"}" stroke="#3a3a3a" stroke-width="1.5"/>',
    ]
    if is_hidden:
        parts.append(
            f'<text x="{x:.1f}" y="{y + 6:.1f}" text-anchor="middle" font-size="18" font-weight="bold">?</text>'
        )
    else:
        parts.append(render_icon(icon, x, y))

    if not is_hidden:
        lines = _wrap_label(label)
        line_height = 12
        box_w = max(len(line) for line in lines) * 6 + 12
        box_h = len(lines) * line_height + 6
        box_y = y + _LABEL_OFFSET - 9
        parts.append(
            f'<rect x="{x - box_w / 2:.1f}" y="{box_y:.1f}" width="{box_w:.1f}" height="{box_h:.1f}" '
            f'rx="6" fill="#FDF1DC" stroke="#E8D5AE" stroke-width="1"/>'
        )
        start_y = box_y + line_height
        for li, line in enumerate(lines):
            parts.append(
                f'<text x="{x:.1f}" y="{start_y + li * line_height:.1f}" '
                f'text-anchor="middle" font-size="10" font-weight="600" fill="#2b2b2b">{escape(line)}</text>'
            )
    return "".join(parts)


def _defs() -> str:
    return (
        "<defs>"
        "<marker id='arrow' markerWidth='8' markerHeight='8' refX='6' refY='3' "
        "orient='auto'><path d='M0,0 L6,3 L0,6 z' fill='#3a3a3a'/></marker>"
        "<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>"
        "<stop offset='0%' stop-color='#E6F2FB'/><stop offset='100%' stop-color='#FDFEFE'/>"
        "</linearGradient>"
        "</defs>"
    )


def _background(width: float, height: float) -> str:
    return f'<rect x="0" y="0" width="{width}" height="{height}" rx="14" fill="url(#sky)"/>'


def render_cycle_diagram(stages: list[tuple[str, str]], hidden_index: int | None) -> str:
    """Draws a reliable circular-process diagram: N nodes (icon + label) in a circle, connected
    by curved arrows in sequence. One node is replaced with '?' for the student to fill in.
    Built entirely with code (not an LLM) so the arrows and layout are always geometrically correct."""
    count = len(stages)
    positions = [_node_position(i, count) for i in range(count)]

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_WIDTH} {_HEIGHT}" '
        f'width="280" height="{int(280 * _HEIGHT / _WIDTH)}">',
        _defs(),
        _background(_WIDTH, _HEIGHT),
    ]

    gap = _NODE_RADIUS + 4
    for i in range(count):
        x1, y1 = positions[i]
        x2, y2 = positions[(i + 1) % count]
        dx, dy = x2 - x1, y2 - y1
        dist = math.hypot(dx, dy) or 1
        ux, uy = dx / dist, dy / dist
        sx, sy = x1 + ux * gap, y1 + uy * gap
        ex, ey = x2 - ux * gap, y2 - uy * gap

        mx, my = (sx + ex) / 2, (sy + ey) / 2
        bow = 0.25
        cx = mx + (_CENTER_X - mx) * bow
        cy = my + (_CENTER_Y - my) * bow
        svg_parts.append(
            f'<path d="M{sx:.1f},{sy:.1f} Q{cx:.1f},{cy:.1f} {ex:.1f},{ey:.1f}" '
            f'fill="none" stroke="#3a3a3a" stroke-width="2" marker-end="url(#arrow)"/>'
        )

    for i, (x, y) in enumerate(positions):
        label, icon = stages[i]
        svg_parts.append(_node_svg(x, y, label, icon, i == hidden_index))

    svg_parts.append("</svg>")
    return "".join(svg_parts)


def render_sequence_diagram(stages: list[tuple[str, str]], hidden_index: int | None) -> str:
    """Draws a reliable left-to-right flow diagram: N nodes (icon + label) in a straight line,
    connected by one-way arrows. For linear (non-repeating) processes. One node is replaced with
    '?' for the student to fill in. Built entirely with code, same as the cycle diagram, so the
    arrows are always geometrically correct."""
    count = len(stages)
    width = max(360, count * 150)
    height = 150
    spacing = width / count
    positions = [(spacing * (i + 0.5), height / 2 - 8) for i in range(count)]

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{min(340, int(width * 0.85))}" height="{int(height * 0.85)}">',
        _defs(),
        _background(width, height),
    ]

    gap = _NODE_RADIUS + 4
    for i in range(count - 1):
        x1, y1 = positions[i]
        x2, y2 = positions[i + 1]
        svg_parts.append(
            f'<path d="M{x1 + gap:.1f},{y1:.1f} L{x2 - gap:.1f},{y2:.1f}" '
            f'fill="none" stroke="#3a3a3a" stroke-width="2" marker-end="url(#arrow)"/>'
        )

    for i, (x, y) in enumerate(positions):
        label, icon = stages[i]
        svg_parts.append(_node_svg(x, y, label, icon, i == hidden_index))

    svg_parts.append("</svg>")
    return "".join(svg_parts)
