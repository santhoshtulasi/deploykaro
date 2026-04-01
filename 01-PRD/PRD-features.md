# PRD — Feature Breakdown
## DeployKaro: All Features Per Module

---

## Module 1 — Visual Learning Engine ("See It, Get It")

### Description
Every concept is explained through a 2-layer visual system before the mentor
guides the user through applying it on their own machine.

### 2-Layer Visual System

**Layer 1: Real World Analogy (Animated)**
- Animated SVG or Lottie animation showing a real-world parallel
- Example: Docker = Tiffin Box animation (food packed, carried, opened fresh anywhere)
- No technical words in Layer 1
- User watches, understands the mental model

**Layer 2: Technical Mapping (Interactive Diagram)**
- Same animation morphs into the technical concept
- User can click each component to expand and explore
- Mentor explains each part on click
- Example: Tiffin box → App + Dependencies packed in container image

**After Layer 2: Mentor Guides Self-Practice**
- Mentor gives the exact command to run on the user's own machine
- User runs it locally, pastes output or errors back to mentor
- Mentor explains every line of output, fixes every error
- No sandbox needed — user's own laptop is the practice environment

### Visual Components Required
- Animated SVG concept maps (D3.js + Framer Motion)
- Interactive infrastructure diagrams (drag-and-drop capable)
- Real-time pipeline flow visualizations
- X-Ray mode: hover any infra component to see internals
- Cloud Rosetta Stone view: side-by-side AWS ↔ GCP ↔ Azure ↔ On-Prem mapping

---

## Module 2 — AI Mentor ("ANNA / BHAI / DIDI / BUDDY")

### Description
The core of DeployKaro. NVIDIA NIM-powered conversational AI mentor with distinct
regional personas. Available 24/7. Answers every doubt, error, and question.
Speaks in local slang, uses local analogies, never lets a user stay stuck.

### Mentor Personas

| Persona | Language | Slang Style | Local Analogies |
|---|---|---|---|
| ANNA (அண்ணா) | Madras Tamil | machan, da, pa, solren | auto, biryani, cricket, tiffin |
| BHAI | Bangalore Kannada | guru, nodi, swalpa, bekagide | Darshini hotel, BMTC bus, tech park |
| DIDI | Telugu | babu, chala, ante emi, easy | Hyderabad biryani, RTC bus |
| BUDDY | English | Simple, friendly, 12-yr-old level | Universal analogies |

### Mentor Capabilities
- **Doubt answering:** Any concept question answered instantly, analogy-first
- **Error explanation:** User pastes any error → mentor explains in plain language + gives fix
- **Context-aware:** Remembers last 50 interactions per session
- **Confusion detection:** Detects when user is stuck, auto-intervenes at 2 minutes
- **Cloud context:** Adapts all answers to user's selected cloud (AWS/GCP/Azure/On-Prem)
- **Cross-cloud mapping:** "What's the GCP equivalent of Lambda?" answered instantly
- **Official docs grounding:** Every factual answer cites official documentation
- **IaC guidance:** Generates and explains Terraform/CDK/Pulumi (Architect mode)
- **Architecture review:** Reviews described or uploaded architecture, flags issues
- **Difficulty adaptation:** Detects expertise level, adjusts depth automatically
- **"Explain like I'm 10" mode:** Always available — one button, any concept, any level
- **Voice I/O:** Regional language voice input and output (Phase 2)

### Mentor Behavior Rules
- Analogy first — always, for everyone, at every level
- Max 4 sentences for concept explanations
- Always end with a clear next action
- Never shame errors — always normalize mistakes
- Never guess on technical facts — cite official docs or say "let me verify"
- If user inactive for 2 minutes: proactive check-in in their language

---

## Module 3 — Learning Tracks

Structured learning paths that the mentor guides users through.
Each track is a conversation-driven journey — not a video course.
The mentor explains, the user asks questions, the mentor adapts.

### Track 1: "My First Deploy" (Target: 2 hours) — AWS Default
| Step | Concept | Visual Analogy | Mentor Action |
|---|---|---|---|
| 1 | What is software? | Lego blocks | Explains, answers questions |
| 2 | What is a server? | Restaurant kitchen | Explains, answers questions |
| 3 | What is the internet? | Post office network | Explains, answers questions |
| 4 | What is cloud? | Renting a kitchen vs owning one | Explains, answers questions |
| 5 | How does deployment work? | Putting a poster on a billboard | Explains step-by-step |
| 6 | Guide user through their first deploy | — | Mentor guides on user's own machine |
| Achievement | "First Deployer" badge | — | LinkedIn shareable |

### Track 2: "Container Wizard" (Target: 4 hours)
| Step | Concept | Visual Analogy | Mentor Action |
|---|---|---|---|
| 1 | What is Docker? | Tiffin box | Explains, answers questions |
| 2 | Dockerfile | Recipe card | Explains, guides user to write one |
| 3 | Docker build | Cooking the recipe | Guides, explains output |
| 4 | Docker run | Opening the tiffin | Guides, explains output |
| 5 | Container Registry | Recipe sharing website | Explains push/pull flow |
| Achievement | "Container Wizard" badge | — | LinkedIn shareable |

> Cloud note: Registry = ECR (AWS) / Artifact Registry (GCP) / ACR (Azure)

### Track 3: "Pipeline Builder" (Target: 6 hours)
| Step | Concept | Visual Analogy | Mentor Action |
|---|---|---|---|
| 1 | What is CI/CD? | Factory assembly line | Explains, answers questions |
| 2 | GitHub Actions / Cloud Build / Azure DevOps | Robot worker | Guides through writing workflow |
| 3 | Automated tests | Quality check station | Explains, guides setup |
| 4 | Auto-deploy on push | Finished product ships automatically | Guides end-to-end |
| Achievement | "Pipeline Builder" badge | — | LinkedIn shareable |

### Track 4: "Kubernetes Tamer" (Target: 8 hours)
| Step | Concept | Visual Analogy | Mentor Action |
|---|---|---|---|
| 1 | What is Kubernetes? | Orchestra conductor | Explains, answers questions |
| 2 | Pods | Musicians in orchestra | Explains, guides kubectl commands |
| 3 | Deployments | Sheet music (desired state) | Explains, guides YAML writing |
| 4 | Services | Concert stage | Explains networking concepts |
| 5 | Scaling | Adding more musicians | Explains HPA, guides config |
| 6 | Managed K8s | Real orchestra hall | Guides EKS/GKE/AKS setup |
| Achievement | "K8s Tamer" badge | — | LinkedIn shareable |

### Track 5: "MLOps Engineer" (Target: 10 hours)
| Step | Concept | Visual Analogy | Mentor Action |
|---|---|---|---|
| 1 | What is MLOps? | Factory for AI models | Explains pipeline concept |
| 2 | Package ML model | Putting model in a box | Guides FastAPI wrapper |
| 3 | Containerize model | Docker for ML | Guides Dockerfile for model |
| 4 | Deploy model API | Model goes live | Guides cloud deployment |
| 5 | Monitor model | Health check dashboard | Explains Prometheus + Grafana setup |
| Achievement | "MLOps Engineer" badge | — | LinkedIn shareable |

### Track 6: "Multi-Cloud Architect" (Target: 12 hours) — Senior/Architect Tier
| Step | Concept | Visual Analogy | Mentor Action |
|---|---|---|---|
| 1 | Cloud-agnostic design principles | Blueprint that works in any city | Explains, discusses trade-offs |
| 2 | Terraform fundamentals | Universal remote control | Guides HCL writing, explains state |
| 3 | Multi-cloud networking | Highways between cities | Explains VPC/VNet peering |
| 4 | Identity federation | One passport, many countries | Explains IAM + OIDC federation |
| 5 | GitOps with ArgoCD | Self-healing factory | Explains GitOps principles |
| 6 | Cost optimization | Comparing electricity bills | Reviews user's architecture for cost |
| 7 | Architecture review | Peer review of a blueprint | Mentor reviews user's design |
| Achievement | "Cloud Architect" badge | — | LinkedIn shareable |

---

## Module 4 — Progress and Achievement System

### Features
- Per-track progress bar
- Concept mastery indicators (green = understood, yellow = needs review)
- Achievement badges (shareable to LinkedIn)
- Parent dashboard (for users under 18) showing progress
- Streak tracking (daily learning streaks)
- Multi-cloud proficiency badges (e.g., "AWS + GCP Bilingual" badge)
- Certification readiness badges ("AWS SAA-C03 Ready")

---

## Module 5 — Onboarding and Personalization

### 3–5 Question Skill Snapshot (60–90 seconds)
1. "Have you written any code before?" → Yes / No
2. "Have you heard of Docker?" → Yes / No / What's Docker?
3. "What do you want to achieve?" → Free text

### For Experienced Users (3+ years detected)
4. "Which cloud do you primarily work on?" → AWS / GCP / Azure / On-Prem / Multiple
5. "What's your role?" → Engineer / Senior Engineer / Architect / Team Lead

### Output
- Personalized track recommendation
- Mentor persona auto-selected based on language preference
- Difficulty level set for first concept
- Cloud context injected into mentor session
- Architect mode unlocked if role = Architect / Team Lead
- Career Hub surfaced immediately for senior users

---

## Module 6 — Architect Mode (Senior/Architect Tier)

### Features
- Architecture diagram upload and review (PNG, draw.io, Mermaid)
- Mentor provides structured feedback against Well-Architected Framework principles
- IaC generation: describe infrastructure in plain language → get Terraform/CDK/Pulumi
- Cross-cloud migration planner: "I'm on AWS, help me plan a GCP migration"
- Team learning path builder: create custom track sequences for your team
- Cost estimation: mentor estimates monthly cloud cost for described architecture
- Security posture review: mentor flags IAM, network, and secrets issues in IaC

---

## Module 7 — Certification Prep

### Features
- Diagnostic assessment: 10 questions → domain-by-domain readiness score
- Personalized study plan based on weak areas + target exam date
- Concept-by-concept mentoring with exam tip after every topic
- Official docs citation on every answer (RAG-grounded)
- Practice questions: user answers first, mentor explains after
- Weak area tracking: mentor revisits gaps automatically
- Mock exam: full-length timed simulation
- Exam-day readiness check

### Supported Certifications
- AWS: CLF-C02, SAA-C03, DVA-C02, SOA-C02, DOP-C02, SAP-C02
- GCP: ACE, PCA, Professional Cloud DevOps Engineer, Professional Data Engineer
- Azure: AZ-900, AZ-104, AZ-204, AZ-400, AZ-305
- Tools: CKA, CKAD, CKS, Terraform Associate, Vault Associate, Docker DCA, Prometheus PCA, ArgoCD Associate

---

## Module 8 — Career Hub

### Resume Guidance
- AI reviews resume: ATS score, content score, section-by-section feedback
- Rewrites weak bullets with quantification and impact framing
- Tailors resume to a specific job description
- Builds resume from scratch via conversation (for career switchers)
- Integrates DeployKaro track completions as portfolio evidence

### AI Mock Interviews (English only)
- Quick Fire (15 min): 10 questions, 90 seconds each
- Deep Dive (30 min): 5 questions with follow-up probing
- Full Mock (60 min): technical + system design + behavioral
- Company-specific prep: Amazon, Google, Microsoft, Flipkart, Swiggy, etc.
- Role-specific: Junior / Mid / Senior / Architect / Manager
- Full scorecard: technical accuracy, communication, system design, behavioral
- Model answers for every question
- Communication coaching: structure, confidence, conciseness

### Human Expert Sessions (1:1 Booking)
- Verified senior DevOps/MLOps engineers, architects, and managers
- Context-aware: expert sees user's AI scores and progress before session
- Session types: mock interview, architecture review, resume review, career advice
- Priced at ₹699–₹2,999 per session (expert sets price, 15% platform fee)
- Rating system: experts below 4.5 warned, below 4.0 suspended
- Post-session notes from expert visible in user's Career Dashboard

### Career Dashboard
- Career readiness score (composite of resume + interview + cert scores)
- Interview score trend over time
- Expert session history and notes
- Next recommended action (always one clear thing to do next)
