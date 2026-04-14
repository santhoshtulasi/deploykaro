from pydantic import BaseModel, Field
from typing import List, Optional

class LearningPlanRequest(BaseModel):
    app_type: str = Field(..., description="The type of application or model the user wants to deploy")
    cloud_provider: str = Field(..., description="Target cloud provider (e.g. 'AWS', 'GCP', 'Vercel')")
    repo_url: Optional[str] = Field(None, description="Public repository URL for context")
    tools: List[str] = Field(default_factory=list, description="Preferred tools")
    experience_level: str = Field("beginner", description="User's experience level")
    language: str = Field("english", description="User's preferred language: english, tamil, kannada, telugu")

class JargonTerm(BaseModel):
    term: str                    # e.g. "SSL"
    plain_meaning: str           # e.g. "A lock that encrypts data traveling between browser and server"
    analogy: Optional[str] = None # e.g. "Like a sealed envelope — only the receiver can open it"

class LearningStep(BaseModel):
    step_number: int
    title: str
    description: str
    actionable_command: Optional[str] = None
    tools_used: List[str] = []
    jargon_terms: List[JargonTerm] = []  # technical terms explained in plain language

class LearningPlanResponse(BaseModel):
    project_title: str
    architecture_summary: str
    steps: List[LearningStep]
