from pydantic import BaseModel
from typing import List, Optional

class ChatContext(BaseModel):
    cloud_context: str = "AWS"            # Target cloud (AWS, GCP, Azure, On-Prem)
    architect_mode: bool = False          # Whether the user wants architect-level deep dives
    certification: Optional[str] = None   # Which cert they are aiming for (e.g., "AWS SAA-C03")

class Message(BaseModel):
    role: str       # "user" or "assistant"
    content: str    # The actual message text

class ChatRequest(BaseModel):
    persona: str = "anna"                 # anna, bhai, didi, buddy
    message: str                          # The current user question
    history: List[Message] = []           # Array of previous messages for memory
    context: ChatContext                  # User's current learning context
