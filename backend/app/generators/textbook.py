from app.gemini_client import generate_structured, image_part
from app.schemas import TextbookPageResult

_SYSTEM_INSTRUCTION = """You are Sahayak, an AI teaching assistant. A teacher has uploaded a page
of educational content (as a photo, scanned PDF, Word document, or spreadsheet). Read it and identify:
- The school subject it covers
- The key concepts/topics taught on this page, as short phrases
- A short plain-English summary of what the page teaches
- A faithful transcription of the page's main text (full_text) - preserve the original wording,
  do not summarize or paraphrase this field

If the content is unclear or doesn't look like educational material, do your best to describe
what you can see."""

_FILE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}


def read_textbook_file(file_bytes: bytes, mime_type: str) -> TextbookPageResult:
    """For file types Gemini can read natively: images and PDFs."""
    if mime_type not in _FILE_MIME_TYPES:
        raise ValueError(f"Unsupported file type: {mime_type}")

    return generate_structured(
        contents=[
            "Read this page and extract the subject, key topics, and a summary.",
            image_part(file_bytes, mime_type),
        ],
        system_instruction=_SYSTEM_INSTRUCTION,
        schema=TextbookPageResult,
    )


def read_textbook_text(extracted_text: str) -> TextbookPageResult:
    """For file types extracted to plain text first: Word docs and Excel sheets."""
    if not extracted_text.strip():
        raise ValueError("No readable text found in this file.")

    result = generate_structured(
        contents=f"Here is the extracted text from the file:\n\n{extracted_text}",
        system_instruction=_SYSTEM_INSTRUCTION,
        schema=TextbookPageResult,
    )
    # The real extracted text is more faithful than anything Gemini could reproduce from it.
    result.full_text = extracted_text
    return result
