from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import os
from app.models.chat import ChatRequest
from app.services.nvidia import stream_mentor_response
from app.services.nvidia_mock import stream_mentor_response_mock

router = APIRouter(prefix="/mentor", tags=["mentor"])

@router.post("/chat")
async def handle_mentor_chat(request: ChatRequest):
    # 1. Figure out which powerful NVIDIA model we're using
    target_model = os.environ.get("NVIDIA_MENTOR_MODEL", "meta/llama-3.1-405b-instruct")

    # 2. Build the Persona (Later we will read this from the 02-PRP files)
    persona_prompt = (
        f"You are a helpful DevOps AI mentor named {request.persona.upper()}. "
        f"The user is asking about {request.context.cloud_context}. "
        f"Do your best to help them learn visually and simply!"
    )
    
    # 3. Are we testing locally without a real API key?
    use_mock = os.environ.get("NVIDIA_USE_MOCK", "false").lower() == "true"
    
    # 4. Convert history to dictionary format for the AI SDK
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]

    # 5. Connect to the Brain (Mock or Real)
    if use_mock:
        generator = stream_mentor_response_mock(
            persona_prompt=persona_prompt,
            conversation_history=history_dicts,
            user_message=request.message,
            model=target_model
        )
    else:
        # REAL NVIDIA API INSTANCE
        generator = stream_mentor_response(
            persona_prompt=persona_prompt,
            conversation_history=history_dicts,
            user_message=request.message,
            model=target_model
        )

    # 6. Stream the text back to the frontend instantly letter-by-letter
    async def sse_event_stream():
        async for chunk in generator:
            # SSE generic format: "data: chunk\n\n"
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_event_stream(), media_type="text/event-stream")
