# DeployKaro — Master Documentation Index
> *"Ek baar dekho, seedha deploy karo"*

---

## What Is This?

DeployKaro is a **visual-first, AI-mentor-driven, vernacular-native** DevOps/MLOps learning platform.
A 10-year-old in Chennai should be able to deploy a production application within 2 hours.

---

## Documentation Structure

```
deploykaro-docs/
│
├── 01-PRD/                        → Product Requirements Document
│   ├── PRD-main.md                → Full PRD with vision, goals, audience
│   ├── PRD-features.md            → Feature breakdown per module
│   └── PRD-user-stories.md        → User stories per persona
│
├── 02-PRP/                        → Product Requirement Prompts
│   ├── PRP-overview.md            → What PRP is and how to use it
│   ├── PRP-mentor-ai.md           → AI mentor behavior prompts
│   └── PRP-visual-engine.md       → Visual learning engine prompts
│
├── 03-TECH-STACK/                 → Full Technology Stack
│   ├── TECH-frontend.md           → Frontend stack decisions
│   ├── TECH-backend.md            → Backend services stack
│   ├── TECH-ai-nvidia.md          → NVIDIA NIM API integration
│   └── TECH-database.md           → Database and caching layer
│
├── 04-INFRA-STACK/                → Infrastructure Stack
│   ├── INFRA-aws-overview.md      → AWS services used
│   ├── INFRA-networking.md        → VPC, CDN, DNS setup
│   ├── INFRA-containers.md        → ECS Fargate + Docker setup
│   └── INFRA-terraform-plan.md    → IaC plan with Terraform
│
├── 05-AI-MENTOR-PROMPTS/          → All AI Persona System Prompts
│   ├── PROMPT-anna-tamil.md       → ANNA — Madras Tamil mentor
│   ├── PROMPT-bhai-kannada.md     → BHAI — Bangalore Kannada mentor
│   ├── PROMPT-didi-telugu.md      → DIDI — Telugu mentor
│   ├── PROMPT-buddy-english.md    → BUDDY — English mentor
│   └── PROMPT-routing-logic.md    → How to route between models
│
├── 06-ARCHITECTURE/               → System Architecture Docs
│   ├── ARCH-system-overview.md    → Full system architecture
│   ├── ARCH-api-design.md         → API contracts and endpoints
│   ├── ARCH-data-models.md        → DB schema and data models
│   └── ARCH-sequence-diagrams.md  → Key user flow sequences
│
├── 07-MVP-ROADMAP/                → Build Roadmap
│   ├── ROADMAP-phases.md          → 12-week phase breakdown
│   ├── ROADMAP-week-by-week.md    → Detailed weekly tasks
│   └── ROADMAP-dependencies.md    → What blocks what
│
├── 08-RISK-AND-METRICS/           → Risks and KPIs
│   ├── RISK-register.md           → All risks with mitigation
│   └── METRICS-kpis.md            → KPIs and success criteria
│
├── 09-UX-FLOWS/                   → User Experience Flows
│   ├── UX-onboarding-flow.md      → New user journey
│   ├── UX-learning-flow.md        → In-track learning flow
│   └── UX-mentor-chat-flow.md     → Mentor interaction flow
│
├── 10-MONETIZATION/               → Business Model
│   ├── MONETIZATION-tiers.md      → Free/Pro/Teams/Enterprise
│   └── MONETIZATION-unit-econ.md  → Unit economics and projections
│
└── 11-LOCAL-DEV/                  → Local Development Setup (Zero AWS)
    └── LOCAL-DEV-prerequisites.md → Tools, ports, env vars, open-source replacements
```

---

## Quick Start for Builders

1. Read `01-PRD/PRD-main.md` — understand the vision
2. Read `03-TECH-STACK/` — understand what we're building with
3. Read `04-INFRA-STACK/` — understand how it's deployed
4. Read `05-AI-MENTOR-PROMPTS/` — understand the AI core
5. Read `07-MVP-ROADMAP/ROADMAP-phases.md` — understand what to build first

---

## Core Principle

> If a 10-year-old cannot deploy an app after 2 hours on this platform — we have failed.