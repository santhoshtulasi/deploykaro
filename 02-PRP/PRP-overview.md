# PRP — Product Requirement Prompts
## DeployKaro: What Are PRPs and How to Use Them

---

## What Is a PRP?

A Product Requirement Prompt (PRP) is a structured prompt document used to instruct
AI systems (NVIDIA NIM models, code generators, content generators) on exactly how
to behave for a specific feature or module of DeployKaro.

PRPs are the bridge between the PRD (what we want) and the actual AI behavior (what gets built).

---

## PRP Structure

Every PRP follows this structure:

```
1. CONTEXT        — What feature/module this prompt serves
2. ROLE           — What role the AI should play
3. CONSTRAINTS    — Hard rules the AI must never break
4. BEHAVIOR       — How the AI should respond
5. OUTPUT FORMAT  — Exact format of AI responses
6. EXAMPLES       — Good and bad response examples
7. FALLBACKS      — What to do when AI is uncertain
```

---

## PRP Index

| PRP File | Purpose | Used By |
|---|---|---|
| PRP-mentor-ai.md | Core mentor conversation behavior + certification mode | NVIDIA NIM Chat API |
| PRP-visual-engine.md | Visual concept generation | Frontend animation system |
| PRP-certification.md | Certification exam prep behavior and question patterns | NVIDIA NIM + Cert Service |
| PRP-docs-rag.md | Official documentation RAG pipeline behavior | RAG Service + Mentor AI |
| PRP-repo-analysis.md | Repository analysis: architecture detection, error diagnosis, interview prep from real code | Mentor AI Service |
| PRP-interview-prep.md | AI mock interview behavior (English only) | Mentor AI + Career Service |
| PRP-resume-guidance.md | Resume review and builder behavior | Mentor AI + Career Service |
| PROMPT-anna-tamil.md | ANNA persona system prompt | NIM API system message |
| PROMPT-bhai-kannada.md | BHAI persona system prompt | NIM API system message |
| PROMPT-didi-telugu.md | DIDI persona system prompt | NIM API system message |
| PROMPT-buddy-english.md | BUDDY persona system prompt | NIM API system message |
| PROMPT-routing-logic.md | Model routing decisions | API Gateway / FastAPI |

---

## How PRPs Are Used in the Codebase

```python
# In the FastAPI mentor service:
# 1. Load persona system prompt from PRP file
# 2. Inject cloud context + certification mode context
# 3. Inject RAG context from official docs (if relevant passage found)
# 4. Append user message
# 5. Send to NVIDIA NIM API
# 6. Return structured response

def build_mentor_request(
    persona: str,
    user_message: str,
    history: list,
    cloud_context: str,
    certification_mode: dict | None,
    rag_context: str | None
):
    system_prompt = load_prp(f"PROMPT-{persona}.md")
    system_prompt += load_cloud_context(cloud_context)
    if certification_mode:
        system_prompt += load_prp("PRP-certification.md")
    if rag_context:
        system_prompt += f"\n\nRELEVANT OFFICIAL DOCUMENTATION:\n{rag_context}\nAlways cite this source in your response."

    return {
        "model": NVIDIA_CONFIG["models"]["mentor_chat"],
        "messages": [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 400  # Slightly higher for certification responses with doc citations
    }
```

---

## PRP Versioning

PRPs are versioned like software. When mentor behavior needs to change:
- Create new version: `PROMPT-anna-tamil-v2.md`
- A/B test old vs new version with 10% of users
- Promote to default after validation
- Never delete old versions — keep for rollback

---

## Official Docs RAG Pipeline Overview

```
User asks a question
        │
        ▼
Embed user question (nvidia/nv-embedqa-e5-v5)
        │
        ▼
Search pgvector index of official docs chunks
        │
        ▼
Rerank top 5 results (nvidia/rerank-qa-mistral-4b)
        │
        ▼
Inject top result as RAG context into system prompt
        │
        ▼
Mentor responds grounded in official documentation
        │
        ▼
Response includes doc citation (platform + section + URL)
```

Official docs are ingested, chunked, embedded, and stored in pgvector.
Updated weekly via automated scraper jobs.
Sources: AWS docs, GCP docs, Azure docs, Kubernetes docs, Docker docs,
Terraform docs, Helm, ArgoCD, Prometheus, Grafana, GitHub Actions, GitLab CI,
Jenkins, Vault, Ansible.
