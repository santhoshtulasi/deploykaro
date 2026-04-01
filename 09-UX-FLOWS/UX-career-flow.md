# UX FLOWS — Career Hub
## DeployKaro: Resume, Interview Prep, and Career Dashboard

---

## What Is the Career Hub?

The Career Hub is DeployKaro's answer to the gap between "I finished the course" and
"I got the job." It lives alongside the learning tracks and connects everything:

```
Learning Tracks → Certification Prep → Career Hub → Expert Sessions → Job Ready
```

Every platform today (Udemy, KodeKloud, YouTube) stops at "here's the content."
DeployKaro goes all the way to "here's your offer letter."

---

## Career Hub Entry

From the main dashboard, "Career" tab opens the Career Hub:

```
┌─────────────────────────────────────────────────────────────┐
│  Career Hub                                                 │
│  "From learner to hired DevOps/MLOps engineer"             │
│                                                             │
│  Your Career Readiness: ████████░░ 78%                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  📄 Resume   │  │  🎤 Interview │  │  👨‍💼 Expert   │     │
│  │  Score: 68   │  │  Score: 72   │  │  Sessions    │     │
│  │  [Review →]  │  │  [Practice →]│  │  [Book →]    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  Next recommended action:                                   │
│  "Your system design answers need work. Do a Deep Dive     │
│   mock interview focused on system design. [Start Now →]"  │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow 1 — Resume Builder / Review

### Entry
- New user: "Build my resume from scratch"
- Existing user: "Review my resume" → paste text or upload PDF

### Step 1: Target Role Setup
```
"What role are you targeting?"
[Job title input — e.g., "Senior DevOps Engineer"]

"What's your experience level?"
○ 0–2 years (Junior)
○ 2–5 years (Mid-level)
○ 5–8 years (Senior)
○ 8+ years (Architect / Staff)

"Which companies are you targeting?" (optional)
[Multi-select: Amazon, Google, Microsoft, Flipkart, Swiggy, Zepto, Startup, Other]
```

### Step 2: Resume Input
```
"Paste your resume text below, or describe your experience:"
[Large text area]

OR

[Upload PDF] (parsed automatically)

OR

[Build from scratch — I'll guide you]
```

### Step 3: AI Review Results

```
┌─────────────────────────────────────────────────────────────┐
│  Resume Review Complete                                     │
│                                                             │
│  ATS Score:      68/100  ⚠️ Needs improvement              │
│  Overall Score:  71/100                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Work Experience        ████████░░  65/100           │   │
│  │ Skills Section         ████████░░  80/100           │   │
│  │ Projects               ██████░░░░  55/100           │   │
│  │ Certifications         █████████░  90/100           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🔴 Critical fixes (3):                                    │
│  • 3 bullets have no quantification                        │
│  • Missing keywords: GitOps, SLO, incident management      │
│  • Projects section has no outcome metrics                 │
│                                                             │
│  🟡 Improvements (4):                                      │
│  • 2 bullets start with weak verbs (Worked on, Helped)     │
│  • AWS cert date missing                                   │
│  • No GitHub link                                          │
│  • DeployKaro achievements not listed                      │
│                                                             │
│  [Fix with AI Guidance →]   [Book Resume Review Expert →]  │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Fix with AI Guidance (Inline)

For each issue, mentor shows the fix inline:

```
┌─────────────────────────────────────────────────────────────┐
│  Issue: Bullet has no quantification                        │
│                                                             │
│  Your bullet:                                               │
│  "Managed CI/CD pipelines using Jenkins"                   │
│                                                             │
│  BUDDY says:                                                │
│  "Think of your resume like a product page — every feature │
│   needs to show value, not just exist. 'Managed pipelines' │
│   tells me nothing. How many? How fast? What improved?"    │
│                                                             │
│  Questions to find your numbers:                           │
│  • How many pipelines did you manage?                      │
│  • How long did builds take before/after your work?        │
│  • How many deployments per week?                          │
│                                                             │
│  Suggested rewrite:                                         │
│  "Managed 12 CI/CD pipelines in Jenkins for 8 microservices│
│   reducing average build time from 22 min to 9 min through │
│   parallel stage optimization and Docker layer caching"    │
│                                                             │
│  [Use this rewrite]  [Edit it]  [I'll write my own]        │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: JD Tailoring (Optional)
```
"Paste a job description to tailor your resume for it:"
[Text area]

→ Mentor highlights:
  ✓ Keywords you already have
  ⚠️ Keywords missing from your resume
  ❌ Requirements you don't meet yet (with study suggestions)
```

---

## Flow 2 — AI Mock Interview

### Entry
From Career Hub → "Interview Practice" → select mode

### Mode Selection Screen
```
┌─────────────────────────────────────────────────────────────┐
│  Mock Interview                                             │
│  "All sessions in English — just like the real thing"      │
│                                                             │
│  Choose your session:                                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚡ Quick Fire          15 min                       │  │
│  │  10 questions, 90 sec each. Good for daily warm-up.  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔍 Deep Dive           30 min                       │  │
│  │  5 questions with follow-up probing.                 │  │
│  │  Simulates a real technical round.                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🎯 Full Mock Interview  60 min                      │  │
│  │  Complete interview: technical + system design +     │  │
│  │  behavioral. Full scorecard at the end.              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Focus area: [All ▼]  Role level: [Senior DevOps ▼]        │
│  Company style: [General ▼]                                │
└─────────────────────────────────────────────────────────────┘
```

### Interview Screen (Active Session)
```
┌─────────────────────────────────────────────────────────────┐
│  Mock Interview — Deep Dive          ⏱ 24:30 remaining     │
│  Question 2 of 5                                            │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Interviewer:                                               │
│  "A pod in your production cluster is in CrashLoopBackOff. │
│   Walk me through exactly how you'd debug this."           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Your answer:                                               │
│  [Text input — type your answer]                           │
│                                                             │
│  OR  [🎤 Speak your answer]  ← voice input (Pro tier)      │
│                                                             │
│  [Submit Answer →]                                          │
│                                                             │
│  ⚠️ No hints available during the interview.               │
│     Save your questions for the debrief.                   │
└─────────────────────────────────────────────────────────────┘
```

### Debrief Screen (After Session)
```
┌─────────────────────────────────────────────────────────────┐
│  Interview Complete — Here's your scorecard                 │
│                                                             │
│  Overall: 72/100  |  Hiring signal: Strong Maybe           │
│                                                             │
│  Technical Accuracy      ████████░░  80                    │
│  Communication Clarity   ██████░░░░  65                    │
│  Problem-Solving         ███████░░░  75                    │
│  System Design           ██████░░░░  60                    │
│  Behavioral (STAR)       ███████░░░  70                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Question 2: CrashLoopBackOff debugging                    │
│  Rating: 🟡 Needs Work                                     │
│                                                             │
│  ✅ Strength: Correctly started with kubectl describe       │
│  ❌ Gap: Missed checking resource limits and image errors   │
│                                                             │
│  Model answer:                                              │
│  "First: kubectl describe pod <name> — read the Events     │
│   section. Second: kubectl logs <pod> --previous. Then     │
│   check: wrong image tag? Resource limits too low?         │
│   Missing ConfigMap/Secret? Liveness probe too aggressive?"│
│                                                             │
│  [Study this concept →]                                    │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Top 3 things to improve:                                  │
│  1. System design — think about scale from the start       │
│  2. Use STAR format in behavioral answers                  │
│  3. Be more concise — aim for 90-second answers            │
│                                                             │
│  [Practice Again]  [Book Expert Session]  [Study Gaps]     │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow 3 — Career Dashboard

Persistent view of career readiness over time:

```
┌─────────────────────────────────────────────────────────────┐
│  Career Dashboard                                           │
│                                                             │
│  Career Readiness Score: 78/100  ↑ +6 this week           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Interview Readiness                                │   │
│  │  Last score: 72  |  Sessions: 8  |  Trend: ↑       │   │
│  │  Weakest area: System Design                        │   │
│  │  [Practice Now]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Resume                                             │   │
│  │  Score: 68  |  Last updated: 3 days ago             │   │
│  │  Pending fixes: 3 critical, 4 improvements          │   │
│  │  [Fix Resume]                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Certifications                                     │   │
│  │  AWS SAA-C03: 78% ready  |  Target: Feb 15          │   │
│  │  [Continue Prep]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Expert Sessions                                    │   │
│  │  Last session: Jan 15 with Rahul S.                 │   │
│  │  Notes: "Focus on system design scale"              │   │
│  │  Next: Not booked  [Book Now]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Progress Timeline                                  │   │
│  │  [Chart: interview score over last 30 days]         │   │
│  │  Jan 1: 55 → Jan 8: 61 → Jan 15: 68 → Jan 22: 72  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## The Full Career Journey (How It All Connects)

```
1. Learn on DeployKaro tracks
        │
        ▼
2. AI mentor answers every doubt, error, question — 24/7
   (The thing Udemy/YouTube/KodeKloud can't do)
        │
        ▼
3. Certification prep with official docs RAG
        │
        ▼
4. Resume builder — AI reviews, rewrites, scores
        │
        ▼
5. AI mock interviews — unlimited, 24/7, English only
   Scorecard + model answers + gap analysis
        │
        ▼
6. Expert session — human senior/architect/manager
   Context-aware (they see your AI scores before the session)
   Picks up where AI left off
        │
        ▼
7. Iterate: fix gaps → practice again → book another expert session
        │
        ▼
8. Job ready — resume at 85+, interview score at 80+, cert passed
```

This is the loop no other platform has.
Udemy stops at step 1. KodeKloud stops at step 3.
DeployKaro goes all the way to step 8.
