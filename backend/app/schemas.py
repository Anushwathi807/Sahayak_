from enum import Enum

from pydantic import BaseModel, Field

from app.icons import ICON_KEYS

_ICON_KEYS_TEXT = ", ".join(ICON_KEYS)


class IntentCategory(str, Enum):
    HYPERLOCAL_CONTENT = "hyperlocal_content"
    KNOWLEDGE_BASE = "knowledge_base"
    WORKSHEET = "worksheet"
    VISUAL_AID = "visual_aid"
    LESSON_PLAN = "lesson_plan"
    UNCLEAR = "unclear"


class Language(str, Enum):
    HINDI = "Hindi"
    ENGLISH = "English"
    MARATHI = "Marathi"
    TAMIL = "Tamil"


class IntentResult(BaseModel):
    category: IntentCategory = Field(description="The type of request the teacher made")
    language: Language = Field(
        description="The language the teacher wrote in. Pick the closest of the 4 supported languages."
    )
    summary: str = Field(description="One short sentence restating what the teacher wants")


class HyperlocalContentRequest(BaseModel):
    text: str = Field(description="The teacher's original request")
    language: Language = Field(description="The language to generate the content in")


class HyperlocalContentResult(BaseModel):
    title: str = Field(description="A short title for the generated content")
    content: str = Field(description="The generated story or explanation, in the requested language")
    language: Language


class KnowledgeBaseRequest(BaseModel):
    text: str = Field(description="The student's question, as relayed by the teacher")
    language: Language = Field(description="The language to answer in")


class KnowledgeBaseResult(BaseModel):
    explanation: str = Field(description="A short, simple, accurate explanation of the concept")
    analogy: str = Field(description="A relatable local analogy that makes the explanation easier to grasp")
    language: Language


class TextbookPageResult(BaseModel):
    subject: str = Field(description="The school subject this page covers, e.g. Science, Maths, Geography")
    topics: list[str] = Field(description="Key concepts/topics covered on this page, as short phrases")
    summary: str = Field(description="A short summary of what this page teaches, in plain English")


class QuestionType(str, Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    MATCH_THE_FOLLOWING = "match_the_following"
    DIAGRAM_BASED = "diagram_based"


class WorksheetSpecItem(BaseModel):
    """One bucket the teacher asked for, e.g. '10 MCQ questions worth 2 marks each'."""

    type: QuestionType
    marks: int = Field(description="Marks each question in this bucket is worth")
    count: int = Field(description="How many questions of this type/marks to generate")


class WorksheetRequest(BaseModel):
    subject: str
    topics: list[str]
    summary: str
    grades: list[int] = Field(description="Grade levels to generate worksheets for, e.g. [2, 4, 5]")
    language: Language
    spec: list[WorksheetSpecItem] = Field(description="The question composition the teacher chose")


class MatchPair(BaseModel):
    left: str
    right: str


class DiagramStage(BaseModel):
    label: str = Field(description="Short stage/step name, under 15 characters")
    icon: str = Field(
        description=f"The closest matching icon for this stage, chosen from exactly this list: "
        f"{_ICON_KEYS_TEXT}. Use 'none' if nothing matches well."
    )


# What Gemini is asked to produce for one question (type/marks are fixed by our own code,
# not left to the model, so they can never come back wrong).
class WorksheetQuestionDraft(BaseModel):
    question: str
    options: list[str] | None = Field(
        default=None, description="4 options, ONLY if this is an mcq question. Null otherwise."
    )
    match_pairs: list[MatchPair] | None = Field(
        default=None,
        description="ONLY if this is a match_the_following question: 4-6 left/right pairs, "
        "where 'right' is the correct match for 'left'. Null otherwise.",
    )
    diagram_description: str | None = Field(
        default=None,
        description="ONLY if this is a diagram_based question: a short description of the diagram. Null otherwise.",
    )
    diagram_stages: list[DiagramStage] | None = Field(
        default=None,
        description="ONLY if this is a diagram_based question: 3-6 ordered stages of a cyclical "
        "process, each with a label and matching icon. We draw the actual diagram ourselves from "
        "these - do not generate any image or SVG. Null otherwise.",
    )
    diagram_hidden_index: int | None = Field(
        default=None,
        description="ONLY if this is a diagram_based question: the 0-based index into diagram_stages "
        "that should be left blank on the diagram for the student to identify (the answer). Null otherwise.",
    )
    diagram_svg: str | None = Field(
        default=None,
        description="Leave this null. It is filled in by our own code, not by you.",
    )
    answer: str = Field(
        description="The correct answer, for the teacher's reference. For match_the_following, "
        "summarize the correct pairing as text."
    )


class QuestionDraftBatch(BaseModel):
    questions: list[WorksheetQuestionDraft]


class WorksheetQuestion(WorksheetQuestionDraft):
    type: QuestionType
    marks: int


class GradeWorksheet(BaseModel):
    grade: int
    title: str
    instructions: str = Field(description="One short instruction line for students, e.g. 'Answer all questions'")
    questions: list[WorksheetQuestion]
    total_marks: int = 0
    language: Language


class WorksheetResult(BaseModel):
    worksheets: list[GradeWorksheet]


class DiagramLayout(str, Enum):
    CYCLE = "cycle"
    SEQUENCE = "sequence"


class VisualAidRequest(BaseModel):
    text: str = Field(description="The teacher's description of what they want drawn")
    language: Language


class VisualAidDraft(BaseModel):
    layout: DiagramLayout = Field(
        description="'cycle' if the process repeats (e.g. water cycle), 'sequence' if it's a "
        "one-way process with a clear start and end (e.g. a plant growing from seed to tree)"
    )
    stages: list[DiagramStage] = Field(description="3-6 ordered stages, each with a label and matching icon")
    caption: str = Field(
        description="One short sentence telling the teacher how to redraw this simply on a blackboard"
    )


class VisualAidResult(BaseModel):
    layout: DiagramLayout
    stages: list[DiagramStage]
    svg: str
    caption: str
    language: Language
