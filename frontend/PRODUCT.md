# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **First audience:** final-year project evaluators watching a laptop demo. They must understand what Sahayak does and see each capability work end to end within minutes.
- **Designed for:** teachers in multi-grade, low-resource Indian schools (often rural, government-run) who teach several grades in one room and prepare in Hindi, English, Marathi or Tamil. They will use laptops and, later, their own phones.

## Product Purpose

Sahayak is an AI teaching assistant that turns a teacher's request into classroom-ready material in their language: local-context stories, simple explanations with an analogy, blackboard-style diagrams, multi-grade worksheets with answer keys, and weekly multi-grade lesson plans. It also keeps a student roster with quiz scores. Success means a teacher prepares the week's teaching and assessment in minutes, and an evaluator sees every built capability working.

## Positioning

Built for the multi-grade room: one request yields material per grade, in Indian languages, grounded in the teacher's own scanned textbook pages, with activity rotation across grades computed by code rather than left to the model.

## Operating Context

- Requested flow: public landing page, then Google sign-in, then a dismissible "at a glance" pop-up showing student analytics and today's class schedule; after closing it the teacher can open any feature in any order.
- Teacher work cycle: plan (weekly planner), prepare (textbook scan, stories, explanations, diagrams), assess (worksheets exported as PDF/Word for the school printer), track (roster, quiz scores).
- Demo happens on a laptop browser; every page must still work at phone width.

## Capabilities and Constraints

- Backend (FastAPI, Firebase auth) endpoints: `/route` (intent), `/generate/hyperlocal`, `/generate/knowledge-base`, `/generate/visual-aid`, `/read-textbook-page` (JPG/PNG/WEBP/PDF/DOCX/XLSX, 10 MB max), `/curriculum/ingest`, `/generate/worksheets`, `/export/worksheet/pdf|docx` (with answer-key option), `/review/simplify|translate|edit`, `/generate/lesson-plan`, `/students`, `/quizzes`, `/attempts`, `/students/{id}/attempts`, `/daily-nugget`, `/health`, `/me`.
- Languages are fixed to Hindi, English, Marathi, Tamil. Grades 1-8.
- Sign-in is Google only.
- Free tiers only (Gemini flash-lite about 500 requests/day, Firestore Spark), so avoid wasteful calls and show clear waiting states; generation takes several seconds.
- Not built on the backend: content history, lesson-plan storage, activity-log analytics, settings, offline sync, email/password login. Student analytics and the class schedule must be derived from existing endpoints and data the browser keeps.
- Voice input works in Chrome only; read-aloud depends on the voices installed on the device.

## Brand Commitments

- Name: **Sahayak**.
- User-pinned rules: no emojis anywhere; one fixed colour gradient used consistently across the whole frontend; no floating glassmorphism (no backdrop blur, translucent floating panels or blur blobs) on landing, login or inner pages; the interface should read as an educational product with consistent UX across pages; each page lives in its own folder so it can be iterated on its own after testing.
- The earlier "ShikshaSathi" mockups (1.html-4.html) are not binding; the user chose to redesign freely.

## Evidence on Hand

- No real users, testimonials, usage figures, school partnerships or curriculum certifications exist. Never show any (the mockups' "38,000+ teachers", "NCERT Syllabi Mapped" and "DIKSHA & NCF Aligned" were fabricated and must not return).
- Real material: the working backend features. Any demonstration data must be labelled as sample data.

## Product Principles

1. Every screen does a real backend job; no decorative features or claims the product cannot back.
2. Language first: every generator honours the teacher's chosen language, and Indic scripts must render well.
3. Multi-grade by default: choosing grades is a first-class control, not an afterthought.
4. Print-ready: what the teacher makes must survive a school printer.
5. Frugal: few calls, little data, honest progress while the model works.

## Accessibility & Inclusion

- Teachers vary widely in digital confidence: plain labels, large legible type, generous touch targets.
- Devanagari and Tamil text must render with proper fonts.
- Voice input and read-aloud are aids, with clear messages when the device cannot support them.
