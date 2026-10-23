---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/pages","src/components"]
---

# Sahayak web app (all routes)

Scope: whole frontend. Landing (`/`) is Persuade; login and every signed-in route are Operate.

Audience and job: evaluators watching a laptop demo first, multi-grade teachers next. They sign in, read the class's standing and today's periods in the At a glance sheet, close it, then plan, prepare, teach and assess in any order.

Constraints: user-pinned rules in PRODUCT.md (no emojis, one fixed gradient, no glass or blur, education feel, one folder per page). Data comes only from the real FastAPI endpoints plus what the browser stores (latest lesson plan, history, preferences); nothing invented.

Memorable moment: the At a glance sheet opening after sign-in, scores already sorted into grade bands.

Unresolved: server-side storage for plans and history, activity analytics, offline sync (not built).

## Direction contract

THESIS: Sahayak is the term's progress card, not a dashboard; it refuses stat-tile grids and floating cards.

OWN-WORLD: card-stock ground #F4F6F2, white sheets, blue-black ink #17233A, hairline rules #C9D0CC with ink rules under headers, fountain-pen blue #2350A8 for entered values, red ink #B3312A for attention, one green-to-teal masthead gradient (#0F5A47 to #16637F), eight CBSE grade-band colours, eight fixed subject inks; Anek Latin headings, Mukta body; one radius family, one hairline weight.

STORY: the teacher recognises their own register, trusts the numbers, and acts on the weakest band first.

FIRST VIEWPORT: gradient masthead with Sahayak, date, language and account; left rail grouped Overview, Plan, Prepare, Assess; At a glance sheet over Home: class progress table with band chips, band strip, red-ink list, today's periods; primary action bottom right.

FORM: own grounded list position 6, School Progress Card. seed:2f40cc3c1be1c5be. Raises: subject inks fixed (transit); grade bands the only score scale (star atlas); said once (catalog); claim beside proof on landing (monochrome); one hairline, state by mark (reference); one left rail (emission).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
