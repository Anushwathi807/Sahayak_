from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from app.analytics import log_action
from app.auth import verify_firebase_token
from app.curriculum import ingest_curriculum_text
from app.export import worksheet_to_docx, worksheet_to_pdf
from app.file_extraction import extract_docx_text, extract_xlsx_text
from app.gemini_client import GeminiUnavailableError
from app.generators.daily_nugget import get_daily_nugget
from app.generators.hyperlocal import generate_hyperlocal_content
from app.generators.knowledge_base import generate_knowledge_base_answer
from app.generators.lesson_plan import generate_lesson_plan
from app.generators.textbook import read_textbook_file, read_textbook_text
from app.generators.visual_aid import generate_visual_aid
from app.generators.worksheet import generate_worksheets
from app.review import apply_edit, translate_text
from app.roster import (
    NotFoundError,
    add_quiz,
    add_student,
    list_attempts_for_student,
    list_quizzes,
    list_students,
    record_attempt,
)
from app.router import classify_intent
from app.schemas import (
    Attempt,
    AttemptCreateRequest,
    CurriculumIngestRequest,
    CurriculumIngestResult,
    DailyNuggetResult,
    EditRequest,
    GradeWorksheet,
    HyperlocalContentRequest,
    HyperlocalContentResult,
    IntentResult,
    KnowledgeBaseRequest,
    KnowledgeBaseResult,
    Language,
    LessonPlanRequest,
    LessonPlanResult,
    Quiz,
    QuizCreateRequest,
    ReviewTextResult,
    SimplifyRequest,
    Student,
    StudentCreateRequest,
    TextbookPageResult,
    TranslateRequest,
    VisualAidRequest,
    VisualAidResult,
    WorksheetRequest,
    WorksheetResult,
)
from app.simplify import force_simplify

_MAX_UPLOAD_BYTES = 10 * 1024 * 1024

app = FastAPI(title="Sahayak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me")
def me(claims: dict = Depends(verify_firebase_token)):
    return {"uid": claims["user_id"], "email": claims.get("email")}


class RouteRequest(BaseModel):
    text: str


@app.post("/route")
def route(
    body: RouteRequest,
    claims: dict = Depends(verify_firebase_token),
) -> IntentResult:
    try:
        return classify_intent(body.text)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/generate/hyperlocal")
def generate_hyperlocal(
    body: HyperlocalContentRequest,
    claims: dict = Depends(verify_firebase_token),
) -> HyperlocalContentResult:
    try:
        result = generate_hyperlocal_content(body.text, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if body.is_regenerate:
        log_action(teacher_uid=claims["user_id"], action="regenerate", content_type="hyperlocal_content")
    return result


@app.post("/generate/knowledge-base")
def generate_knowledge_base(
    body: KnowledgeBaseRequest,
    claims: dict = Depends(verify_firebase_token),
) -> KnowledgeBaseResult:
    try:
        result = generate_knowledge_base_answer(body.text, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if body.is_regenerate:
        log_action(teacher_uid=claims["user_id"], action="regenerate", content_type="knowledge_base")
    return result


@app.post("/generate/visual-aid")
def generate_visual_aid_endpoint(
    body: VisualAidRequest,
    claims: dict = Depends(verify_firebase_token),
) -> VisualAidResult:
    try:
        return generate_visual_aid(body.text, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


_DOCX_MIME_TYPES = {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
_XLSX_MIME_TYPES = {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
_NATIVE_FILE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}


@app.post("/read-textbook-page")
async def read_textbook(
    file: UploadFile = File(...),
    claims: dict = Depends(verify_firebase_token),
) -> TextbookPageResult:
    content_type = file.content_type
    file_bytes = await file.read()
    if len(file_bytes) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 10MB).")

    try:
        if content_type in _NATIVE_FILE_MIME_TYPES:
            return read_textbook_file(file_bytes, content_type)
        if content_type in _DOCX_MIME_TYPES:
            return read_textbook_text(extract_docx_text(file_bytes))
        if content_type in _XLSX_MIME_TYPES:
            return read_textbook_text(extract_xlsx_text(file_bytes))
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, WEBP, PDF, Word (.docx), or Excel (.xlsx) file.",
        )
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/generate/worksheets")
def generate_worksheet_set(
    body: WorksheetRequest,
    claims: dict = Depends(verify_firebase_token),
) -> WorksheetResult:
    if not body.grades:
        raise HTTPException(status_code=400, detail="Please select at least one grade.")
    if not body.spec:
        raise HTTPException(status_code=400, detail="Please choose at least one question type.")
    try:
        return generate_worksheets(
            body.subject, body.topics, body.summary, body.grades, body.language, body.spec
        )
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/export/worksheet/pdf")
def export_worksheet_pdf(
    body: GradeWorksheet,
    answers: bool = Query(default=False),
    claims: dict = Depends(verify_firebase_token),
):
    pdf_bytes = worksheet_to_pdf(body, include_answers=answers)
    suffix = "answer-key" if answers else "worksheet"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="grade-{body.grade}-{suffix}.pdf"'},
    )


@app.post("/export/worksheet/docx")
def export_worksheet_docx(
    body: GradeWorksheet,
    answers: bool = Query(default=False),
    claims: dict = Depends(verify_firebase_token),
):
    docx_bytes = worksheet_to_docx(body, include_answers=answers)
    suffix = "answer-key" if answers else "worksheet"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="grade-{body.grade}-{suffix}.docx"'},
    )


@app.post("/curriculum/ingest")
def ingest_curriculum(
    body: CurriculumIngestRequest,
    claims: dict = Depends(verify_firebase_token),
) -> CurriculumIngestResult:
    if not body.full_text.strip():
        raise HTTPException(status_code=400, detail="No text to save.")
    chunks_stored = ingest_curriculum_text(
        body.full_text,
        subject=body.subject,
        language=body.language,
        teacher_uid=claims["user_id"],
    )
    return CurriculumIngestResult(chunks_stored=chunks_stored)


@app.post("/review/simplify")
def review_simplify(
    body: SimplifyRequest,
    claims: dict = Depends(verify_firebase_token),
) -> ReviewTextResult:
    try:
        text = force_simplify(body.text, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    log_action(teacher_uid=claims["user_id"], action="simplify", content_type=body.content_type.value)
    return ReviewTextResult(text=text)


@app.post("/review/translate")
def review_translate(
    body: TranslateRequest,
    claims: dict = Depends(verify_firebase_token),
) -> ReviewTextResult:
    try:
        text = translate_text(body.text, body.target_language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    log_action(teacher_uid=claims["user_id"], action="translate", content_type=body.content_type.value)
    return ReviewTextResult(text=text)


@app.post("/review/edit")
def review_edit(
    body: EditRequest,
    claims: dict = Depends(verify_firebase_token),
) -> ReviewTextResult:
    if not body.instruction.strip():
        raise HTTPException(status_code=400, detail="Please describe the change you want.")
    try:
        text = apply_edit(body.text, body.instruction, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    log_action(teacher_uid=claims["user_id"], action="edit", content_type=body.content_type.value)
    return ReviewTextResult(text=text)


@app.post("/generate/lesson-plan")
def generate_lesson_plan_endpoint(
    body: LessonPlanRequest,
    claims: dict = Depends(verify_firebase_token),
) -> LessonPlanResult:
    if not any(dp.subjects for dp in body.day_plan):
        raise HTTPException(status_code=400, detail="Please add at least one subject.")
    if not any(st.grades for dp in body.day_plan for st in dp.subjects):
        raise HTTPException(status_code=400, detail="Please select at least one grade for each subject.")
    try:
        return generate_lesson_plan(body.day_plan, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/students")
def create_student(
    body: StudentCreateRequest,
    claims: dict = Depends(verify_firebase_token),
) -> Student:
    return add_student(body.name, body.grade, claims["user_id"])


@app.get("/students")
def get_students(
    grade: int | None = Query(default=None),
    claims: dict = Depends(verify_firebase_token),
) -> list[Student]:
    return list_students(claims["user_id"], grade)


@app.post("/quizzes")
def create_quiz(
    body: QuizCreateRequest,
    claims: dict = Depends(verify_firebase_token),
) -> Quiz:
    return add_quiz(body.title, body.subject, body.grade, claims["user_id"])


@app.get("/quizzes")
def get_quizzes(
    grade: int | None = Query(default=None),
    claims: dict = Depends(verify_firebase_token),
) -> list[Quiz]:
    return list_quizzes(claims["user_id"], grade)


@app.post("/attempts")
def create_attempt(
    body: AttemptCreateRequest,
    claims: dict = Depends(verify_firebase_token),
) -> Attempt:
    try:
        return record_attempt(
            body.quiz_id, body.student_id, body.score, body.max_score, claims["user_id"]
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/students/{student_id}/attempts")
def get_student_attempts(
    student_id: str,
    claims: dict = Depends(verify_firebase_token),
) -> list[Attempt]:
    try:
        return list_attempts_for_student(student_id, claims["user_id"])
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/daily-nugget")
def daily_nugget_endpoint(
    grade: int = Query(...),
    language: Language = Query(...),
    claims: dict = Depends(verify_firebase_token),
) -> DailyNuggetResult:
    try:
        return get_daily_nugget(grade, language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
