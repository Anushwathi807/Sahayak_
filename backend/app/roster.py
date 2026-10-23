from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from app.firestore_client import db
from app.schemas import Attempt, Quiz, Student

_STUDENTS = "students"
_QUIZZES = "quizzes"
_ATTEMPTS = "attempts"


class NotFoundError(Exception):
    """Raised when a referenced document doesn't exist or doesn't belong to this teacher."""


def add_student(name: str, grade: int, teacher_uid: str) -> Student:
    ref = db.collection(_STUDENTS).add({"name": name, "grade": grade, "teacher_uid": teacher_uid})
    doc_id = ref[1].id
    return Student(id=doc_id, name=name, grade=grade)


def list_students(teacher_uid: str, grade: int | None = None) -> list[Student]:
    query = db.collection(_STUDENTS).where("teacher_uid", "==", teacher_uid)
    if grade is not None:
        query = query.where("grade", "==", grade)
    return [Student(id=doc.id, name=doc.get("name"), grade=doc.get("grade")) for doc in query.get()]


def _get_owned_doc(collection: str, doc_id: str, teacher_uid: str):
    doc = db.collection(collection).document(doc_id).get()
    if not doc.exists or doc.get("teacher_uid") != teacher_uid:
        raise NotFoundError(f"{collection[:-1]} not found")
    return doc


def add_quiz(title: str, subject: str, grade: int, teacher_uid: str) -> Quiz:
    ref = db.collection(_QUIZZES).add(
        {"title": title, "subject": subject, "grade": grade, "teacher_uid": teacher_uid}
    )
    doc_id = ref[1].id
    return Quiz(id=doc_id, title=title, subject=subject, grade=grade)


def list_quizzes(teacher_uid: str, grade: int | None = None) -> list[Quiz]:
    query = db.collection(_QUIZZES).where("teacher_uid", "==", teacher_uid)
    if grade is not None:
        query = query.where("grade", "==", grade)
    return [
        Quiz(id=doc.id, title=doc.get("title"), subject=doc.get("subject"), grade=doc.get("grade"))
        for doc in query.get()
    ]


def record_attempt(
    quiz_id: str, student_id: str, score: float, max_score: float, teacher_uid: str
) -> Attempt:
    # Ownership checks: a teacher can only record attempts against their own students/quizzes.
    _get_owned_doc(_QUIZZES, quiz_id, teacher_uid)
    _get_owned_doc(_STUDENTS, student_id, teacher_uid)

    ref = db.collection(_ATTEMPTS).add(
        {
            "quiz_id": quiz_id,
            "student_id": student_id,
            "score": score,
            "max_score": max_score,
            "teacher_uid": teacher_uid,
            "timestamp": SERVER_TIMESTAMP,
        }
    )
    doc_id = ref[1].id
    return Attempt(id=doc_id, quiz_id=quiz_id, student_id=student_id, score=score, max_score=max_score)


def list_attempts_for_student(student_id: str, teacher_uid: str) -> list[Attempt]:
    _get_owned_doc(_STUDENTS, student_id, teacher_uid)
    query = (
        db.collection(_ATTEMPTS)
        .where("student_id", "==", student_id)
        .where("teacher_uid", "==", teacher_uid)
    )
    return [
        Attempt(
            id=doc.id,
            quiz_id=doc.get("quiz_id"),
            student_id=doc.get("student_id"),
            score=doc.get("score"),
            max_score=doc.get("max_score"),
        )
        for doc in query.get()
    ]
