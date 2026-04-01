# MONETIZATION — Pricing Tiers
## DeployKaro: Business Model and Pricing

---

## Pricing Tiers

### Free Tier — "Curious"
**Price:** ₹0 / $0 forever

**Includes:**
- Track 1: "My First Deploy" (complete, AWS default)
- 50 mentor messages per day
- 10 certification practice questions per day
- Shared sandbox environment (sessions reset after 2 hours)
- Community access (Discord)
- "First Deployer" achievement badge
- Cloud Rosetta Stone view (read-only, no sandbox for other clouds)
- Certification diagnostic (1 free diagnostic per certification)

**Limits:**
- No access to Tracks 2–6
- No voice mentor
- No persistent sandbox (resets every session)
- No architect mode
- AWS cloud context only
- No personalized study plan (free diagnostic shows score only)

---

### Pro Tier — "Builder"
**Price:** ₹499/month | $6/month
**Annual:** ₹3,999/year | $48/year (save 33%)

**Includes everything in Free, plus:**
- All 6 learning tracks (including Track 6: Multi-Cloud Architect)
- Unlimited mentor messages
- All cloud contexts: AWS, GCP, Azure, On-Prem
- Private persistent sandbox (your files saved between sessions)
- Multi-cloud CLI sandbox: `aws`, `gcloud`, `az`, `kubectl`, `terraform` pre-installed
- Architect mode: IaC generation, architecture review, cross-cloud migration planner
- **Certification mode (full):** all supported certs, unlimited practice questions, personalized study plan, weak area tracking, mock exams, readiness scoring
- **Official docs RAG:** every mentor answer grounded in and citing official documentation
- Certification achievement badges (shareable to LinkedIn)
- Voice mentor in regional language (TTS/STT)
- Priority sandbox (no queue)
- LinkedIn-shareable certificates for all tracks
- Multi-cloud proficiency badges
- Download track content as PDF for offline reference
- "Connect your own cloud" (bring your own AWS/GCP/Azure account to sandbox)
- Email support (48-hour response)

---

### Teams Tier — "Squad"
**Price:** ₹2,999/month | $36/month (per 5 users)
**Additional users:** ₹499/user/month

**Includes everything in Pro, plus:**
- Team admin dashboard (track all members' progress across all clouds)
- Bulk user onboarding (CSV import)
- Custom learning path creation (reorder tracks, set cloud context per team)
- Team leaderboard and achievements
- Dedicated Slack/WhatsApp support channel
- Monthly progress report (PDF) for each team member
- Invoice billing (GST invoice for Indian companies)
- Architect mode for all team members
- Team-wide cloud context setting (e.g., "our team uses GCP")

**Target:** Engineering colleges, bootcamps, small tech teams, DevOps guilds

---

### Enterprise Tier — "Platform"
**Price:** Custom (contact sales)

**Includes everything in Teams, plus:**
- White-label platform (your company branding)
- Custom vernacular personas (your company's branded mentor)
- Custom tracks (your company's specific tech stack and internal tools)
- On-premise NVIDIA deployment option (for data-sensitive orgs)
- SSO integration (SAML/OIDC)
- SLA: 99.9% uptime guarantee
- Dedicated customer success manager
- Quarterly business reviews
- Custom cloud context (e.g., private cloud, hybrid setups)
- Bulk architect mode licenses for senior engineering teams

**Target:** Large enterprises, government training programs, ISPs, cloud consulting firms

---

## Payment Infrastructure

```
India:          Razorpay (UPI, cards, net banking, EMI)
International:  Dodo Payments (cards, global payment methods)
Invoicing:      Zoho Invoice (GST-compliant for India)
```

---

## Free-to-Pro Conversion Strategy

**Trigger points for upgrade prompts:**
1. User tries to access Track 2 → "Upgrade to Pro to continue"
2. User hits 50 message limit → "You've used all your messages today"
3. User's sandbox resets → "Save your work with Pro"
4. User earns Track 1 badge → "Unlock 5 more tracks and badges"
5. User asks a GCP/Azure question → "Switch cloud context with Pro"
6. Senior user tries architect mode → "Unlock IaC generation and architecture review with Pro"

**Upgrade prompt tone (ANNA):**
```
"Machan, Track 2 unlock pannanum-na Pro plan edukanum!
₹499 la — oru biryani price la — 6 tracks, AWS + GCP + Azure sandbox,
Architect mode, unlimited Anna chat! Worth it da! 🔥"
```

**Upgrade prompt tone (BUDDY — senior user):**
```
"You're asking the right questions. Architect mode gives you IaC generation,
architecture review, and multi-cloud sandbox — all for $6/month.
Less than a coffee. Unlock it now."
```

---

## Revenue Projections

| Month | Free Users | Pro Users | Teams Seats | MRR (INR) |
|---|---|---|---|---|
| Month 3 (Beta) | 500 | 25 | 0 | ₹12,475 |
| Month 6 | 2,000 | 120 | 20 | ₹69,880 |
| Month 12 | 10,000 | 600 | 100 | ₹3,49,400 |
| Month 18 | 30,000 | 2,000 | 400 | ₹11,98,000 |
| Month 24 | 80,000 | 6,000 | 1,500 | ₹34,44,000 |

**Assumptions:**
- 6% free-to-pro conversion rate
- 2% monthly churn on Pro
- Teams tier adds ~20% revenue on top of Pro from Month 9
- Senior engineer / architect segment (Segments 5 & 6) converts at 15% (higher intent, higher willingness to pay)
- Multi-cloud tracks drive Pro upgrades from senior users who hit the cloud context paywall
