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
    is_regenerate: bool = False


class HyperlocalContentResult(BaseModel):
    title: str = Field(description="A short title for the generated content")
    content: str = Field(description="The generated story or explanation, in the requested language")
    language: Language


class KnowledgeBaseRequest(BaseModel):
    text: str = Field(description="The student's question, as relayed by the teacher")
    language: Language = Field(description="The language to answer in")
    is_regenerate: bool = False


class KnowledgeBaseResult(BaseModel):
    explanation: str = Field(description="A short, simple, accurate explanation of the concept")
    analogy: str = Field(description="A relatable local analogy that makes the explanation easier to grasp")
    language: Language


class TextbookPageResult(BaseModel):
    subject: str = Field(description="The school subject this page covers, e.g. Science, Maths, Geography")
    topics: list[str] = Field(description="Key concepts/topics covered on this page, as short phrases")
    summary: str = Field(description="A short summary of what this page teaches, in plain English")
    full_text: str = Field(
        description="A faithful transcription of the page's main textual content, preserving "
        "the original wording as closely as possible (not a summary). Used to ground future "
        "answers in the actual textbook content."
    )


class CurriculumIngestRequest(BaseModel):
    subject: str
    language: Language
    full_text: str


class CurriculumIngestResult(BaseModel):
    chunks_stored: int


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
        f"{_ICON_KEYS_TEXT}. A closely related icon (frog for a froglet, person for a farmer, "
        f"house for a village) is better than 'none'; use 'none' only if nothing is related."
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
    BLOCK = "block"


class VisualAidStage(DiagramStage):
    explanation: str = Field(
        description="3-4 short, simple sentences in the requested language: what happens at this "
        "stage and how, why it matters for the next stage, and an everyday village example"
    )


class LabelPlacement(BaseModel):
    stage: int = Field(description="The stage number, starting at 1")
    x: int = Field(description="Horizontal position from 0 (left edge) to 1000 (right edge)")
    y: int = Field(description="Vertical position from 0 (top edge) to 1000 (bottom edge)")


class LabelPlacements(BaseModel):
    placements: list[LabelPlacement]
    has_writing: bool = Field(
        description="True if any letters, words, numbers or scribbled text appear anywhere in the picture"
    )


class VisualAidRequest(BaseModel):
    text: str = Field(description="The teacher's description of what they want drawn")
    language: Language


class VisualAidDraft(BaseModel):
    title: str = Field(description="A short title for the visual aid in the requested language")
    layout: DiagramLayout = Field(
        description="'cycle' if the process repeats (e.g. water cycle), 'sequence' if it's a "
        "one-way process with a clear start and end (e.g. a plant growing from seed to tree), "
        "'block' if the teacher asks for a block diagram, flowchart or workflow"
    )
    stages: list[VisualAidStage] = Field(
        description="3-6 ordered stages, each with a label, matching icon and explanation"
    )
    caption: str = Field(
        description="One short sentence telling the teacher how to redraw this simply on a blackboard"
    )
    scene: str = Field(
        description="In English: a description of one picture an illustrator should draw to show "
        "the whole process, naming every object, where it sits and arrows showing movement"
    )


class VisualAidResult(BaseModel):
    title: str
    layout: DiagramLayout
    stages: list[VisualAidStage]
    svg: str
    caption: str
    language: Language
    image: str | None = Field(default=None, description="The illustration as a JPEG data URL")
    image_note: str | None = Field(default=None, description="Why there is no illustration, if there is none")
    label_positions: list[LabelPlacement] | None = Field(
        default=None, description="Where each stage label sits on the illustration, if it could be placed"
    )


class SimplifiedText(BaseModel):
    text: str = Field(description="The simplified version of the given text")


class ContentType(str, Enum):
    HYPERLOCAL_CONTENT = "hyperlocal_content"
    KNOWLEDGE_BASE = "knowledge_base"


class SimplifyRequest(BaseModel):
    text: str
    language: Language
    content_type: ContentType


class TranslateRequest(BaseModel):
    text: str
    target_language: Language
    content_type: ContentType


class EditRequest(BaseModel):
    text: str
    instruction: str
    language: Language
    content_type: ContentType


class ReviewTextResult(BaseModel):
    text: str


class ActivityType(str, Enum):
    DIRECT_TEACHING = "direct_teaching"
    INDEPENDENT_WORKSHEET = "independent_worksheet"
    GROUP_ACTIVITY = "group_activity"
    PEER_READING = "peer_reading"


class SubjectTopics(BaseModel):
    subject: str = Field(description="Subject name, e.g. Science, Math")
    topics: list[str] = Field(description="One or more topics to cover for this subject that day")
    grades: list[int] = Field(description="Which grades take this subject, e.g. [1, 2]")


class DayPlanInput(BaseModel):
    day: str = Field(description="A weekday name: Monday, Tuesday, Wednesday, Thursday, or Friday")
    subjects: list[SubjectTopics] = Field(
        description="One or more subjects covered that day, each with its own topics and grades"
    )


class LessonPlanRequest(BaseModel):
    day_plan: list[DayPlanInput] = Field(
        description="Which subjects/topics/grades to cover on which days - only include days "
        "you want active; days left out get no plan. Each subject specifies its own grades."
    )
    language: Language


# What Gemini is asked to produce for one grade's single (day, subject) slot (activity type, day,
# subject, and topics are all fixed by the teacher/our rotation logic - the model only writes
# the activity description).
class DayContentDraft(BaseModel):
    description: str = Field(
        description="1-2 sentences describing what the grade will actually do for this subject "
        "that day, covering the given topic(s) and matching the given activity type"
    )


class WeekContentDraftBatch(BaseModel):
    days: list[DayContentDraft] = Field(
        description="Exactly one entry per (day, subject) slot given, in the same order"
    )


class DayPlanEntry(BaseModel):
    grade: int
    subject: str
    activity_type: ActivityType
    topics: list[str]
    description: str


class DayPlan(BaseModel):
    day: str
    entries: list[DayPlanEntry]


class LessonPlanResult(BaseModel):
    days: list[DayPlan]
    language: Language


class StudentCreateRequest(BaseModel):
    name: str
    grade: int


class Student(BaseModel):
    id: str
    name: str
    grade: int


class QuizCreateRequest(BaseModel):
    title: str
    subject: str
    grade: int


class Quiz(BaseModel):
    id: str
    title: str
    subject: str
    grade: int


class AttemptCreateRequest(BaseModel):
    quiz_id: str
    student_id: str
    score: float
    max_score: float


class Attempt(BaseModel):
    id: str
    quiz_id: str
    student_id: str
    score: float
    max_score: float


class DailyNuggetDraft(BaseModel):
    fact: str = Field(description="A short, interesting 'did you know?' fact, 1-3 sentences")


class DailyNuggetResult(BaseModel):
    fact: str
    grade: int
    language: Language
    date: str
