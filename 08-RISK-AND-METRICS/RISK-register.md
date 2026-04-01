# RISK REGISTER
## DeployKaro: All Risks with Mitigation Plans

---

## Risk Scoring

- **Probability:** Low (1) / Medium (2) / High (3)
- **Impact:** Low (1) / Medium (2) / High (3) / Critical (4)
- **Score:** Probability × Impact

---

## Risk Register

### RISK-001: Local Language Feels Fake or Cringe
**Probability:** High (3) | **Impact:** Critical (4) | **Score:** 12

**Description:**
AI-generated Madras Tamil or Bangalore Kannada slang may sound unnatural,
forced, or offensive to native speakers, destroying trust immediately.

**Mitigation:**
- Hire 2 native speakers per language as QA reviewers before launch
- Community feedback button on every mentor message ("This sounds wrong 🚩")
- A/B test slang intensity (Light/Medium/Heavy) — let users choose
- Never auto-translate formal language — all slang written by humans first, AI follows
- Monthly slang review sessions with native speaker panel

**Contingency:** If slang QA fails, launch English-only first, add languages in Phase 2.

---

### RISK-002: User Gets Stuck, Loses Confidence, Leaves
**Probability:** High (3) | **Impact:** Critical (4) | **Score:** 12

**Description:**
A beginner hits an error on their own machine, pastes it to the mentor,
mentor doesn't explain it clearly enough, user feels stupid and never returns.

**Mitigation:**
- Auto-detect inactivity > 120 seconds → mentor proactively checks in
- Every pasted error triggers a structured explanation: what it means + exact fix + why it works
- Normalize errors in all mentor responses ("This happens to everyone!")
- Never show raw technical jargon without a plain-language translation first
- "Explain differently" button always visible — mentor tries a new analogy

**Contingency:** If stuck rate > 20%, add "Talk to a human" button → WhatsApp support or expert booking.

---

### RISK-003: NVIDIA API Costs Spiral at Scale
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:**
At 10K+ users, NVIDIA API costs could become unsustainable if not managed.
Architect mode users hit the expensive model more frequently.

**Mitigation:**
- Redis cache for common Q&A (target 60% cache hit rate, keyed by cloud_context)
- Route simple queries to Mistral Nemo (10x cheaper than Llama 405B)
- Daily message budget per free user (50 messages/day hard limit)
- Architect mode available on Pro/Teams tier only (cost offset by subscription revenue)
- Monitor cost per user daily — alert when daily cost exceeds $50 threshold

**Contingency:** If costs exceed budget, reduce free tier to 20 messages/day.

---

### RISK-004: Content Becomes Outdated (DevOps Tools Change Fast)
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:**
Docker, Kubernetes, AWS/GCP/Azure APIs and CLIs change frequently.
Mentor gives outdated commands or service names, breaking user trust.

**Mitigation:**
- RAG pipeline crawls official docs weekly — mentor answers always reflect current docs
- Version all track content like software (Track 1 v1.0, v1.1, etc.)
- Community flag system: "This answer seems outdated 🚩" on every mentor response
- Each concept shows "Last verified: [date]" badge
- Dedicated content maintainer role after 1K users

**Contingency:** Dedicated content maintainer per cloud after 1K users.

---

### RISK-005: Mentor Too Simple for Advanced Users
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:**
Experienced engineers and architects feel talked down to, leave for more technical resources.

**Mitigation:**
- Expert mode toggle: removes analogies, goes straight to technical depth
- Skill snapshot at onboarding routes advanced users to harder tracks directly
- Architect mode: IaC generation, architecture review, no hand-holding
- Mentor detects technical vocabulary in user messages → matches their level automatically
- Track 6 (Multi-Cloud Architect) designed specifically for senior users

---

### RISK-006: Low Day-7 Retention
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:**
Users complete Track 1 but don't return for Track 2, defeating the platform's purpose.

**Mitigation:**
- End of Track 1: mentor shows "Your next challenge" with a compelling hook
- Day 2 and Day 7 email/push reminders (personalized, in user's language)
- Streak system with visual streak counter
- Career Hub surfaced after Track 1 — "now let's get you hired"
- Community leaderboard (optional, opt-in)

---

### RISK-007: Multi-Cloud Mentor Accuracy
**Probability:** High (3) | **Impact:** High (3) | **Score:** 9

**Description:**
GCP, Azure, and On-Prem mentor answers may have subtle inaccuracies — wrong CLI flags,
outdated service names — that erode trust with senior users who know the platform well.

**Mitigation:**
- RAG pipeline grounds every answer in official docs — reduces hallucination significantly
- Each cloud track reviewed by a certified practitioner before launch
- Cloud Rosetta Stone table reviewed quarterly against official docs
- Community flag: "This is wrong for GCP 🚩" on every mentor response
- Mentor always cites official doc source — user can verify instantly

**Contingency:** If GCP/Azure accuracy is low, delay those tracks and launch AWS-only.

---

### RISK-008: Architect Mode AI Hallucination on IaC
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:**
Mentor generates Terraform or CDK code with security holes, wrong configurations,
or deprecated syntax — and a senior architect applies it to production.

**Mitigation:**
- All IaC output includes a prominent disclaimer: "Review before applying to production"
- Mentor always explains each generated block — no silent code dumps
- Generated IaC runs through static analysis (tfsec / checkov) before display
- Architect mode users are senior enough to review — mentor explicitly encourages this
- Generated code targets well-known, stable resource types only

**Contingency:** If hallucination rate is high, switch to IaC explanation mode only (explain existing code, don't generate).

---

### RISK-009: Expert Quality on Marketplace
**Probability:** Medium (2) | **Impact:** Critical (4) | **Score:** 8

**Description:**
A verified expert gives poor, incorrect, or unprofessional advice in a 1:1 session.
User paid ₹999–₹2,999 and got nothing useful. Trust in the platform destroyed.

**Mitigation:**
- Trial session before going live: every expert does 1 session with DeployKaro team
- Strict rating system: below 4.5 → warning, below 4.0 → suspended
- 3 no-shows → permanent removal
- Post-session notes mandatory — accountability mechanism
- Refund policy: if user rates session 1–2 stars, automatic refund review triggered
- Expert onboarding includes: what good feedback looks like, what to avoid

**Contingency:** If expert quality issues persist, move to invite-only expert model (curated, not open marketplace).

---

### RISK-010: AI Mock Interview Feedback Accuracy
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:**
AI gives incorrect feedback on a technical interview answer — tells user their
wrong answer was correct, or marks a correct answer as wrong. User goes into
a real interview with false confidence or false doubt.

**Mitigation:**
- Interview feedback grounded in official docs RAG — not just model knowledge
- Model answers for every question reviewed by senior engineers before shipping
- User can flag any feedback: "I think this is wrong" → reviewed by content team
- Confidence calibration: mentor never says "you're ready" unless score is consistently > 80%
- Human expert sessions positioned as the final validation before real interviews

**Contingency:** If feedback accuracy complaints exceed 5%, add human review layer for model answers.

---

### RISK-011: Certification Prep Inaccuracy
**Probability:** Medium (2) | **Impact:** Critical (4) | **Score:** 8

**Description:**
Mentor gives wrong certification exam guidance — incorrect answer explanations,
outdated exam domains, or wrong service behavior. User fails exam after trusting the platform.

**Mitigation:**
- All certification content grounded in official exam guides (RAG-ingested)
- Exam guides re-ingested whenever AWS/GCP/Azure/CNCF updates them
- Practice questions reviewed by certified practitioners before shipping
- Mentor always cites official doc source on every cert answer
- Disclaimer shown in cert mode: "Always cross-check with official exam guide"

**Contingency:** If cert pass rate drops below 60%, pause cert mode and audit all content.

---

## Risk Summary Matrix

| Risk | Score | Status |
|---|---|---|
| RISK-001: Fake slang | 12 | 🔴 Critical — address before launch |
| RISK-002: User gets stuck | 12 | 🔴 Critical — address before launch |
| RISK-007: Multi-cloud accuracy | 9 | 🔴 High — cloud practitioner review required |
| RISK-009: Expert quality | 8 | 🔴 High — trial session + strict rating system |
| RISK-011: Cert prep inaccuracy | 8 | 🔴 High — official docs RAG + practitioner review |
| RISK-003: API costs | 6 | 🟡 Medium — monitor from day 1 |
| RISK-004: Outdated content | 6 | 🟡 Medium — weekly RAG crawl covers this |
| RISK-006: Low retention | 6 | 🟡 Medium — career hub hook at Track 1 end |
| RISK-008: IaC hallucination | 6 | 🟡 Medium — disclaimer + static analysis |
| RISK-010: Interview feedback accuracy | 6 | 🟡 Medium — RAG-grounded + human flag |
| RISK-005: Too simple for advanced | 4 | 🟢 Low — expert + architect mode covers this |
