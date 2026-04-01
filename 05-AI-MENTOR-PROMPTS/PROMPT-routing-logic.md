# PROMPT — Model Routing Logic
## DeployKaro: How to Route Between NVIDIA NIM Models

---

## Overview

Not every query needs the most powerful (and expensive) model.
This document defines the routing logic to balance cost, speed, and quality —
including cloud context injection and architect mode routing.

---

## NVIDIA Models Available

| Model | Speed | Cost | Best For |
|---|---|---|---|
| meta/llama-3.1-405b-instruct | Slow (3–5s) | High | Complex reasoning, code generation, IaC, architecture review |
| mistralai/mistral-nemo-12b-instruct | Fast (< 1s) | Low | Simple Q&A, short responses, concept explanations |
| nvidia/nv-embedqa-e5-v5 | Very fast | Very low | Semantic search, content matching |
| nvidia/rerank-qa-mistral-4b | Fast | Low | Ranking best answer from candidates |

---

## Routing Decision Tree

```
Incoming user message
        │
        ▼
Is user in Architect Mode?
  YES → llama-3.1-405b (always)
  NO  ↓
        │
        ▼
Does it contain a repo URL, file tree, or code files?
  YES → llama-3.1-405b (repo analysis needs deep reasoning — accuracy critical)
  NO  ↓
        │
        ▼
Has user shared a repo earlier this session?
  YES → llama-3.1-405b (all follow-ups need full repo context)
  NO  ↓
        │
        ▼
Does it contain an error, stack trace, or crash output?
  YES → llama-3.1-405b (error diagnosis — wrong answer wastes user's time)
  NO  ↓
        │
        ▼
Is it a simple greeting or acknowledgment?
  YES → mistral-nemo-12b (fast, cheap)
  NO  ↓
        │
        ▼
Does it contain code, IaC, or CLI commands?
  YES → llama-3.1-405b
  NO  ↓
        │
        ▼
Is it a cross-cloud comparison question?
  YES → llama-3.1-405b (nuanced cloud differences need depth)
  NO  ↓
        │
        ▼
Is it a concept question (what is X)?
  YES → Check cache first
    Cache HIT  → Return cached response (free)
    Cache MISS → mistral-nemo-12b
  NO  ↓
        │
        ▼
Is it a complex multi-step question?
  YES → llama-3.1-405b
  NO  → mistral-nemo-12b
```

---

## Routing Implementation

```python
# routing_logic.py

SIMPLE_PATTERNS = [
    r"^(ok|okay|got it|thanks|thank you|seri|sari|nodi|babu)$",
    r"^(yes|no|yeah|nope|yep)$",
    r"^(next|continue|skip)$"
]

CODE_ERROR_PATTERNS = [
    r"error:", r"exception", r"traceback", r"failed",
    r"permission denied", r"not found", r"```",
    r"terraform", r"\.tf", r"resource \"", r"module \""
]

CROSS_CLOUD_PATTERNS = [
    r"equivalent", r"same as", r"gcp version", r"azure version",
    r"aws version", r"compare", r"difference between",
    r"migrate from", r"instead of"
]

REPO_PATTERNS = [
    r"github\.com", r"gitlab\.com", r"bitbucket",
    r"repository", r"my repo", r"my code", r"my project",
    r"file tree", r"docker-compose", r"dockerfile",
    r"package\.json", r"requirements\.txt", r"pom\.xml",
    r"services/", r"apps/"
]

ERROR_PATTERNS = [
    r"error:", r"exception", r"traceback", r"failed",
    r"permission denied", r"not found", r"enotfound",
    r"connection refused", r"timeout", r"exit code",
    r"crashloopbackoff", r"oomkilled", r"imagepullbackoff",
    r"no such file", r"cannot connect", r"refused"
]

def route_to_model(
    user_message: str,
    conversation_depth: int,
    architect_mode: bool,
    cloud_context: str,
    has_repo_context: bool = False
) -> str:
    message_lower = user_message.lower().strip()

    # Architect mode → always powerful
    if architect_mode:
        return "meta/llama-3.1-405b-instruct"

    # Repo shared → always powerful (accuracy critical)
    for pattern in REPO_PATTERNS:
        if re.search(pattern, message_lower):
            return "meta/llama-3.1-405b-instruct"

    # Repo context active this session → always powerful
    if has_repo_context:
        return "meta/llama-3.1-405b-instruct"

    # Error/stack trace → always powerful (wrong fix = wasted time)
    for pattern in ERROR_PATTERNS:
        if re.search(pattern, message_lower):
            return "meta/llama-3.1-405b-instruct"

    # Simple acknowledgments → fast cheap model
    for pattern in SIMPLE_PATTERNS:
        if re.match(pattern, message_lower):
            return "mistralai/mistral-nemo-12b-instruct"

    # Code or IaC → powerful model
    for pattern in CODE_ERROR_PATTERNS:
        if re.search(pattern, message_lower):
            return "meta/llama-3.1-405b-instruct"

    # Cross-cloud comparisons → powerful model
    for pattern in CROSS_CLOUD_PATTERNS:
        if re.search(pattern, message_lower):
            return "meta/llama-3.1-405b-instruct"

    # Long complex questions → powerful model
    if len(user_message.split()) > 30:
        return "meta/llama-3.1-405b-instruct"

    # Deep in conversation → powerful model
    if conversation_depth > 10:
        return "meta/llama-3.1-405b-instruct"

    return "mistralai/mistral-nemo-12b-instruct"
```

---

## Cloud Context Injection

Every mentor session has a `cloud_context` field set during onboarding.
This is injected into the system prompt before every request:

```python
CLOUD_CONTEXT_PROMPTS = {
    "aws": """
User's cloud context: AWS.
Use AWS service names, AWS CLI syntax, and AWS Console references.
When mentioning storage: use S3. Container registry: ECR. K8s: EKS. Serverless: Lambda.
""",
    "gcp": """
User's cloud context: GCP (Google Cloud Platform).
Use GCP service names, gcloud CLI syntax, and GCP Console references.
When mentioning storage: use GCS. Container registry: Artifact Registry. K8s: GKE. Serverless: Cloud Run.
""",
    "azure": """
User's cloud context: Microsoft Azure.
Use Azure service names, az CLI syntax, and Azure Portal references.
When mentioning storage: use Blob Storage. Container registry: ACR. K8s: AKS. Serverless: Azure Functions.
""",
    "onprem": """
User's cloud context: On-Premises / Self-Hosted.
Use open-source tooling: MinIO for storage, Harbor for container registry,
vanilla Kubernetes for orchestration, Knative for serverless, HashiCorp Vault for secrets.
Prefer Terraform for IaC, ArgoCD for GitOps.
"""
}

def build_system_prompt(persona_prompt: str, cloud_context: str, architect_mode: bool) -> str:
    cloud_injection = CLOUD_CONTEXT_PROMPTS.get(cloud_context, CLOUD_CONTEXT_PROMPTS["aws"])
    architect_injection = ARCHITECT_MODE_PROMPT if architect_mode else ""
    return f"{persona_prompt}\n\n{cloud_injection}\n\n{architect_injection}"
```

---

## Architect Mode Prompt Injection

```python
ARCHITECT_MODE_PROMPT = """
User is a Senior DevOps/MLOps Architect or Senior Engineer.
- Skip beginner analogies unless explicitly asked
- Provide production-grade recommendations with security and cost implications
- When generating IaC (Terraform/CDK/Pulumi), follow least-privilege IAM, no hardcoded secrets
- Reference Well-Architected Framework pillars when reviewing architecture
- For multi-cloud questions, compare trade-offs across AWS, GCP, and Azure objectively
- Always mention cost implications of architectural decisions
- Flag single points of failure and suggest HA alternatives
"""
```

---

## Caching Strategy

```
Cache Layer: Redis (TTL: 24 hours)
Cache Key:   hash(persona + cloud_context + normalized_question)
Cache Hit Rate Target: 60% (most concept questions repeat per cloud)

Note: cloud_context is part of the cache key — AWS and GCP answers for the
same question are cached separately.
```

---

## Cost Estimation Per User Per Day

| User Type | Avg Messages/Day | Estimated Cost |
|---|---|---|
| Free tier user | 50 messages | ~$0.02 |
| Pro user | 200 messages | ~$0.08 |
| Architect mode user | 100 messages (heavier model) | ~$0.15 |
| Power user | 500 messages | ~$0.20 |

With 60% cache hit rate, actual costs are ~40% of above estimates.
