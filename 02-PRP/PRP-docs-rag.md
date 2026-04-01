# PRP — Official Documentation RAG Pipeline
## DeployKaro: Grounding the Mentor in Official Docs

---

## Why RAG on Official Docs

The mentor must never guess on technical facts.
Cloud services change. CLI flags change. Pricing changes. Exam domains change.
The only source of truth is official documentation.

RAG (Retrieval-Augmented Generation) lets the mentor:
- Answer questions grounded in the actual current docs
- Cite the exact source so users can verify
- Stay accurate even when the AI's training data is outdated
- Give certification-accurate answers that match what the exam tests

---

## Documentation Sources Ingested

### Cloud Platforms
| Platform | Docs URL | Update Frequency |
|---|---|---|
| AWS | docs.aws.amazon.com | Weekly crawl |
| GCP | cloud.google.com/docs | Weekly crawl |
| Azure | learn.microsoft.com/azure | Weekly crawl |

### Container & Orchestration
| Tool | Docs URL | Update Frequency |
|---|---|---|
| Kubernetes | kubernetes.io/docs | Weekly crawl |
| Docker | docs.docker.com | Weekly crawl |
| Helm | helm.sh/docs | Weekly crawl |
| ArgoCD | argo-cd.readthedocs.io | Weekly crawl |

### IaC & Config Management
| Tool | Docs URL | Update Frequency |
|---|---|---|
| Terraform | developer.hashicorp.com/terraform | Weekly crawl |
| HashiCorp Vault | developer.hashicorp.com/vault | Weekly crawl |
| Ansible | docs.ansible.com | Weekly crawl |
| Pulumi | www.pulumi.com/docs | Weekly crawl |

### CI/CD
| Tool | Docs URL | Update Frequency |
|---|---|---|
| GitHub Actions | docs.github.com/actions | Weekly crawl |
| GitLab CI/CD | docs.gitlab.com/ee/ci | Weekly crawl |
| Jenkins | www.jenkins.io/doc | Weekly crawl |

### Observability
| Tool | Docs URL | Update Frequency |
|---|---|---|
| Prometheus | prometheus.io/docs | Weekly crawl |
| Grafana | grafana.com/docs | Weekly crawl |
| OpenTelemetry | opentelemetry.io/docs | Weekly crawl |

### Certification Exam Guides (Official)
| Cert | Source | Update Frequency |
|---|---|---|
| All AWS certs | aws.amazon.com/certification | On exam guide update |
| All GCP certs | cloud.google.com/certification | On exam guide update |
| All Azure certs | learn.microsoft.com/certifications | On exam guide update |
| CKA/CKAD/CKS | training.linuxfoundation.org | On curriculum update |
| Terraform Associate | developer.hashicorp.com/certifications | On exam guide update |

---

## Ingestion Pipeline

```python
# services/docs-rag/ingestion.py

CHUNK_SIZE = 512        # tokens per chunk
CHUNK_OVERLAP = 64      # overlap between chunks for context continuity
EMBED_MODEL = "nvidia/nv-embedqa-e5-v5"
EMBED_INPUT_TYPE = "passage"  # "passage" for indexing, "query" for search

async def ingest_doc_source(source: DocSource):
    """Crawl, chunk, embed, and store a documentation source."""

    # 1. Crawl
    pages = await crawl_docs(source.url, max_pages=source.max_pages)

    for page in pages:
        # 2. Clean — strip nav, footer, ads, keep content only
        content = clean_html(page.html)

        # 3. Chunk — split by heading hierarchy first, then by token count
        chunks = chunk_by_headings(content, max_tokens=CHUNK_SIZE, overlap=CHUNK_OVERLAP)

        for chunk in chunks:
            # 4. Embed
            embedding = await get_embedding(chunk.text, input_type=EMBED_INPUT_TYPE)

            # 5. Store in pgvector
            await db.docs_chunks.upsert({
                "id": hash(source.name + page.url + chunk.index),
                "source": source.name,           # e.g. "kubernetes"
                "platform": source.platform,     # e.g. "cncf"
                "url": page.url,
                "section": chunk.heading_path,   # e.g. "Concepts > Workloads > Pods"
                "text": chunk.text,
                "embedding": embedding,
                "last_updated": now()
            })
```

---

## Retrieval Pipeline

```python
# services/mentor-ai/app/services/rag.py

async def retrieve_doc_context(
    user_question: str,
    cloud_context: str,        # filter by platform
    certification: str | None, # filter by cert-relevant docs
    top_k: int = 5
) -> list[DocChunk]:

    # 1. Embed the user question
    query_embedding = await get_embedding(user_question, input_type="query")

    # 2. Semantic search in pgvector
    # Filter by platform if cloud_context is set
    platform_filter = CLOUD_TO_PLATFORM_MAP.get(cloud_context)

    raw_results = await db.execute("""
        SELECT id, source, platform, url, section, text,
               1 - (embedding <=> $1::vector) AS similarity
        FROM docs_chunks
        WHERE ($2::text IS NULL OR platform = $2)
        ORDER BY embedding <=> $1::vector
        LIMIT 20
    """, query_embedding, platform_filter)

    # 3. Rerank top 20 → return top_k
    reranked = await rerank_results(
        query=user_question,
        passages=[r.text for r in raw_results]
    )

    return [raw_results[r.index] for r in reranked[:top_k]]


async def build_rag_context(chunks: list[DocChunk]) -> str:
    """Format retrieved chunks for injection into system prompt."""
    if not chunks:
        return ""

    context_parts = []
    for chunk in chunks:
        context_parts.append(
            f"Source: {chunk.source} | {chunk.section}\n"
            f"URL: {chunk.url}\n"
            f"Content: {chunk.text}\n"
        )

    return "RELEVANT OFFICIAL DOCUMENTATION:\n" + "\n---\n".join(context_parts)
```

---

## Citation Format in Mentor Responses

When the mentor uses RAG context, it must cite the source in every response:

```
📖 Source: [Platform/Tool] Docs > [Section Path]
   [URL]
```

Examples:
```
📖 Source: AWS Docs > Amazon S3 > User Guide > Storage Classes
   https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html

📖 Source: Kubernetes Docs > Concepts > Workloads > Pod Lifecycle
   https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/

📖 Source: Terraform Docs > Language > State
   https://developer.hashicorp.com/terraform/language/state
```

---

## Database Schema for Docs Chunks

```sql
CREATE TABLE docs_chunks (
    id          TEXT PRIMARY KEY,
    source      TEXT NOT NULL,        -- "kubernetes", "aws", "terraform"
    platform    TEXT NOT NULL,        -- "cncf", "aws", "hashicorp"
    url         TEXT NOT NULL,
    section     TEXT NOT NULL,        -- "Concepts > Workloads > Pods"
    text        TEXT NOT NULL,
    embedding   vector(1024) NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON docs_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX ON docs_chunks (platform);
CREATE INDEX ON docs_chunks (source);
```

---

## Staleness Detection

```python
# Weekly job: check if docs have changed since last crawl
async def check_doc_staleness():
    for source in ALL_DOC_SOURCES:
        latest_hash = await fetch_doc_hash(source.url)
        stored_hash = await db.get_doc_hash(source.name)

        if latest_hash != stored_hash:
            await queue_reingest(source)
            await notify_team(f"Docs updated: {source.name} — re-ingesting")
```

Stale docs are flagged in the UI:
```
⚠️ This content was last verified against official docs on [DATE].
   Some details may have changed. [View official docs →]
```

---

## Local Dev: Docs RAG Without Crawling

For local development, a seed dataset of pre-chunked docs is provided:

```bash
# Seed local pgvector with sample docs chunks
docker-compose run --rm docs-rag python seed_local_docs.py

# This loads ~500 pre-embedded chunks covering:
# - Core Kubernetes concepts
# - Core Docker concepts
# - AWS S3, EC2, IAM basics
# - Terraform fundamentals
```

Full crawl only runs in production/staging environments.
