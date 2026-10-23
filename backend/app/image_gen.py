import base64
import io
import urllib.parse
from datetime import datetime, timedelta, timezone

import httpx
from PIL import Image, UnidentifiedImageError

from app.config import (
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_IMAGE_MODEL,
    POLLINATIONS_API_KEY,
    POLLINATIONS_IMAGE_MODEL,
)

# FLUX draws scenes well but cannot spell, least of all in Devanagari or Tamil, so the picture
# carries no words: the stage labels and explanation are shown next to it in the teacher's language.
_STYLE = (
    "Hand-drawn illustration from a children's school textbook. Thick black outlines, flat bright "
    "colours, plain light blue background, simple cartoon style, clear and uncluttered so a teacher "
    "can copy it onto a blackboard. Draw only what the scene describes. Absolutely no text, "
    "letters, words, numbers, labels or titles anywhere in the picture, not even on objects."
)

_TIMEOUT_SECONDS = 60
_POLLINATIONS_TIMEOUT_SECONDS = 90  # slower than Cloudflare: 10-15 seconds is normal
_STEPS = 8  # the most FLUX.1 schnell accepts; fewer steps give visibly rougher outlines
# FLUX returns about 400 KB at 1024px. 768px still projects sharply and keeps the reply small for
# rural connections and for the browser-side library, which has only a few MB to work with.
_OUTPUT_SIZE = 768
_JPEG_QUALITY = 80

# Cloudflare's free allowance resets at 00:00 UTC. Once it is spent, go straight to the backup
# until then instead of spending a request to be refused each time.
_cloudflare_spent_until: datetime | None = None


class ImageUnavailableError(Exception):
    """The illustration could not be made; the message is safe to show the teacher."""


class _AllowanceSpent(ImageUnavailableError):
    pass


def _next_utc_midnight() -> datetime:
    now = datetime.now(timezone.utc)
    return (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)


def _from_cloudflare(prompt: str) -> bytes:
    global _cloudflare_spent_until
    if _cloudflare_spent_until and datetime.now(timezone.utc) < _cloudflare_spent_until:
        raise _AllowanceSpent("Today's free picture allowance is used up. It resets at 5:30 am.")

    url = (
        f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}"
        f"/ai/run/{CLOUDFLARE_IMAGE_MODEL}"
    )
    try:
        response = httpx.post(
            url,
            headers={"Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}"},
            json={"prompt": prompt, "steps": _STEPS},
            timeout=_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as exc:
        raise ImageUnavailableError("The picture service did not respond. Try again in a moment.") from exc

    if response.status_code == 429:
        _cloudflare_spent_until = _next_utc_midnight()
        raise _AllowanceSpent("Today's free picture allowance is used up. It resets at 5:30 am.")
    try:
        data = response.json()
    except ValueError as exc:
        raise ImageUnavailableError("The picture service sent an unreadable reply.") from exc
    if response.status_code != 200 or not data.get("success"):
        raise ImageUnavailableError("The picture service could not draw this one. Try again in a moment.")
    try:
        return base64.b64decode((data.get("result") or {}).get("image", ""), validate=True)
    except ValueError as exc:
        raise ImageUnavailableError("The picture service sent an unreadable reply.") from exc


def _from_pollinations(prompt: str) -> bytes:
    # The prompt travels in the URL path, where a line break is refused.
    url = "https://gen.pollinations.ai/image/" + urllib.parse.quote(" ".join(prompt.split()))
    try:
        response = httpx.get(
            url,
            headers={"Authorization": f"Bearer {POLLINATIONS_API_KEY}"},
            params={"model": POLLINATIONS_IMAGE_MODEL, "width": 1024, "height": 1024, "nologo": "true"},
            timeout=_POLLINATIONS_TIMEOUT_SECONDS,
            follow_redirects=True,
        )
    except httpx.HTTPError as exc:
        raise ImageUnavailableError("The backup picture service did not respond. Try again in a moment.") from exc

    if response.status_code == 402:
        raise _AllowanceSpent("The backup picture service has no credit left.")
    if response.status_code != 200 or not response.headers.get("content-type", "").startswith("image/"):
        raise ImageUnavailableError("The backup picture service could not draw this one. Try again in a moment.")
    return response.content


def generate_illustration(scene: str) -> str:
    """Returns the illustration as a data URL (JPEG). Cloudflare draws it while its free daily
    allowance lasts; Pollinations takes over when Cloudflare is spent or failing."""
    providers = []
    if CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN:
        providers.append(_from_cloudflare)
    if POLLINATIONS_API_KEY:
        providers.append(_from_pollinations)
    if not providers:
        raise ImageUnavailableError("Pictures are not set up on this server yet.")

    prompt = f"{scene}\n\n{_STYLE}"
    failures: list[ImageUnavailableError] = []
    for provider in providers:
        try:
            raw = provider(prompt)
            picture = Image.open(io.BytesIO(raw)).convert("RGB")
            break
        except UnidentifiedImageError:
            failures.append(ImageUnavailableError("The picture service sent an unreadable reply."))
        except ImageUnavailableError as exc:
            failures.append(exc)
    else:
        # Every service is spent: say when pictures come back. Otherwise the last failure says what to do.
        if all(isinstance(f, _AllowanceSpent) for f in failures):
            raise ImageUnavailableError("Today's free picture allowance is used up. It resets at 5:30 am.")
        raise failures[-1]

    picture.thumbnail((_OUTPUT_SIZE, _OUTPUT_SIZE))
    out = io.BytesIO()
    picture.save(out, format="JPEG", quality=_JPEG_QUALITY, optimize=True)
    return f"data:image/jpeg;base64,{base64.b64encode(out.getvalue()).decode()}"
