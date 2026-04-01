# UX FLOWS — Onboarding
## DeployKaro: New User Journey

---

## Screen 1 — Landing Page

**URL:** deploykaro.com
**Goal:** Communicate value in 5 seconds, get user to sign up

**Above the fold:**
```
Headline:    "Deploy your first app in 2 hours."
Subheadline: "Learn DevOps with ANNA, BHAI, or BUDDY — your AI mentor
              who speaks your language. Even a 10-year-old can do this."

CTA Button:  [Start Free — No credit card needed]

Social proof: "500+ students deployed their first app this week"
```

**Value props below fold:**
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🤖 AI Mentor    │  │  📄 Resume +     │  │  👨💼 Real Experts │
│  24/7 — answers  │  │  Interview Prep  │  │  Senior DevOps/  │
│  every doubt,    │  │  AI-powered,     │  │  MLOps Architects│
│  error, question │  │  always English  │  │  Book 1:1 sessions│
│  in your language│  │  for interviews  │  │  from ₹699       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Language toggle:** EN | தமிழ் | ಕನ್ನಡ | తెలుగు (top right)

---

## Screen 2 — Sign Up

**Options:**
- Continue with Google (recommended — one click)
- Email + password

**After sign up:** Redirect to onboarding flow (Screen 3)

---

## Screen 3 — Language + Mentor Selection

**Headline:** "Who do you want to learn with?"

**Mentor cards (pick one):**

```
┌─────────────────┐  ┌─────────────────┐
│  🧑 ANNA        │  │  👨 BHAI        │
│  அண்ணா          │  │                 │
│                 │  │                 │
│  "Machan, naan  │  │  "Guru, nodi —  │
│  solren, Docker │  │  Docker andre   │
│  tiffin box     │  │  tiffin box     │
│  maari!"        │  │  tara!"         │
│                 │  │                 │
│  [Tamil]        │  │  [Kannada]      │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  👩 DIDI        │  │  🤖 BUDDY       │
│                 │  │                 │
│  "Babu, Docker  │  │  "Think of      │
│  ante tiffin    │  │  Docker like a  │
│  box laaga!"    │  │  lunchbox!"     │
│                 │  │                 │
│  [Telugu]       │  │  [English]      │
└─────────────────┘  └─────────────────┘
```

**Note shown below mentor cards:**
```
💡 Your mentor speaks your language for learning.
   Mock interviews and career sessions are always in English
   — just like real interviews.
```

**Play button on each card** → 10-second audio preview of mentor voice

---

## Screen 4 — Skill Snapshot (3–5 Questions, 60–90 seconds)

**Progress indicator:** Question 1 of 3 (or 1 of 5 for experienced users)

**Question 1:**
```
"Have you written any code before?"
○ Yes, I code regularly
○ I've tried a little
○ Never, I'm starting fresh
```

**Question 2:**
```
"Have you heard of Docker?"
○ Yes, I've used it
○ I've heard of it but never used it
○ What's Docker? (That's totally fine!)
```

**Question 3:**
```
"What do you want to achieve?"
[Free text input — placeholder: "e.g., deploy my portfolio site, learn for a job, pass AWS cert, prep for interviews"]
```

**If Q1 = "Yes, I code regularly" AND Q2 = "Yes, I've used it" → show 2 more questions:**

**Question 4:**
```
"How many years of DevOps/MLOps experience do you have?"
○ Less than 1 year
○ 1–3 years
○ 3–5 years
○ 5–8 years
○ 8+ years
```

**Question 5:**
```
"What's your primary cloud platform?"
○ AWS
○ GCP
○ Azure
○ On-Prem / Multiple
○ None yet
```

---

## Screen 5 — Personalized Recommendation

### For Beginners (Q4 not shown or < 1 year):

```
ANNA says:
"Machan! Nee perfect-a iruka! 🎉
Unakku 'My First Deploy' track perfect-a suit aagum.
2 hours la unoda first app deploy pannuvom!
Ready-a?"

[Let's Go! →]          [Show me all tracks]
```

### For Experienced Users (3+ years):

```
BUDDY says:
"You've got solid experience — let's not waste your time on basics.
Based on what you told me, here's what I'd recommend:

  🎯 Fast-track to: Container Wizard + Pipeline Builder
  ☁️  Cloud context: AWS (switch anytime)
  📝 Certification: AWS SAA-C03 looks like your next move
  🎤 Career: Your interview prep starts here too

Want to jump straight to the good stuff?"

[Start Fast Track →]   [See full roadmap]   [Go to Career Hub →]
```

### For Architects (8+ years):

```
BUDDY says:
"You're at architect level — the platform has a lot to offer you.

  🏗️  Track 6: Multi-Cloud Architect — designed for you
  🔍  Architect Mode: IaC generation, architecture review
  🎤  Interview Prep: System design + leadership rounds
  👨💼  Expert Sessions: Peer-level review from other architects

Where do you want to start?"

[Architect Track →]   [Career Hub →]   [Expert Sessions →]
```

---

## Screen 6 — First Concept (Track Begins)

**Layout (desktop):**
```
┌──────────────────┬──────────────────┬──────────────────┐
│  MENTOR CHAT     │  VISUAL          │  TERMINAL        │
│                  │  ANIMATION       │  (locked until   │
│  ANNA: "Machan,  │                  │   Layer 3)       │
│  first concept   │  [Lego blocks    │                  │
│  — what is       │   animation      │                  │
│  software?       │   playing]       │                  │
│  Paaru!"         │                  │                  │
│                  │                  │                  │
│  [Show me more]  │  [Replay]        │                  │
│  [Next concept]  │  [X-Ray mode]    │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

**Layout (mobile):**
```
Tabs: [Mentor] [Visual] [Terminal]
Active tab shown full screen
```

---

## Onboarding Completion Criteria

User has completed onboarding when:
1. Account created ✅
2. Language + mentor selected ✅
3. Skill snapshot completed ✅
4. Track recommendation accepted ✅
5. First concept animation watched ✅

**Time target:** < 5 minutes from landing page to first concept animation playing.

---

## Post-Onboarding: Career Hub Nudge (Day 3)

After 3 days of learning, a nudge appears:

```
"You've completed 3 concepts — great start! 🎉

Did you know DeployKaro also helps you get hired?
  📄 Resume review — AI scores and rewrites your resume
  🎤 Mock interviews — practice in English, 24/7
  👨💼 Expert sessions — 1:1 with senior DevOps/MLOps pros

[Explore Career Hub →]   [Keep Learning]"
```
