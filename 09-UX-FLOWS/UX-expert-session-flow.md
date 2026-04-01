# UX FLOWS — Expert Session
## DeployKaro: Human Expert Booking and Session Flow

---

## What Is an Expert Session?

A paid 1:1 video session with a verified senior DevOps/MLOps professional.
Unlike Udemy/YouTube where the author is unreachable, and unlike generic
mentorship platforms where you pay ₹5,000 to book a slot and hope for the best —
DeployKaro's expert sessions are:

- **Context-aware:** The expert sees your learning progress, AI mock interview scores,
  resume score, and weak areas before the session starts
- **Outcome-focused:** Every session has a declared goal (mock interview, architecture review,
  resume review, career advice, debugging help)
- **AI-prepared:** You arrive having already done AI mock interviews and gotten feedback —
  the human expert picks up where the AI left off
- **Affordable:** Priced at market rate but with no platform markup beyond a small fee

---

## Expert Roles Available

| Role | What They Do in Sessions |
|---|---|
| Senior DevOps Engineer (5–8 yrs) | Technical mock interviews, code/config review, debugging help |
| Senior MLOps Engineer (5–8 yrs) | MLOps pipeline review, model deployment guidance, technical mock interviews |
| DevOps/MLOps Architect (8+ yrs) | Architecture review, system design mock interviews, IaC review |
| DevOps/MLOps Engineering Manager | Career advice, leadership round mock interviews, team/role fit assessment |
| Hiring Manager (actively hiring) | Real hiring perspective, resume review, "would I hire you?" honest feedback |

---

## Screen 1 — Expert Marketplace Entry

**Entry points:**
- After AI mock interview debrief: "Ready to test yourself with a real human? Book an expert session →"
- After resume review: "Want a hiring manager to review this? Book a session →"
- From dashboard: "Career" tab → "Expert Sessions"

**Page layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Expert Sessions                                            │
│  "Get 1:1 time with senior DevOps/MLOps professionals"     │
│                                                             │
│  Filter: [Role ▼] [Availability ▼] [Price ▼] [Rating ▼]   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🧑 Rahul S.                          ⭐ 4.9 (47)    │  │
│  │  Senior DevOps Architect @ Swiggy     8 yrs exp      │  │
│  │  AWS Certified SA Pro | CKA | Terraform               │  │
│  │                                                      │  │
│  │  "I review architecture, IaC, and do system design   │  │
│  │   mock interviews. I've hired 20+ DevOps engineers." │  │
│  │                                                      │  │
│  │  Next available: Tomorrow 7pm IST                    │  │
│  │  ₹999 / 45 min    [Book Session]                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👩 Priya M.                          ⭐ 4.8 (31)    │  │
│  │  MLOps Engineer @ Zepto               6 yrs exp      │  │
│  │  GCP Professional ML Engineer | Docker               │  │
│  │                                                      │  │
│  │  "I help data scientists transition to MLOps and     │  │
│  │   prep for MLOps engineer interviews."               │  │
│  │                                                      │  │
│  │  Next available: Today 9pm IST                       │  │
│  │  ₹799 / 45 min    [Book Session]                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen 2 — Expert Profile

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Experts                                          │
│                                                             │
│  🧑 Rahul S.                                                │
│  Senior DevOps Architect @ Swiggy (8 years)                │
│                                                             │
│  Certifications: AWS SA Pro | CKA | Terraform Associate     │
│  Specializes in: System Design, IaC, K8s, AWS              │
│  Languages: English, Hindi                                  │
│  Sessions done: 47  |  Avg rating: 4.9  |  Repeat rate: 68%│
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  What I offer:                                              │
│  ✓ System design mock interviews (senior/architect level)   │
│  ✓ Architecture review with written feedback               │
│  ✓ IaC (Terraform) code review                             │
│  ✓ Career advice for senior → architect transition         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Recent reviews:                                            │
│  ⭐⭐⭐⭐⭐ "Rahul gave me feedback no AI could — he told me  │
│  exactly how a Swiggy-level interview panel thinks."        │
│  — Karthik R., hired at Dunzo after 2 sessions             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Session Types:                                             │
│  ○ Mock Interview (45 min)          ₹999                   │
│  ○ Architecture Review (45 min)     ₹999                   │
│  ○ Resume + Career Chat (30 min)    ₹699                   │
│                                                             │
│  [Book a Session →]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen 3 — Pre-Booking: Session Goal Declaration

Before booking, user declares the session goal:

```
"What do you want to get out of this session?"

○ Mock interview — I want to be grilled like a real interview
○ Architecture review — I want feedback on my design
○ Resume review — I want a hiring manager's honest take
○ Career advice — I want to discuss my career path
○ Debugging help — I'm stuck on something specific
○ Other: [free text]

"Share context with the expert (optional but recommended):"
[Auto-populated from your DeployKaro profile:]
  • AI mock interview score: 72/100 (last session: 3 days ago)
  • Weakest area: System design
  • Resume score: 68/100
  • Certifications: AWS SAA-C03 (in progress, 78% readiness)
  • Tracks completed: Container Wizard, Pipeline Builder

[Edit what to share] [Keep private]

[Confirm & Choose Time →]
```

---

## Screen 4 — Slot Selection

```
┌─────────────────────────────────────────────────────────────┐
│  Book with Rahul S.                                         │
│  Mock Interview — 45 minutes — ₹999                        │
│                                                             │
│  Select a time:                                             │
│                                                             │
│  ◀ Jan 2025 ▶                                              │
│                                                             │
│  Mon 20   Tue 21   Wed 22   Thu 23   Fri 24                │
│  7:00pm ✓  —       6:30pm ✓  —       8:00pm ✓             │
│  9:00pm ✓  —       9:00pm ✓  —       —                    │
│                                                             │
│  All times in IST. Session via Google Meet (link sent       │
│  after booking).                                            │
│                                                             │
│  [Confirm: Mon Jan 20, 7:00pm IST →]                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen 5 — Payment

```
Order Summary:
  Expert Session with Rahul S.
  Mock Interview · 45 min · Mon Jan 20, 7:00pm IST

  Session fee:     ₹999
  Platform fee:    ₹49  (5% — covers payment processing + platform)
  Total:           ₹1,048

  [Pay with UPI]  [Pay with Card]  [Pay with Net Banking]

  Cancellation policy:
  Free cancellation up to 4 hours before session.
  After that: 50% refund. No-show: no refund.
```

---

## Screen 6 — Pre-Session Prep (24 hours before)

Notification + in-app reminder:

```
"Your session with Rahul is tomorrow at 7pm IST 🎯

To make the most of it:
✓ Complete 1 AI mock interview today so Rahul has fresh data
✓ Update your resume if you've made changes
✓ Write down your top 3 questions for Rahul

Rahul has reviewed your profile:
  • AI mock score: 72 — he'll focus on system design
  • Resume: he's noted 2 things to discuss

[Start AI Mock Interview Now]  [Update Resume]  [View Session Details]"
```

---

## Screen 7 — Session (Live)

Session runs on Google Meet / Zoom (external link).
DeployKaro provides:
- Session brief sent to expert (user's progress, scores, declared goal)
- In-app timer visible to both parties
- Post-session notes template (expert fills in after session)

---

## Screen 8 — Post-Session

**Immediately after session ends:**

```
"How was your session with Rahul? ⭐"
[1] [2] [3] [4] [5]

"What did you work on?" (auto-populated from goal declaration)
"Any specific feedback for Rahul?" [text input]

[Submit Review]
```

**Expert fills in session notes (within 2 hours):**
```
Session notes for: Karthik R.
Goal: Mock Interview

Strengths observed:
- Strong on Kubernetes fundamentals
- Good debugging methodology

Areas to work on:
- System design: needs to think about scale from the start
- Communication: answers too long, needs to be more concise

Recommended next steps:
- Complete Track 6 (Multi-Cloud Architect) system design module
- Do 3 more AI mock interviews focusing on system design
- Book a follow-up session in 2 weeks

[Save Notes — visible to user]
```

**User sees expert notes in their Career Dashboard.**

---

## Expert Onboarding Flow (Supply Side)

How experts join the platform:

```
1. Apply at deploykaro.com/experts
   → LinkedIn profile + current role + certifications

2. Verification (3–5 days):
   → LinkedIn verification
   → Certification verification (AWS/GCP/Azure/CNCF portals)
   → Employment verification (optional but shown as badge)

3. Trial session:
   → 1 free session with a DeployKaro team member
   → Evaluated on: communication, feedback quality, professionalism

4. Profile goes live:
   → Expert sets their own price (₹500–₹3,000 per session)
   → Expert sets availability in calendar
   → DeployKaro takes 15% platform fee

5. Quality maintenance:
   → Rating drops below 4.5 → warning + coaching
   → Rating drops below 4.0 → suspended pending review
   → 3 no-shows → permanent removal
```
