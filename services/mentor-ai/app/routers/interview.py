"""
Interview Router — DeployKaro
Endpoints: POST /interview/start, POST /interview/answer, GET /interview/summary/{session_id}
Uses Prisma Python client via subprocess calls to the content service DB.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
import os

router = APIRouter(prefix="/interview", tags=["Interview"])

CONTENT_SERVICE_URL = os.getenv("CONTENT_SERVICE_URL", "http://localhost:3001")


# ─── Schemas ──────────────────────────────────────────────────────────────────

class StartInterviewRequest(BaseModel):
    user_id: str
    experience_level: str  # beginner, intermediate, senior
    duration_min: int      # 10, 30, or 60


class QuestionOut(BaseModel):
    id: int
    question: str
    category: str
    difficulty: str


class StartInterviewResponse(BaseModel):
    session_id: str
    questions: List[QuestionOut]
    total_questions: int
    duration_min: int


class AnswerRequest(BaseModel):
    session_id: str
    question_id: int
    answer_text: str


class AnswerResponse(BaseModel):
    debrief_rating: str   # excellent / good / needs_work
    debrief_badge: str    # emoji badge
    feedback: str


class SummaryResponse(BaseModel):
    session_id: str
    total_questions: int
    answered: int
    rating_counts: Dict[str, int]
    score_pct: float
    feedback_summary: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _rate_answer(text: str) -> tuple[str, str, str]:
    """Simple heuristic debrief: length + keyword check."""
    length = len(text.strip())
    
    # Check for substance keywords
    keywords = ["because", "when", "example", "scenario", "would", "should", "configure", "deploy",
                "kubernetes", "docker", "terraform", "aws", "ci/cd", "pipeline", "monitor", "scale"]
    keyword_hits = sum(1 for kw in keywords if kw.lower() in text.lower())

    if length >= 120 and keyword_hits >= 2:
        return "excellent", "✅", "Strong answer! You covered the key concepts with good detail."
    elif length >= 60 or (length >= 40 and keyword_hits >= 1):
        return "good", "🟡", "Decent answer. Try to add a specific example or tool to strengthen it."
    else:
        return "needs_work", "❌", "Too brief. A senior engineer would expand on the 'why' and give a concrete scenario."


def _question_count_for_duration(duration_min: int, experience: str) -> int:
    """Return question count based on duration and experience level."""
    base = {10: 10, 30: 30, 60: 45}
    count = base.get(duration_min, 10)
    # Seniors get slightly more questions
    if experience == "senior" and duration_min >= 30:
        count = min(count + 5, 50)
    return count


def _difficulty_filter(experience: str) -> List[str]:
    """Map experience to question difficulty distribution."""
    if experience == "beginner":
        return ["easy", "easy", "medium"]        # mostly easy
    elif experience == "intermediate":
        return ["easy", "medium", "medium", "hard"]
    else:  # senior
        return ["medium", "hard", "hard", "hard"]  # mostly hard


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(req: StartInterviewRequest):
    """Start an interview session, fetch questions from content service DB."""
    if req.duration_min not in (10, 30, 60):
        raise HTTPException(status_code=400, detail="duration_min must be 10, 30, or 60")

    count = _question_count_for_duration(req.duration_min, req.experience_level)
    difficulties = _difficulty_filter(req.experience_level)

    # Fetch questions from content service
    try:
        async with httpx.AsyncClient() as client:
            params = {"count": count, "difficulties": ",".join(difficulties)}
            resp = await client.get(
                f"{CONTENT_SERVICE_URL}/api/interview/questions",
                params=params,
                timeout=10.0,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="Failed to fetch questions from content service")
            data = resp.json()
            questions = data.get("questions", [])
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Content service unavailable")

    # Create session in content service
    try:
        async with httpx.AsyncClient() as client:
            session_resp = await client.post(
                f"{CONTENT_SERVICE_URL}/api/interview/sessions",
                json={
                    "userId": req.user_id,
                    "durationMin": req.duration_min,
                    "experienceLevel": req.experience_level,
                },
                timeout=10.0,
            )
            if session_resp.status_code not in (200, 201):
                raise HTTPException(status_code=502, detail="Failed to create interview session")
            session_data = session_resp.json()
            session_id = session_data["id"]
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Content service unavailable")

    return StartInterviewResponse(
        session_id=session_id,
        questions=[QuestionOut(**q) for q in questions[:count]],
        total_questions=len(questions[:count]),
        duration_min=req.duration_min,
    )


@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(req: AnswerRequest):
    """Submit an answer and get back an AI-powered debrief."""
    rating, badge, feedback = _rate_answer(req.answer_text)

    # Save to content service
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{CONTENT_SERVICE_URL}/api/interview/answers",
                json={
                    "sessionId": req.session_id,
                    "questionId": req.question_id,
                    "answerText": req.answer_text,
                    "debriefRating": badge,
                },
                timeout=10.0,
            )
    except httpx.RequestError:
        pass  # non-blocking — still return debrief

    return AnswerResponse(
        debrief_rating=rating,
        debrief_badge=badge,
        feedback=feedback,
    )


@router.get("/summary/{session_id}", response_model=SummaryResponse)
async def get_summary(session_id: str):
    """Get the performance summary for a completed session."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{CONTENT_SERVICE_URL}/api/interview/sessions/{session_id}/summary",
                timeout=10.0,
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Session not found")
            data = resp.json()
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Content service unavailable")

    rating_counts = data.get("ratingCounts", {"✅": 0, "🟡": 0, "❌": 0})
    total = sum(rating_counts.values())
    excellent = rating_counts.get("✅", 0)
    score_pct = round((excellent / total * 100) if total > 0 else 0, 1)

    if score_pct >= 80:
        feedback_summary = "Excellent performance! You're ready for senior DevOps interviews."
    elif score_pct >= 60:
        feedback_summary = "Good effort. Focus on elaborating with real examples and tooling."
    else:
        feedback_summary = "Keep practicing. Review the flagged areas and try again."

    return SummaryResponse(
        session_id=session_id,
        total_questions=data.get("totalQuestions", total),
        answered=total,
        rating_counts=rating_counts,
        score_pct=score_pct,
        feedback_summary=feedback_summary,
    )
