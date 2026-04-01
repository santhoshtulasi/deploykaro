# ARCHITECTURE — System Overview
## DeployKaro: Full System Architecture

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                      │
│  Next.js 14 (App Router) + TypeScript                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Visual      │  │ Mentor Chat  │  │ Career Hub               │   │
│  │ Animations  │  │ (SSE Stream) │  │ Resume + Interview +     │   │
│  │ D3 + Framer │  │              │  │ Expert Booking           │   │
│  └─────────────┘  └──────────────┘  └──────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS / SSE
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    EDGE + GATEWAY LAYER                              │
│                                                                      │
│  CloudFront (CDN + WAF)  →  API Gateway (Auth + Rate Limit)         │
│  AWS Cognito (JWT validation)                                        │
└──────────┬───────────────────────────┬──────────────────────────────┘
           │                           │
           ▼                           ▼
┌──────────────────────────┐  ┌────────────────────────────────────────┐
│   MENTOR AI SERVICE      │  │         CONTENT SERVICE                │
│   Python + FastAPI       │  │         Node.js + Express              │
│   ECS Fargate            │  │         ECS Fargate                    │
│                          │  │                                        │
│  ┌────────────────────┐  │  │  ┌──────────────────────────────────┐ │
│  │ Persona Loader     │  │  │  │ Track / Module / Concept API     │ │
│  │ Model Router       │  │  │  │ Progress Tracking                │ │
│  │ NVIDIA NIM Client  │  │  │  │ Achievement System               │ │
│  │ RAG Context Inject │  │  │  │ User Settings                    │ │
│  │ Cache Layer        │  │  │  └──────────────────────────────────┘ │
│  │ Session Manager    │  │  │                                        │
│  └────────────────────┘  │  └────────────────────────────────────────┘
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      CAREER SERVICE                                  │
│                      Node.js + Express / ECS Fargate                 │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Resume Review    │  │ Interview Engine  │  │ Expert Marketplace│  │
│  │ ATS scoring      │  │ Question bank     │  │ Profiles + slots  │  │
│  │ Rewrite suggest  │  │ Scorecard gen     │  │ Booking + payment │  │
│  │ JD tailoring     │  │ Feedback engine   │  │ Session notes     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      DOCS RAG SERVICE                                │
│                      Python + FastAPI / ECS Fargate                  │
│                                                                      │
│  Weekly crawl → chunk → embed (nv-embedqa) → store in pgvector      │
│  Sources: AWS, GCP, Azure, K8s, Docker, Terraform, Helm, ArgoCD,    │
│  Prometheus, Grafana, GitHub Actions, GitLab CI, Jenkins, Vault,    │
│  Ansible, OpenTelemetry + all official certification exam guides     │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│                                                                      │
│  ┌─────────────────────┐    ┌──────────────────────────────────┐    │
│  │  PostgreSQL (RDS)   │    │  Redis (ElastiCache)             │    │
│  │  - Users            │    │  - Mentor response cache         │    │
│  │  - Tracks/Modules   │    │  - Session history               │    │
│  │  - Progress         │    │  - Rate limit counters           │    │
│  │  - Achievements     │    └──────────────────────────────────┘    │
│  │  - Resume profiles  │                                             │
│  │  - Interview scores │                                             │
│  │  - Expert profiles  │                                             │
│  │  - Bookings         │                                             │
│  │  - Docs chunks      │                                             │
│  │    (pgvector)       │                                             │
│  └─────────────────────┘                                             │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│                                                                      │
│  NVIDIA NIM API          → AI inference (mentor + interview + resume)│
│  AWS Cognito             → User authentication                       │
│  AWS S3 + CloudFront     → Static assets, animations, badges        │
│  Razorpay                → India payments (expert sessions + Pro)    │
│  Dodo Payments           → International payments                    │
│  Google Meet / Zoom      → Expert session video calls (external)     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Asks Mentor a Question

```
1. User types message (or pastes error) in chat UI
2. Frontend sends POST /mentor/chat (JWT + session ID + cloud context)
3. API Gateway validates JWT
4. Mentor AI Service:
   a. Load persona prompt (ANNA/BHAI/DIDI/BUDDY)
   b. Embed user question → search pgvector docs index (RAG)
   c. Rerank top results → inject relevant doc chunk into system prompt
   d. Check Redis cache for similar question
   e. Cache HIT → return cached response immediately
   f. Cache MISS → route to appropriate NVIDIA model
   g. Stream response tokens back via SSE
   h. Response includes doc citation if RAG context was used
   i. Store response in Redis cache + update session history
5. Frontend receives SSE stream → renders tokens as they arrive
6. Frontend checks for visual_trigger → plays animation if present
```

---

## Data Flow: User Completes a Concept

```
1. User clicks "Mark as Done"
2. Frontend sends POST /tracks/:id/progress
3. Content Service:
   a. Update progress in PostgreSQL
   b. Check if track is 100% complete
   c. If complete → trigger achievement check
   d. If achievement earned → generate badge, store in S3
4. Frontend receives updated progress + achievement (if any)
5. Achievement animation plays → LinkedIn share button appears
6. If Track 1 complete → Career Hub nudge shown
```

---

## Data Flow: Expert Session Booking

```
1. User browses expert marketplace → selects expert + session type
2. User declares session goal → context shared from DeployKaro profile
3. User selects time slot → payment processed (Razorpay / Dodo)
4. Booking confirmed → Google Meet link generated + sent to both parties
5. 24 hours before: reminder sent + AI mock interview nudge
6. Session runs externally (Google Meet / Zoom)
7. Post-session: user rates expert → expert fills session notes
8. Notes stored in PostgreSQL → visible in user's Career Dashboard
```

---

## Security Architecture

```
Layer 1 — Edge:       CloudFront WAF (blocks common attacks, rate limits)
Layer 2 — Gateway:    API Gateway (JWT validation, request throttling)
Layer 3 — Network:    VPC private subnets (services not publicly accessible)
Layer 4 — Service:    Security groups (least privilege, service-to-service only)
Layer 5 — Data:       RDS encryption at rest, Redis encryption in transit
Layer 6 — Secrets:    AWS Secrets Manager (no secrets in env vars or code)
Layer 7 — Auth:       Cognito (MFA available, OAuth2/OIDC compliant)
Layer 8 — Payments:   Razorpay + Dodo handle all card data (PCI DSS compliant)
                      DeployKaro never stores payment card details
```
