from openai import AsyncOpenAI
from typing import AsyncGenerator
import os
import asyncio

# The client that talks to NVIDIA's cloud servers
client = AsyncOpenAI(
    base_url=os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
    api_key=os.environ.get("NVIDIA_API_KEY", "missing_key")
)

async def stream_mentor_response(
    persona_prompt: str,
    conversation_history: list,
    user_message: str,
    model: str,
    rag_context: str | None = None
) -> AsyncGenerator[str, None]:
    
    # 1. Start with the Persona (e.g., "You are ANNA, speaking Tamil...")
    system_content = persona_prompt
    
    # 2. Add any official documentation context if RAG is used
    if rag_context:
        system_content += f"\n\n--- RECENT DOCUMENTATION SEARCH ---\n{rag_context}"

    # 3. Build the message array history
    messages = [
        {"role": "system", "content": system_content}
    ]
    
    # Add the last 20 messages of history so the AI remembers the conversation
    if conversation_history:
        messages.extend(conversation_history[-20:])
        
    # Finally, add the current thing the user just typed
    messages.append({"role": "user", "content": user_message})

    try:
        # 4. Ask the NVIDIA GPU to stream the answer back to us real-time
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=400,
            stream=True
        )

        async for chunk in stream:
            # Yield (send) each word/token as soon as the NVIDIA GPU computes it
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        yield f"\n\n⚠️ Error connecting to NVIDIA NIM API: {str(e)}"
