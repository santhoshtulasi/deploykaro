# METRICS — KPIs and Success Criteria
## DeployKaro: How We Measure Success

---

## North Star Metric

> **% of new users who successfully deploy an app within 2 hours of signing up**

**Target:** 70%
**Industry baseline:** ~8% course completion rate on traditional platforms
**Measurement:** Track from signup timestamp to first successful deploy event (any cloud)

---

## Tier 1 KPIs (Review Weekly)

### 1. Time to First Deploy (TTFD)
**Definition:** Time from account creation to first successful app deployment
**Target:** < 90 minutes (median)
**Alert threshold:** > 120 minutes median → investigate immediately
**Measurement:** `deploy_success` event - `account_created` timestamp

---

### 2. Day-7 Retention
**Definition:** % of users who return and complete at least one concept on Day 7
**Target:** > 45%
**Industry baseline:** ~15% for online learning platforms
**Measurement:** Cohort analysis in PostHog

---

### 3. Mentor Satisfaction Score
**Definition:** Average thumbs up/(thumbs up + thumbs down) ratio per mentor response
**Target:** > 85% overall, > 80% for architect mode, > 88% for certification mode (higher bar — wrong cert prep is harmful)
**Alert threshold:** < 70% for any persona or mode → review prompts immediately
**Measurement:** Feedback events logged per message

---

### 4. Concept Clarity Rate
**Definition:** % of concepts where user does NOT click "Explain differently"
**Target:** > 85%
**Alert threshold:** Any single concept with < 60% clarity → rewrite that concept
**Measurement:** "Explain differently" click events per concept

---

### 5. Sandbox Error Recovery Rate
**Definition:** % of terminal errors where user successfully recovers and continues
**Target:** > 80%
**Measurement:** Error event followed by successful next command within 5 minutes

---

### 6. Certification Pass Rate
**Definition:** % of users who attempt a certification exam after completing DeployKaro cert prep and pass on first attempt
**Target:** > 75% (industry average for self-study is ~50%)
**Why it matters:** This is the ultimate proof that the platform works for senior users
**Measurement:** User self-reports exam result via in-app prompt sent 30 days after cert prep completion
**Alert threshold:** < 60% → review certification content and practice question quality

---

## Tier 2 KPIs (Review Monthly)

### 7. Regional Language Adoption
**Definition:** % of users who choose Tamil, Kannada, or Telugu over English
**Target:** > 40% of Indian users
**Measurement:** Language selection events at onboarding

---

### 8. Track Completion Rate
**Definition:** % of users who start a track and complete it
**Target:** > 60% (vs industry avg of 8%)
**Measurement:** Track start event vs track complete event per user

---

### 9. Multi-Cloud Adoption Rate
**Definition:** % of users who select GCP, Azure, or On-Prem as their cloud context
**Target:** > 25% of users with 3+ years experience
**Measurement:** Cloud context selection events at onboarding + cloud switches mid-session

---

### 10. Architect Mode Engagement
**Definition:** % of architect/senior engineer users who use architect mode features
**Target:** > 50% of users who unlock architect mode
**Measurement:** `architect_mode_feature_used` events per eligible user

---

### 11. Certification Mode Engagement
**Definition:** % of Pro users who activate certification mode for at least one cert
**Target:** > 35% of Pro users
**Why it matters:** Cert prep is a high-value, high-retention feature
**Measurement:** `certification_mode_activated` events per Pro user

---

### 12. Certification Readiness Score Progression
**Definition:** Average improvement in readiness score from first diagnostic to mock exam
**Target:** > 20 percentage points improvement
**Example:** User starts at 55% readiness → reaches 78% before exam
**Measurement:** `cert_readiness_score` tracked per session per user

---

### 13. RAG Citation Quality Score
**Definition:** % of mentor responses in certification mode that include a valid doc citation
**Target:** > 90% (certification answers must always be grounded in official docs)
**Alert threshold:** < 80% → review RAG pipeline and prompt injection
**Measurement:** `doc_reference` field presence in certification mode responses

---

### 14. Docs Freshness Score
**Definition:** % of ingested doc chunks that are less than 14 days old
**Target:** > 95%
**Alert threshold:** < 90% → check crawl jobs, re-trigger ingestion
**Measurement:** `last_updated` field in docs_chunks table

---

### 15. Net Promoter Score (NPS)
**Definition:** Standard NPS survey (0–10 scale)
**Target:** > 60 overall, > 70 for certification mode users
**Frequency:** After Track 1 completion, after first cert prep session, after exam result reported
**Measurement:** In-app survey + email survey

---

### 16. NVIDIA API Cost Per User Per Day
**Definition:** Total NVIDIA API spend / active users / day
**Target:** < $0.05 per free user, < $0.15 per architect/cert mode user
**Alert threshold:** > $0.10 per free user → review caching and routing
**Measurement:** Custom metric from API response logs

---

### 17. Cache Hit Rate
**Definition:** % of mentor queries served from Redis cache
**Target:** > 60%
**Note:** Cache keyed by cloud_context + certification — track hit rates per context
**Measurement:** Redis cache hit/miss counters

---

## Funnel Metrics

```
Landing Page Visit
    │ Conversion target: 15%
    ▼
Sign Up
    │ Conversion target: 80%
    ▼
Complete Onboarding (language + persona + cloud + role)
    │ Conversion target: 90%
    ▼
Start Track 1
    │ Conversion target: 70%
    ▼
Complete First Concept
    │ Conversion target: 85%
    ▼
Complete Track 1
    │ Conversion target: 60%
    ▼
First Successful Deploy
    │ Conversion target: 70% of Track 1 completers
    ▼
Start Track 2
    │ Conversion target: 50%
    ▼
[Senior users] Activate Certification Mode
    │ Conversion target: 35% of Pro users
    ▼
Complete Certification Prep (≥80% readiness)
    │ Conversion target: 55% of cert mode users
    ▼
Pass Certification Exam (self-reported)
    │ Target: 75% of users who complete prep
    ▼
Pro Upgrade (paid)
    Conversion target: 8% of Track 2 starters, 20% of architect/cert mode users
```

---

## Analytics Stack

```
Product Analytics:    PostHog (self-hosted, privacy-compliant)
Error Monitoring:     Sentry (frontend + backend)
Infrastructure:       CloudWatch (production) / Grafana + Loki (local dev)
Business Metrics:     Custom Grafana dashboard (connected to PostgreSQL)
A/B Testing:          PostHog feature flags
Certification Tracking: Custom cert_progress table in PostgreSQL
```

---

## Event Tracking Schema

```javascript
// Account events
posthog.capture('account_created', { language, persona, referral_source })
posthog.capture('onboarding_completed', { language, persona, skill_level, cloud_context, role })

// Learning events
posthog.capture('track_started', { track_id, track_slug, cloud_context })
posthog.capture('concept_viewed', { concept_id, track_id, time_on_page_secs })
posthog.capture('concept_completed', { concept_id, track_id })
posthog.capture('explain_differently_clicked', { concept_id, persona })
posthog.capture('track_completed', { track_id, total_time_secs })
posthog.capture('cloud_context_switched', { from_cloud, to_cloud })

// Mentor events
posthog.capture('mentor_message_sent', { persona, language, cloud_context, architect_mode, certification_mode })
posthog.capture('mentor_response_received', { model_used, cached, response_time_ms, rag_chunks_used })
posthog.capture('mentor_feedback', { message_id, rating: 'up' | 'down' })
posthog.capture('doc_reference_clicked', { platform, section, url })

// Certification events
posthog.capture('certification_mode_activated', { certification, current_readiness })
posthog.capture('diagnostic_completed', { certification, overall_readiness, weak_areas })
posthog.capture('practice_question_answered', { certification, domain, correct, time_taken_secs })
posthog.capture('mock_exam_completed', { certification, score, domains_breakdown })
posthog.capture('cert_readiness_milestone', { certification, readiness: 0.8 })  // 80% threshold
posthog.capture('exam_result_reported', { certification, passed, attempts: 1 })  // self-reported

// Architect mode events
posthog.capture('architect_mode_feature_used', { feature: 'iac_gen' | 'arch_review' | 'migration_planner' })
posthog.capture('iac_generated', { cloud_context, iac_type: 'terraform' | 'cdk' | 'pulumi' })

// Deploy events
posthog.capture('sandbox_command_run', { command_type, success, cloud_context })
posthog.capture('deploy_success', { track_id, deploy_type, cloud: 'aws' | 'gcp' | 'azure' | 'onprem' })

// Achievement events
posthog.capture('achievement_earned', { achievement_slug })
posthog.capture('achievement_shared', { achievement_slug, platform: 'linkedin' })
```
