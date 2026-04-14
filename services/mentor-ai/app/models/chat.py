from pydantic import BaseModel
from typing import List, Optional

class ChatContext(BaseModel):
    cloud_context: str = "AWS"
    architect_mode: bool = False
    completed_concepts: List[str] = []
    active_track_slug: str = "my-first-deploy"
    certification: Optional[str] = "AWS Cloud Practitioner"
    mentor_mode: str = "learning" # learning, certification, interview
    step_context: Optional[dict] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    persona: Optional[str] = "buddy-english"
    history: List[ChatMessage] = []
    context: ChatContext
