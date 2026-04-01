# PRD — User Stories
## DeployKaro: Stories Per Persona

---

## Persona 1 — Curious Kid (Age 10–17)

### US-001: Language Selection
**As a** 12-year-old Tamil-speaking student,
**I want to** choose Tamil as my learning language,
**So that** I can understand DevOps concepts without struggling with English.

**Acceptance Criteria:**
- Language selection shown on first screen, before any content
- Tamil option shows Madras slang preview so user knows what to expect
- Selection persists across sessions

---

### US-002: Visual Concept Introduction
**As a** 10-year-old with no coding background,
**I want to** see an animation that explains what a server is,
**So that** I understand it before I have to type any commands.

**Acceptance Criteria:**
- Animation plays automatically when concept loads
- Animation uses a real-world analogy (restaurant kitchen)
- No technical jargon appears until Layer 2
- User can replay animation with one click

---

### US-003: Stuck Detection
**As a** 13-year-old who got confused by an error message,
**I want** the mentor to automatically notice I'm stuck,
**So that** I don't have to figure out how to ask for help.

**Acceptance Criteria:**
- If no user action for 120 seconds, mentor sends a check-in message
- Mentor message is in the user's chosen language/slang
- Mentor offers 3 options: explain again / show visually / skip for now

---

## Persona 2 — Career Switcher (Age 22–35)

### US-004: Fast Track Selection
**As a** developer with 1 hour per day,
**I want to** see exactly how long each track takes,
**So that** I can plan my learning without wasting time.

**Acceptance Criteria:**
- Each track shows estimated time prominently (e.g., "2 hours")
- Track shows what job skills it unlocks
- User can resume exactly where they left off

---

### US-005: Expert Mode
**As a** developer who already knows basic Linux,
**I want to** skip the beginner analogies,
**So that** I can get to the technical content faster.

**Acceptance Criteria:**
- "Expert mode" toggle available in settings
- Expert mode removes analogies, shows direct technical explanations
- User can switch back to normal mode at any time

---

### US-006: Real Project Deploy
**As a** developer who wants to show employers I can deploy,
**I want to** deploy my own project (not a tutorial project),
**So that** I have a real portfolio item.

**Acceptance Criteria:**
- Capstone module allows user to input their own GitHub repo URL
- Mentor guides through deploying that specific project
- User gets a live URL they own
- LinkedIn-shareable certificate generated

---

## Persona 3 — Regional Engineer (Age 20–30)

### US-007: Bangalore Kannada Mentor
**As an** engineer from Bangalore who thinks in Kannada,
**I want** the mentor to explain concepts in Bangalore Kannada slang,
**So that** it feels like learning from a friend, not a textbook.

**Acceptance Criteria:**
- BHAI persona uses words like: guru, nodi, swalpa, haege, bekagide
- Analogies reference Bangalore-specific things (Darshini hotel, BMTC bus, tech park)
- Slang intensity can be adjusted (light / heavy dialect slider)
- Native Kannada speakers have QA-approved the slang

---

### US-008: Error in Local Language
**As a** regional engineer who gets confused by English error messages,
**I want** the mentor to explain terminal errors in my language,
**So that** I understand what went wrong and how to fix it.

**Acceptance Criteria:**
- Every terminal error triggers an automatic mentor explanation
- Explanation is in the user's chosen language
- Explanation includes: what went wrong + why + how to fix it
- Fix is shown as a command the user can copy-paste

---

## Persona 4 — MLOps Newcomer (Age 25–40)

### US-009: ML Model Deployment Visualization
**As a** data scientist who has never deployed anything,
**I want to** see a visual diagram of how my ML model goes from Jupyter notebook to a live API,
**So that** I understand the full pipeline before I start.

**Acceptance Criteria:**
- Interactive diagram shows: Notebook → Python script → Docker → API → Cloud
- Each step is clickable to expand details
- Diagram updates as user completes each step
- Mentor explains each arrow in the diagram

---

### US-010: Monitoring Dashboard Setup
**As an** MLOps newcomer,
**I want** the mentor to guide me through setting up Prometheus and Grafana,
**So that** I can monitor my deployed model without reading 10 different docs.

**Acceptance Criteria:**
- Step-by-step guided setup in sandbox
- Visual shows what each metric means in plain language
- Pre-built Grafana dashboard template provided
- Mentor explains each panel in the dashboard

---

## Persona 5 — Senior DevOps/MLOps Engineer (Age 28–45)

### US-013: Cloud-Agnostic Track Selection
**As a** senior DevOps engineer with 5+ years on AWS,
**I want to** choose a GCP or Azure learning track,
**So that** I can expand my multi-cloud skills without re-learning basics.

**Acceptance Criteria:**
- Cloud selector shown during onboarding for users with 3+ years experience
- Tracks available for AWS, GCP, Azure, and On-Prem/Hybrid
- Mentor adapts all CLI examples and service names to selected cloud
- Concept mapping shown (e.g., "S3 on AWS = GCS on GCP = Blob Storage on Azure")

---

### US-014: Advanced Sandbox with Real Cloud CLI
**As a** senior engineer,
**I want** the sandbox to have `gcloud`, `az`, and `kubectl` pre-installed,
**So that** I can practice real multi-cloud commands without local setup.

**Acceptance Criteria:**
- Sandbox detects user's selected cloud and pre-loads the correct CLI tools
- Credentials are injected automatically for sandbox cloud accounts
- User can switch cloud context mid-session
- All commands run against real (sandboxed, time-limited) cloud accounts

---

### US-015: Bring Your Own Infrastructure
**As a** senior engineer who already has a cloud account,
**I want to** connect my own AWS/GCP/Azure account to the sandbox,
**So that** I can practice on my real infrastructure.

**Acceptance Criteria:**
- "Connect your cloud" option in Pro/Teams tier settings
- Supports AWS IAM role assumption, GCP service account, Azure service principal
- Mentor warns before any destructive operations
- Read-only mode available for safe exploration

---

## Persona 6 — Senior DevOps/MLOps Architect (Age 32–50)

### US-016: Architecture Review Mode
**As a** DevOps architect designing a platform for my team,
**I want** the mentor to review my architecture diagram and suggest improvements,
**So that** I can validate my design decisions before implementation.

**Acceptance Criteria:**
- User can upload or describe an architecture (text or diagram)
- Mentor provides structured feedback: security gaps, cost optimizations, scalability concerns
- Feedback references Well-Architected Framework (AWS) or equivalent (GCP, Azure)
- Mentor suggests alternative patterns with visual comparisons

---

### US-017: IaC Generation and Review
**As an** architect who needs to onboard a team to Terraform,
**I want** the mentor to generate and explain Terraform modules for my stack,
**So that** my team can learn IaC in the context of our actual infrastructure.

**Acceptance Criteria:**
- Mentor generates Terraform/Pulumi/CDK code for described infrastructure
- Each resource block is explained inline in plain language
- Code is cloud-provider-specific based on user's selected cloud
- Generated code follows security best practices (no hardcoded secrets, least privilege IAM)

---

### US-018: Team Learning Path Creation
**As an** architect responsible for upskilling a 20-person team,
**I want to** create a custom learning path for my team's specific stack,
**So that** everyone learns the tools we actually use, not generic tutorials.

**Acceptance Criteria:**
- Teams tier allows custom track ordering and content selection
- Architect can add custom concepts (internal tools, company-specific workflows)
- Team progress visible in admin dashboard
- Completion reports exportable for HR/management

---

## Platform-Wide Stories

### US-011: Achievement Sharing
**As any** user who completes a track,
**I want to** share my achievement badge on LinkedIn,
**So that** I can show employers my new skills.

**Acceptance Criteria:**
- One-click LinkedIn share button after track completion
- Badge image generated with user name and track name
- Certificate PDF downloadable
- Shareable URL for the achievement

---

### US-012: Parent Dashboard
**As a** parent of a 12-year-old using the platform,
**I want to** see my child's progress and time spent,
**So that** I know they are learning safely and productively.

**Acceptance Criteria:**
- Parent account linkable to child account
- Dashboard shows: tracks completed, time spent, badges earned
- No personal data of child exposed beyond progress metrics
- Weekly email summary available

---

### US-019: Cross-Cloud Concept Mapping
**As any** user switching from one cloud to another,
**I want to** see a side-by-side comparison of equivalent services,
**So that** I can leverage what I already know.

**Acceptance Criteria:**
- "Cloud Rosetta Stone" view available in all tracks
- Maps services across AWS ↔ GCP ↔ Azure ↔ On-Prem
- Mentor can be asked "What's the GCP equivalent of Lambda?" at any time
- Visual diagram shows the mapping with brief description of key differences
