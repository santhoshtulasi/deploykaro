# MVP ROADMAP — Phase Breakdown
## DeployKaro: 12-Week Build Plan + Post-MVP

---

## Phases Overview

```
Week 1–3:   Foundation (Auth + NVIDIA Mentor Chat + Basic UI)
Week 4–6:   Core Learning (Track 1 + Visual Engine + Multi-Cloud Groundwork)
Week 7–9:   Career Hub (Resume + AI Mock Interview + Expert Marketplace)
Week 10–12: Language + Polish + Architect Mode Beta + Beta Launch
```

---

## Phase 1 — Foundation (Weeks 1–3)

**Goal:** Working app with auth, NVIDIA mentor chat, basic UI shell.

### Week 1 — Project Setup
- [ ] Initialize Next.js 14 project (TypeScript, Tailwind, shadcn/ui)
- [ ] Set up monorepo structure (frontend + mentor-ai service + content service)
- [ ] Create `docker-compose.yml` with full local dev stack:
  - PostgreSQL (`postgres:16-alpine`)
  - Redis (`redis:7-alpine`)
  - Keycloak (auth — mirrors Cognito in production)
  - MinIO (object storage — mirrors S3 in production)
  - Kong OSS (API gateway)
- [ ] Run initial Prisma migrations against local PostgreSQL
- [ ] Configure GitHub Actions CI pipeline (lint + test + build)
- [ ] Document: "Run locally in 5 minutes" guide in README

**Deliverable:** Full local dev stack running with `docker-compose up`.

---

### Week 2 — NVIDIA Integration + Mentor Chat
- [ ] Build FastAPI mentor-ai service skeleton
- [ ] Integrate NVIDIA NIM API (llama-3.1-405b + mistral-nemo)
- [ ] Build local NVIDIA mock server for offline development
- [ ] Implement ANNA persona system prompt
- [ ] Build model routing logic (with cloud context injection hook)
- [ ] Implement Redis caching for mentor responses
- [ ] Build SSE streaming endpoint (/v1/mentor/chat)
- [ ] Build basic chat UI (message input + streaming response display)

**Deliverable:** Working mentor chat with ANNA persona, streaming responses.

---

### Week 3 — Content Service + User Onboarding
- [ ] Build Express content service skeleton
- [ ] Implement all content API endpoints
- [ ] Seed database with Track 1 content (My First Deploy)
- [ ] Build 3-question onboarding flow UI
- [ ] Build extended onboarding for experienced users (cloud selector + role selector)
- [ ] Build language + persona selection screen
- [ ] Connect onboarding to user profile (PostgreSQL)
- [ ] Production: Deploy both services to ECS Fargate

**Deliverable:** User can sign up, pick ANNA/Tamil, complete onboarding, see Track 1.

---

## Phase 2 — Core Learning (Weeks 4–6)

**Goal:** Full Track 1 with visual animations, progress tracking, multi-cloud groundwork.

### Week 4 — Visual Animation System
- [ ] Build visual animation component system (Framer Motion)
- [ ] Create 3 concept animations: software (Lego), server (kitchen), internet (post office)
- [ ] Build visual trigger system (mentor emits trigger → frontend plays animation)
- [ ] Build 2-layer concept viewer (Analogy → Technical Mapping)
- [ ] Build Cloud Rosetta Stone component (AWS ↔ GCP ↔ Azure ↔ On-Prem side-by-side)
- [ ] Store animation assets in MinIO (local) / S3+CloudFront (production)

**Deliverable:** First 3 concepts fully animated. Cloud Rosetta Stone component built.

---

### Week 5 — Track 1 Full Content + Mentor Error Handling
- [ ] Create remaining concept animations (Docker tiffin, object storage warehouse, deploy flow)
- [ ] Build track progress UI (progress bar, concept checklist)
- [ ] Implement progress tracking API integration
- [ ] Build concept navigation (previous/next, jump to concept)
- [ ] Build "paste your error" flow — user pastes error → mentor explains + fixes
- [ ] Add cloud-agnostic content variants (AWS default, GCP/Azure stubs for Phase 2)

**Deliverable:** Track 1 fully navigable. Error paste-and-explain flow working.

---

### Week 6 — Achievement System + Expert Mode
- [ ] Build achievement badge generation (MinIO local / S3 production)
- [ ] Build achievement reveal animation
- [ ] Implement LinkedIn share flow
- [ ] Build user dashboard (tracks, progress, badges)
- [ ] Add streak tracking
- [ ] Build "Expert mode" toggle (removes analogies, direct technical content)
- [ ] Build senior user onboarding path (cloud selector + role → architect mode unlock)

**Deliverable:** User completes Track 1, earns badge. Expert mode and senior path working.

---

## Phase 3 — Career Hub (Weeks 7–9)

**Goal:** Resume guidance, AI mock interviews, and human expert marketplace.

### Week 7 — Resume Guidance
- [ ] Build resume input UI (paste text or describe experience)
- [ ] Implement AI resume review (ATS score, section scores, issue detection)
- [ ] Build inline rewrite suggestion flow (per bullet)
- [ ] Build JD tailoring feature (paste JD → keyword gap analysis)
- [ ] Build resume builder from scratch (conversation-driven)
- [ ] Integrate DeployKaro track completions as portfolio evidence in resume

**Deliverable:** User can paste resume, get scored, get AI-rewritten bullets.

---

### Week 8 — AI Mock Interviews
- [ ] Build interview mode selection UI (Quick Fire / Deep Dive / Full Mock)
- [ ] Implement interviewer persona (English only — hard constraint)
- [ ] Build interview session UI (question display + text answer input)
- [ ] Implement post-interview scorecard (domain scores + model answers)
- [ ] Build communication coaching feedback (structure, confidence, conciseness)
- [ ] Build "study this concept" link from scorecard → learning track

**Deliverable:** User can do a full mock interview and get a detailed scorecard.

---

### Week 9 — Expert Marketplace
- [ ] Build expert profile schema + onboarding flow (apply → verify → go live)
- [ ] Build expert marketplace UI (browse, filter, profile page)
- [ ] Build pre-booking session goal declaration + context sharing
- [ ] Build slot selection + calendar UI
- [ ] Integrate Razorpay (India) + Dodo Payments (international)
- [ ] Build post-session notes flow (expert fills in → visible to user)
- [ ] Build Career Dashboard (readiness score, all scores in one view)

**Deliverable:** User can browse experts, book a session, pay, and receive post-session notes.

---

## Phase 4 — Language + Polish + Architect Mode (Weeks 10–12)

**Goal:** Kannada persona, mobile responsive, architect mode beta, beta launch.

### Week 10 — BHAI Kannada Persona + Architect Mode
- [ ] Implement BHAI persona system prompt
- [ ] QA all Kannada slang with native speakers
- [ ] Add Kannada UI translations (i18next)
- [ ] A/B test ANNA vs BHAI response quality
- [ ] Implement slang intensity slider (Light/Medium/Heavy)
- [ ] Build Architect Mode UI: architecture review input + IaC generation panel
- [ ] Implement mentor IaC generation prompt (Terraform/CDK output)
- [ ] Build cross-cloud migration planner prompt

**Deliverable:** Full Kannada experience. Architect mode beta with IaC generation working.

---

### Week 11 — Mobile Responsive + Performance
- [ ] Audit and fix all mobile responsive issues
- [ ] Optimize animation performance on mobile
- [ ] Implement lazy loading for animation assets
- [ ] Run Lighthouse audits, fix issues to hit > 85 score
- [ ] Test on slow 3G connection (Chrome DevTools throttling)

**Deliverable:** Platform works smoothly on mobile and slow connections.

---

### Week 12 — Beta Launch
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (PostHog — privacy-friendly)
- [ ] Write runbooks for common incidents
- [ ] Onboard 500 beta users (college students, career switchers, 50 senior engineers)
- [ ] Onboard 10 verified experts for marketplace
- [ ] Set up feedback collection (in-app + WhatsApp group)
- [ ] Monitor KPIs for first week

**Deliverable:** Beta live with 500 users + 10 experts. KPI baseline established.

---

## Post-MVP (Phase 5+)

### Phase 5 — Multi-Cloud Expansion
- GCP mentoring tracks (Tracks 2–5 with GCP variants)
- Azure mentoring tracks (Tracks 2–5 with Azure variants)
- Cloud Rosetta Stone fully populated for all services

### Phase 6 — Certification Mode Launch
- Docs RAG pipeline: ingest AWS, GCP, Azure, K8s, Docker, Terraform, Helm, ArgoCD,
  Prometheus, Grafana, GitHub Actions, GitLab CI, Jenkins, Vault, Ansible official docs
- Certification service: diagnostic, practice questions, readiness scoring, study plan
- Supported certs at launch: AWS CLF-C02, SAA-C03, DVA-C02, CKA, CKAD, Terraform Associate
- Certification mode UI: exam tip overlays, doc citation display, practice question flow
- Weak area tracking and personalized revision plan
- Exam result self-reporting + pass rate KPI tracking

### Phase 7 — Architect Track + Advanced Features
- Track 6: "Multi-Cloud Architect" (full 12-hour mentored track)
- Architecture diagram upload and review
- Team learning path builder (Teams tier)
- Remaining certs: GCP ACE, GCP PCA, AZ-900, AZ-104, AZ-400, CKS, Vault Associate,
  Docker DCA, Prometheus PCA, ArgoCD Associate

### Phase 8 — Language + Platform Expansion
- Telugu (DIDI) persona
- Hindi language support
- Voice mentor (regional language TTS/STT)
- Mobile native app (React Native)
- On-Prem/Hybrid mentoring tracks

### Phase 9 — Monetization Scale
- Pro tier payment integration (Razorpay for India + Dodo Payments for international)
- Teams tier admin dashboard
- Enterprise white-label
- Southeast Asia expansion (Bahasa, Filipino)
