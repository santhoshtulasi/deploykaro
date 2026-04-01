import asyncio
from typing import AsyncGenerator

async def stream_mentor_response_mock(
    persona_prompt: str,
    conversation_history: list,
    user_message: str,
    model: str,
    rag_context: str | None = None
) -> AsyncGenerator[str, None]:
    
    # We create a fake response that proves it received our data
    mock_response = (
        f"🤖 **[MOCK MODE ACTIVE]** Hello!\n\n"
        f"I am pretending to be the `{model}` model.\n"
        f"I received your message: *\"{user_message}\"*\n\n"
        f"I am streaming this fake response word-by-word so you can build the Next.js "
        f"Frontend UI without spending any real NVIDIA API credits!"
    )
    
    # Send it back one word at a time, pausing for 50 milliseconds to simulate a real AI generating text
    for word in mock_response.split(" "):
        yield word + " "
        await asyncio.sleep(0.05)
