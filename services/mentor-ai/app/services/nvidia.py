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
    cloud_context: str = "aws",
    mentor_mode: str = "learning",
    rag_context: str | None = None
) -> AsyncGenerator[str, None]:
    
    # 1. Base Persona (ANNA, BHAI, etc.)
    system_content = persona_prompt
    
    # 2. Inject Career Expert Modules based on mode
    if mentor_mode == "certification":
        system_content += "\n\n--- CERTIFICATION COACH MODE ACTIVE ---\n"
        system_content += "1. You are a High-Speed Certification Coach for AWS SAA and CKA.\n"
        system_content += "2. Frame every explanation around its specific Exam Domain and highlight WHY it matters for the exam.\n"
        system_content += "3. End every explanation with an 'Exam Tip' in Tanglish/Slang format.\n"
    elif mentor_mode == "interview":
        system_content += "\n\n--- MOCK INTERVIEW MODE ACTIVE ---\n"
        system_content += "1. YOU MUST SPEAK EXCLUSIVELY IN ENGLISH. No Tanglish/slang icons allowed here.\n"
        system_content += "2. You are a Senior DevOps Interviewer. Ask one question at a time.\n"
        system_content += "3. Give a 'Debrief': ✅ Strong | 🟡 Needs Work | ❌ Missed the Mark.\n"
    
    # 3. Add Cloud Context
    system_content += f"\n\nUSER CLOUD CONTEXT: {cloud_context.upper()}"
    
    # 4. Add RAG Context if available
    if rag_context:
        system_content += f"\n\n--- OFFICIAL DOCUMENTATION CONTEXT ---\n{rag_context}\nGround your technical facts in this source."

    # 5. FINAL HIGH-PRIORITY RULES (THE 'GOLDEN RULES')
    # These are at the bottom because LLMs prioritize end-of-prompt instructions.
    system_content += (
        "\n\n--- MANDATORY OUTPUT RULES (HIGHEST PRIORITY) ---\n"
        "1. VISUAL TRIGGER: At the START of your response, if you are explaining a basic concept (Docker, K8s, Cloud), you MUST use the machine tag [VISUAL:vis_id].\n"
        "2. DIRECT-TRIGGER BUTTON: You MUST end every response with the exact CTA: [Show me visually|vis_id] OR [Practice this concept]. Never omit the '|vis_id' if a visual is available.\n"
        "3. LANGUAGE LOCK: You MUST stay in the user's language (Tamil/Tanglish for Anna). Never revert to plain English. Start EVERY message with a local greeting like 'Machan' or 'Guru' or 'Babu'.\n"
        "4. NO TEXT VISUALS: Do NOT describe visuals in text. Only use the machine tags.\n"
        "5. ANALOGY VARIETY: Do NOT use the 'Tiffin Box' analogy more than once. Switch to 'Amazon Parcel' or 'Lego Kit' if asked again.\n\n"
        "--- VISUAL ID CATALOG (Use for [VISUAL:id] and [Show me visually|id]) ---\n"
        "- vis_server_kitchen: General Server analogy\n"
        "- vis_docker_tiffin: Docker analogy\n"
        "- vis_cloud_electricity: Cloud analogy\n"
        "- vis_dockerfile: Dockerfile analogy\n"
        "- vis_k8s_fleet: K8s analogy\n"
        "- vis_software_lego: Monolith vs Microservices analogy"
    )

    # 6. Build the message array history
    messages = [
        {"role": "system", "content": system_content}
    ]
    
    # Add the last 20 messages of history so the AI remembers the conversation
    if conversation_history:
        messages.extend(conversation_history[-20:])
        
    # Finally, add the current message
    messages.append({"role": "user", "content": user_message})

    try:
        # 7. Ask the NVIDIA GPU to stream the answer back
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=500,
            stream=True
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        yield f"\n\n⚠️ Error connecting to NVIDIA NIM API: {str(e)}"
