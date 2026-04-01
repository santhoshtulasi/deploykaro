# ROADMAP — Dependencies
## DeployKaro: What Blocks What

---

## Dependency Graph

```
Local Dev Stack (docker-compose)
    │
    ├──► PostgreSQL (local) ──────────────────► Content Service DB
    │
    ├──► Redis (local) ──────────────────────► Mentor AI Caching
    │
    ├──► Keycloak (local) ───────────────────► Auth in Frontend
    │
    └──► MinIO (local) ──────────────────────► Asset Storage

    [All of the above mirror production cloud services 1:1]

NVIDIA API Key ──────────────────────────────► Mentor AI Service
    │                                               │
    └──► Local NVIDIA Mock ──────────────────► Offline Dev + CI Tests
                                                    │
                                                    ▼
Mentor AI Service Running ──────────────────► Chat UI Integration
    │
    ├──► Cloud Context Injection ────────────► Multi-Cloud Mentor Responses
    │
    └──► SSE Streaming Working ──────────────► Frontend Chat Component

Content Service Running ────────────────────► Track/Progress APIs
    │
    └──► Database Seeded ────────────────────► Track 1 Content Visible

Track 1 Content Visible ────────────────────► Visual Animation System
    │
    └──► Animation Assets (MinIO/S3) ────────► Visual Trigger System

Visual Trigger System ──────────────────────► 3-Layer Concept Viewer
    │
    └──► Cloud Rosetta Stone Component ──────► Multi-Cloud Content Variants

3-Layer Concept Viewer ─────────────────────► Progress Tracking UI
    │
    └──► Progress Tracking UI ───────────────► Achievement System

xterm.js Integration ───────────────────────► WebContainers Integration
    │
    └──► Multi-Cloud CLI Pre-install ────────► Cloud Sandbox Integration
                                                    │
                                                    ├──► AWS Sandbox → Real S3 Deploy
                                                    ├──► GCP Sandbox → Real GCS Deploy (Phase 2)
                                                    └──► Azure Sandbox → Real Blob Deploy (Phase 2)

Senior Onboarding Path ─────────────────────► Expert Mode Toggle
    │
    └──► Architect Role Detection ───────────► Architect Mode UI
                                                    │
                                                    ├──► IaC Generation Prompt
                                                    └──► Architecture Review Feature
```

---

## Hard Blockers (Cannot Start Without)

| Task | Blocked By |
|---|---|
| Any backend development | Local docker-compose stack running |
| NVIDIA integration | NVIDIA API key obtained |
| Offline dev/CI | Local NVIDIA mock server built |
| Frontend auth | Keycloak configured (local) / Cognito (production) |
| Content APIs | PostgreSQL running + Prisma migrations applied |
| Mentor chat | NVIDIA integration + persona prompts written |
| Visual animations | Design assets created (SVG/Lottie files) |
| Multi-cloud mentor responses | Cloud context injection hook in mentor service |
| Cloud Rosetta Stone | Content mapping table written for all 4 clouds |
| Real cloud deploy flow | Cloud sandbox account provisioning system |
| GCP/Azure tracks | Cloud Rosetta Stone content complete |
| Architect mode | Senior onboarding path + IaC generation prompts written |
| Kannada QA | Native Kannada speaker reviewer engaged |

---

## Parallel Work Streams

```
Stream A (Backend):     Mentor AI Service + NVIDIA integration + cloud context injection
Stream B (Backend):     Content Service + Database schema + multi-cloud content variants
Stream C (Frontend):    UI shell + Auth + Onboarding flow (including senior path)
Stream D (Design):      Animation assets (SVG/Lottie) + Cloud Rosetta Stone diagrams
Stream E (Content):     Track 1 content writing (all languages + cloud variants)
Stream F (DevOps):      Local docker-compose stack + production IaC (Terraform)
Stream G (Architect):   IaC generation prompts + architecture review prompt design
```

---

## External Dependencies and Lead Times

| Dependency | Lead Time | Owner |
|---|---|---|
| NVIDIA API key | 1–2 days (sign up at build.nvidia.com) | Tech Lead |
| AWS account setup | 1 day | DevOps |
| GCP account setup (Phase 2) | 1 day | DevOps |
| Azure account setup (Phase 2) | 1 day | DevOps |
| Domain registration (deploykaro.com) | 1 day | Product |
| SSL certificate | 1 day (DNS validation) | DevOps |
| Native language QA reviewers | 1 week to find and onboard | Product |
| Animation designer | 1 week to brief and start | Design |
| Senior engineer beta testers (for architect mode QA) | 1 week to recruit | Product |
| Cloud Rosetta Stone content review (per cloud) | 2 days per cloud | Senior DevOps reviewer |
