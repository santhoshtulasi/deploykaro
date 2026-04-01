# PRD — Product Requirements Document
## DeployKaro: AI Mentor-First DevOps/MLOps Learning Platform

**Version:** 1.2
**Status:** Approved for MVP
**Owner:** Product & Architecture Team

---

## 1. Vision Statement

DeployKaro is the world's first **24/7 AI mentor** for DevOps/MLOps — vernacular-native,
visual-first, grounded in official documentation, and backed by real human experts on demand.

A 10-year-old in Chennai should understand what Docker is after talking to ANNA for 5 minutes.
A senior architect should get their IaC reviewed and interview-prepped without booking a
₹5,000/hour consultant.

> We are not a practice platform. We are the mentor you never had.

---

## 2. Problem Statement

### What Is Broken Today

| Pain Point | Current Reality | User Impact |
|---|---|---|
| Long-form video fatigue | Avg DevOps course = 40–80 hours | 90% dropout before completion |
| No visual mental models | Text + terminal screenshots only | Concepts don't stick |
| English-only content | Non-native speakers struggle | Massive talent exclusion |
| No guided path | Learner lost in 500 tutorials | Decision paralysis |
| No mentor when stuck | Authors on Udemy/YouTube don't reply | User gives up alone |
| No feedback loop | Static content, no personalization | One-size-fits-all failure |
| AWS-only learning | Cloud market is multi-cloud | Senior engineers underserved |
| No architect-level guidance | Gap between engineer and architect | Career ceiling hit early |
| Expensive human mentors | ₹5,000–₹15,000/hour for expert time | Inaccessible to most |
| No career bridge | Platforms stop at "course complete" | Learner still can't get hired |

### The Core Gap
Every platform today — Udemy, YouTube, KodeKloud — gives you content.
**None of them give you a mentor.**

When you're stuck at 11pm with an error you don't understand, there is nobody to ask.
When you paste your error into a forum, you wait days for a reply.
When you want to know if your architecture is right, there's no one to tell you.

DeployKaro is that someone. Available 24/7. In your language. At every level.

### The 10-Year-Old Test
> If a 10-year-old in Chennai cannot understand what Docker is after a 5-minute conversation with ANNA — we have failed.

### The Architect Test
> If a senior architect cannot get their Terraform reviewed and get honest interview feedback without paying ₹5,000 — we have failed them too.

---

## 3. Goals

### Primary Goals
- Be the mentor that answers every doubt, error, and question — 24/7, in the user's language
- Make every concept visual before it is textual — analogies first, always
- Never let a user stay stuck for more than 2 minutes
- Ground every answer in official documentation — never guess
- Support AWS, GCP, Azure, and On-Prem for experienced users
- Bridge the gap from "I finished learning" to "I got hired"

### Secondary Goals
- Build a community of regional-language DevOps/MLOps learners
- Become the default DevOps mentoring platform for Indian engineering colleges
- Become the go-to multi-cloud upskilling mentor for senior engineers and architects
- Expand to Southeast Asia (Bahasa, Filipino) in Phase 2

---

## 4. What DeployKaro Is — and Is Not

| DeployKaro IS | DeployKaro is NOT |
|---|---|
| A 24/7 AI mentor in your language | A practice sandbox / terminal platform |
| Visual concept explanations | A course with video lectures |
| Official docs-grounded answers | A static FAQ or knowledge base |
| Certification exam prep with guidance | A practice exam simulator |
| Resume review and rewriting | A job board |
| AI mock interviews (English only) | A live coding platform |
| Human expert booking (1:1 sessions) | A replacement for real-world practice |
| Career readiness tracking | A project hosting platform |

> Users practice on their own machines, their own cloud accounts, their own tools.
> DeployKaro is the mentor sitting next to them while they do it.

---

## 5. Target Audience

### Segment 1 — The Curious Kid (Age 10–17)
- School student, curious about how apps work
- Zero prior knowledge
- Learns best in Tamil / Kannada / Telugu
- Needs: Visual explanations, no jargon, patient mentor who never makes them feel stupid

### Segment 2 — The Career Switcher (Age 22–35)
- Developer wanting to add DevOps to their skillset
- Has 1–2 hours per day, needs ROI quickly
- Needs: Fast concept clarity, job-ready guidance, local slang mentor

### Segment 3 — The Regional Engineer (Age 20–30)
- Tier-2 / Tier-3 city engineer with English barrier
- Learns better in Madras Tamil or Bangalore Kannada
- Needs: Local mentor feel, relatable real-world analogies, error explanations in their language

### Segment 4 — The MLOps Newcomer (Age 25–40)
- Data scientist wanting to deploy ML models to production
- Knows Python, scared of infrastructure
- Needs: ML-to-prod pipeline visualization, step-by-step mentor guidance

### Segment 5 — The Senior DevOps/MLOps Engineer (Age 28–45)
- 3–8 years experience, primarily on one cloud
- Wants to expand to multi-cloud or deepen existing skills
- Needs: Cloud-agnostic mentoring, cross-cloud comparisons, certification prep
- Values: Speed, depth, no hand-holding on basics

### Segment 6 — The Senior DevOps/MLOps Architect (Age 32–50)
- 8+ years experience, responsible for platform and team decisions
- Needs: Architecture review, IaC guidance, interview prep for architect-level roles
- Values: Well-Architected patterns, multi-cloud design, honest peer-level feedback

---

## 6. Market Opportunity

| Market | Size |
|---|---|
| India developer population | 5M+ |
| Vernacular internet users (India) | 300M+ |
| EdTech TAM India (2025) | $10.4B |
| DevOps tooling market (global) | $12.8B |
| Global South developers (English as 2nd language) | 50M+ |
| Multi-cloud adoption (enterprises globally) | 87% of enterprises use 2+ clouds |

---

## 7. Competitive Landscape

| Feature | DeployKaro | KodeKloud | Udemy | A Cloud Guru |
|---|---|---|---|---|
| 24/7 AI mentor in regional language | ✅ | ❌ | ❌ | ❌ |
| Answers errors and doubts instantly | ✅ | ❌ | ❌ | ❌ |
| Visual-first concept explanations | ✅ | ❌ | ❌ | ❌ |
| Official docs-grounded answers | ✅ | ❌ | ❌ | ❌ |
| Multi-cloud mentoring (AWS+GCP+Azure) | ✅ | ✅ | ❌ | ✅ |
| Certification prep with mentor guidance | ✅ | ✅ | ❌ | ✅ |
| AI mock interviews | ✅ | ❌ | ❌ | ❌ |
| Resume review and guidance | ✅ | ❌ | ❌ | ❌ |
| Human expert 1:1 booking | ✅ | ❌ | ❌ | ❌ |
| Architect-level IaC guidance | ✅ | ❌ | ❌ | ❌ |
| Free tier | ✅ | ✅ | ❌ | ❌ |

---

## 8. Core Differentiators

1. **24/7 Mentor:** Answers every doubt, error, and question — no waiting, no forums
2. **Vernacular-Native:** ANNA speaks Madras Tamil slang, BHAI speaks Bangalore Kannada slang
3. **NVIDIA-Powered:** Sub-2 second responses, context-aware, personalized to experience level
4. **Never Stuck:** Mentor auto-detects confusion and intervenes within 2 minutes
5. **Docs-Grounded:** Every answer cites official documentation — never guesses
6. **Multi-Cloud:** AWS, GCP, Azure, On-Prem — one mentor, all clouds
7. **Career Bridge:** Resume → mock interviews → human expert sessions → job ready
8. **Analogy-First Always:** Every concept explained to a 10-year-old first, then scaled up

---

## 9. Cloud Platform Support

DeployKaro mentors users on any cloud. AWS is the default for beginners.

| Cloud | Mentoring Available | Target Audience |
|---|---|---|
| AWS | Full (all tracks) | Beginners → Architects |
| GCP | Full (Phase 2) | Engineers with AWS base |
| Azure | Full (Phase 2) | Engineers in Microsoft-stack orgs |
| On-Prem / Hybrid | Full (Phase 3) | Architects, platform engineers |

### Cloud Rosetta Stone
Mentor maps every concept across clouds on demand:

| Concept | AWS | GCP | Azure | On-Prem |
|---|---|---|---|---|
| Object Storage | S3 | GCS | Blob Storage | MinIO |
| Container Orchestration | EKS | GKE | AKS | Kubernetes |
| Serverless | Lambda | Cloud Run | Azure Functions | Knative |
| Managed Database | RDS | Cloud SQL | Azure Database | PostgreSQL |
| CI/CD | CodePipeline | Cloud Build | Azure DevOps | Jenkins / ArgoCD |
| Secrets Management | Secrets Manager | Secret Manager | Key Vault | HashiCorp Vault |
| IaC | CloudFormation / CDK | Deployment Manager | Bicep / ARM | Terraform |

---

## 10. Automated Testing Strategy

To ensure high quality and prevent regressions as we rapidly build features, DeployKaro will implement a robust automated testing pipeline:

- **Unit Testing:** All core utility functions, hooks, and AI prompt assembly logic will be tested using Jest / Vitest to ensure logic correctness.
- **Integration Testing:** API boundaries (Frontend to Content API, Frontend to Mentor API) will be tested automatically to ensure data contracts are respected.
- **End-to-End (E2E) Testing:** Critical user journeys (e.g., signing up, asking the AI Mentor a question, viewing diagrams) will be tested via Playwright to simulate real user interactions in the browser.
- **CI/CD Integration:** Tests will run automatically on every GitHub Pull Request. Features must pass all tests before they can be merged and deployed.

---

## 11. Out of Scope — Permanently

- Browser sandbox / terminal platform (operational complexity, not our focus)
- Hosted cloud practice environments (cost and security burden)
- Video course content (we are a mentor, not a course)
- Live instructor sessions (async AI mentor covers this)
- Mobile native app (web-responsive only in MVP)
- Hindi / Bengali / Marathi (Phase 2)
- GCP and Azure tracks (Phase 2)
- On-Prem/Hybrid tracks (Phase 3)
