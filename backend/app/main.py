from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from app.auth import verify_firebase_token
from app.export import worksheet_to_docx, worksheet_to_pdf
from app.file_extraction import extract_docx_text, extract_xlsx_text
from app.gemini_client import GeminiUnavailableError
from app.generators.hyperlocal import generate_hyperlocal_content
from app.generators.knowledge_base import generate_knowledge_base_answer
from app.generators.textbook import read_textbook_file, read_textbook_text
from app.generators.visual_aid import generate_visual_aid
from app.generators.worksheet import generate_worksheets
from app.router import classify_intent
from app.schemas import (
    GradeWorksheet,
    HyperlocalContentRequest,
    HyperlocalContentResult,
    IntentResult,
    KnowledgeBaseRequest,
    KnowledgeBaseResult,
    TextbookPageResult,
    VisualAidRequest,
    VisualAidResult,
    WorksheetRequest,
    WorksheetResult,
)

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
        return generate_hyperlocal_content(body.text, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/generate/knowledge-base")
def generate_knowledge_base(
    body: KnowledgeBaseRequest,
    claims: dict = Depends(verify_firebase_token),
) -> KnowledgeBaseResult:
    try:
        return generate_knowledge_base_answer(body.text, body.language)
    except GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


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
