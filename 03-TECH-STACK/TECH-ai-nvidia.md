# TECH STACK — NVIDIA NIM API Integration + RAG Pipeline
## DeployKaro: Complete AI Stack

---

## Why NVIDIA NIM

| Requirement | NVIDIA NIM Advantage |
|---|---|
| Sub-2s mentor responses | Optimized inference on NVIDIA H100 GPUs |
| Regional language understanding | Llama 3.1 405B multilingual capability |
| Code generation | Best-in-class code models available via NIM |
| Embedding + reranking | nv-embedqa + rerank models for RAG pipeline |
| Cost control | Pay-per-token, no GPU infrastructure to manage |
| OpenAI-compatible API | Easy integration, familiar SDK |

---

## Models Used and Their Roles

### 1. meta/llama-3.1-405b-instruct
**Role:** Primary mentor reasoning engine
**Used for:**
- Complex concept explanations
- Code and IaC generation (Terraform, CDK, Pulumi)
- Architecture review and feedback
- Certification exam question explanation
- Multi-turn conversations requiring deep context
- Cross-cloud comparison questions

```python
{
    "model": "meta/llama-3.1-405b-instruct",
    "temperature": 0.7,
    "max_tokens": 400,   # Slightly higher for cert mode + doc citations
    "top_p": 0.9,
    "stream": True
}
```

---

### 2. mistralai/mistral-nemo-12b-instruct
**Role:** Fast response model for simple queries
**Used for:**
- Simple acknowledgments and greetings
- Concept questions (cache miss, structured answers)
- Quick follow-up responses

```python
{
    "model": "mistralai/mistral-nemo-12b-instruct",
    "temperature": 0.5,
    "max_tokens": 200,
    "stream": True
}
```

---

### 3. nvidia/nv-embedqa-e5-v5
**Role:** Embedding engine for RAG pipeline
**Used for:**
- Embedding official documentation chunks (passage mode)
- Embedding user questions for semantic search (query mode)
- Matching user's free-text onboarding answer to a track
- Finding relevant certification topics from user's question

```python
# For indexing docs:
{"model": "nvidia/nv-embedqa-e5-v5", "input": chunk_text, "input_type": "passage"}

# For searching:
{"model": "nvidia/nv-embedqa-e5-v5", "input": user_question, "input_type": "query"}
```

---

### 4. nvidia/rerank-qa-mistral-4b
**Role:** Reranker for RAG retrieval quality
**Used for:**
- Reranking top-20 semantic search results → return top-3 most relevant
- Ensuring the most relevant doc chunk is injected into the mentor prompt
- Ranking certification practice questions by relevance to user's weak areas

---

## Complete Integration Code

```python
# services/mentor-ai/app/services/nvidia.py

from openai import AsyncOpenAI
from typing import AsyncGenerator
import os

client = AsyncOpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"]
)

async def stream_mentor_response(
    persona_prompt: str,
    conversation_history: list,
    user_message: str,
    model: str,
    rag_context: str | None = None
) -> AsyncGenerator[str, None]:

    system_content = persona_prompt
    if rag_context:
        system_content += f"\n\n{rag_context}"

    messages = [
        {"role": "system", "content": system_content},
        *conversation_history[-20:],
        {"role": "user", "content": user_message}
    ]

    stream = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
        max_tokens=400,
        stream=True
    )

    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


async def get_embeddings(texts: list[str], input_type: str = "query") -> list[list[float]]:
    response = await client.embeddings.create(
        model="nvidia/nv-embedqa-e5-v5",
        input=texts,
        input_type=input_type,
        encoding_format="float"
    )
    return [item.embedding for item in response.data]


async def rerank_results(query: str, passages: list[str]) -> list[dict]:
    response = await client.reranking.create(
        model="nvidia/rerank-qa-mistral-4b",
        query=query,
        passages=[{"text": p} for p in passages]
    )
    return response.rankings
```

---

## Full Request Pipeline (with RAG)

```python
# services/mentor-ai/app/routers/mentor.py

@router.post("/mentor/chat")
async def chat(request: ChatRequest):

    # 1. Build system prompt (persona + cloud context + cert mode)
    system_prompt = build_system_prompt(
        persona=request.persona,
        cloud_context=request.context.cloud_context,
        architect_mode=request.context.architect_mode,
        certification=request.context.certification
    )

    # 2. Retrieve relevant official docs (RAG)
    doc_chunks = await retrieve_doc_context(
        user_question=request.message,
        cloud_context=request.context.cloud_context,
        certification=request.context.certification
    )
    rag_context = build_rag_context(doc_chunks)

    # 3. Route to appropriate model
    model = route_to_model(
        user_message=request.message,
        conversation_depth=len(request.history),
        architect_mode=request.context.architect_mode,
        cloud_context=request.context.cloud_context
    )

    # 4. Stream response
    async def generate():
        async for token in stream_mentor_response(
            system_prompt, request.history, request.message, model, rag_context
        ):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Model-Used": model, "X-RAG-Chunks": str(len(doc_chunks))}
    )
```

---

## Services Architecture (Updated)

```
┌─────────────────────────────────────────────────────────────┐
│                      MENTOR AI SERVICE                      │
│  - Persona prompt loading                                   │
│  - Cloud context injection                                  │
│  - Certification mode injection                             │
│  - RAG context injection                                    │
│  - Model routing                                            │
│  - NVIDIA NIM streaming                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ calls
┌──────────────────────────▼──────────────────────────────────┐
│                       RAG SERVICE                           │
│  - Embed user question (nv-embedqa-e5-v5)                  │
│  - Search pgvector docs index                               │
│  - Rerank results (rerank-qa-mistral-4b)                   │
│  - Return top-3 doc chunks with citations                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ reads from
┌──────────────────────────▼──────────────────────────────────┐
│                   DOCS INGESTION SERVICE                    │
│  - Weekly crawl of all official docs sources                │
│  - Chunk → Embed → Store in pgvector                       │
│  - Staleness detection and re-ingestion                     │
│  - Sources: AWS, GCP, Azure, K8s, Docker, Terraform,       │
│    Helm, ArgoCD, Prometheus, Grafana, GitHub Actions,      │
│    GitLab CI, Jenkins, Vault, Ansible, OpenTelemetry       │
│  - Certification exam guides (official syllabi)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Required

```bash
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx

# Model overrides
NVIDIA_MENTOR_MODEL=meta/llama-3.1-405b-instruct
NVIDIA_FAST_MODEL=mistralai/mistral-nemo-12b-instruct
NVIDIA_EMBED_MODEL=nvidia/nv-embedqa-e5-v5
NVIDIA_RERANK_MODEL=nvidia/rerank-qa-mistral-4b

# RAG config
RAG_TOP_K=5                    # Number of doc chunks to retrieve
RAG_MIN_SIMILARITY=0.7         # Minimum similarity score to include a chunk
DOCS_CRAWL_SCHEDULE="0 2 * * 0"  # Weekly Sunday 2am
```

---

## Rate Limits and Error Handling

```python
RETRY_CONFIG = {
    "max_retries": 3,
    "retry_on": [429, 500, 502, 503],
    "backoff_factor": 2,
    "fallback_model": "mistralai/mistral-nemo-12b-instruct"
}

# If NVIDIA API is down:
# → Return cached response if available
# → If no cache: return static fallback + official docs link
# → Log incident
# → Alert on-call
```

---

## Local Dev: NVIDIA Mock

```python
# services/mentor-ai/app/services/nvidia_mock.py
# Used when NVIDIA_API_KEY is not set (local dev, CI)

async def stream_mentor_response_mock(...) -> AsyncGenerator[str, None]:
    mock_response = f"[MOCK] Here's a simple explanation with an analogy first: ..."
    for word in mock_response.split():
        yield word + " "
        await asyncio.sleep(0.05)  # Simulate streaming
    yield "[DONE]"
```

Set `NVIDIA_USE_MOCK=true` in local `.env` to use the mock.
